import AsyncStorage from "@react-native-async-storage/async-storage";

export type SavedAccount = {
  id: string;
  name: string;
  email: string;
  token: string;
};

export const MAX_SAVED_ACCOUNTS = 4;

const ACCOUNTS_KEY = "miniabdullah_saved_accounts_v1";
const ACTIVE_EMAIL_KEY = "miniabdullah_active_account_email_v1";

function normalizeEmail(email: string) {
  return String(email || "")
    .toLowerCase()
    .trim();
}

async function writeActiveSession(account: SavedAccount) {
  const email = normalizeEmail(account.email);
  const token = String(account.token || "");
  const id = String(account.id || email);
  const name = String(account.name || "User");

  // multiSet can fail if any value is non-string; set explicitly.
  await AsyncStorage.setItem("token", token);
  await AsyncStorage.setItem("userEmail", email);
  await AsyncStorage.setItem("userId", id);
  await AsyncStorage.setItem("userName", name);
  await AsyncStorage.setItem(ACTIVE_EMAIL_KEY, email);

  // Verify persistence — critical for ID switch
  const saved = await AsyncStorage.getItem(ACTIVE_EMAIL_KEY);
  if (normalizeEmail(saved || "") !== email) {
    throw new Error("Failed to persist active account");
  }
}

export async function getSavedAccounts(): Promise<SavedAccount[]> {
  try {
    const raw = await AsyncStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (a) =>
          a &&
          typeof a.email === "string" &&
          typeof a.name === "string" &&
          (typeof a.token === "string" || a.token != null),
      )
      .map((a) => ({
        id: String(a.id || a.email),
        name: String(a.name),
        email: normalizeEmail(a.email),
        token: String(a.token || ""),
      }))
      .filter((a) => !!a.email);
  } catch {
    return [];
  }
}

async function saveAccounts(accounts: SavedAccount[]) {
  await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export async function getActiveAccountEmail(): Promise<string | null> {
  try {
    const fromKey = await AsyncStorage.getItem(ACTIVE_EMAIL_KEY);
    if (fromKey && fromKey.trim()) return normalizeEmail(fromKey);
    const email = await AsyncStorage.getItem("userEmail");
    return email && email.trim() ? normalizeEmail(email) : null;
  } catch {
    return null;
  }
}

/** JWT for the active account (Authorization Bearer). */
export async function getActiveAuthToken(): Promise<string | null> {
  try {
    const accounts = await ensureAccountsHydrated();
    const activeEmail = await getActiveAccountEmail();
    const fromList =
      (activeEmail && accounts.find((a) => a.email === activeEmail)) ||
      accounts.find((a) => !!a.token) ||
      null;
    if (fromList?.token?.trim()) return fromList.token.trim();

    const legacy = await AsyncStorage.getItem("token");
    return legacy && legacy.trim() ? legacy.trim() : null;
  } catch {
    return null;
  }
}

/** Stable key for per-account local data (chat, prefs, quiz). */
export async function resolveUserKey(): Promise<string> {
  try {
    const active = await getActiveAccountEmail();
    if (active) return active;
    const email = await AsyncStorage.getItem("userEmail");
    if (email?.trim()) return normalizeEmail(email);
    const id = await AsyncStorage.getItem("userId");
    if (id?.trim()) return id.trim();
  } catch {
    // ignore
  }
  return "guest";
}

/** Add or refresh an account after login/signup. Max 4 unique emails. */
export async function upsertSavedAccount(input: {
  id?: string | number;
  name: string;
  email: string;
  token: string;
}): Promise<{ ok: true; accounts: SavedAccount[] } | { ok: false; reason: "max" }> {
  const email = normalizeEmail(input.email);
  if (!email) {
    return { ok: false, reason: "max" };
  }

  const account: SavedAccount = {
    id: String(input.id || email),
    name: String(input.name || "").trim() || "User",
    email,
    token: String(input.token || ""),
  };

  let accounts = await getSavedAccounts();
  const existingIndex = accounts.findIndex((a) => a.email === email);

  if (existingIndex >= 0) {
    // Keep previous token if new one somehow empty
    if (!account.token && accounts[existingIndex].token) {
      account.token = accounts[existingIndex].token;
    }
    accounts[existingIndex] = account;
  } else {
    if (accounts.length >= MAX_SAVED_ACCOUNTS) {
      return { ok: false, reason: "max" };
    }
    accounts = [...accounts, account];
  }

  await saveAccounts(accounts);
  await writeActiveSession(account);
  return { ok: true, accounts };
}

export async function switchToAccount(email: string): Promise<boolean> {
  try {
    const targetEmail = normalizeEmail(email);
    if (!targetEmail) return false;

    const accounts = await getSavedAccounts();
    const target = accounts.find((a) => a.email === targetEmail);
    if (!target) return false;

    await writeActiveSession(target);

    // Double-check so callers can trust the result
    const active = await getActiveAccountEmail();
    return active === targetEmail;
  } catch {
    return false;
  }
}

export async function removeSavedAccount(email: string): Promise<SavedAccount[]> {
  const target = normalizeEmail(email);
  let accounts = await getSavedAccounts();
  accounts = accounts.filter((a) => a.email !== target);
  await saveAccounts(accounts);

  if (accounts.length === 0) {
    await clearSessionKeys();
    return [];
  }

  const active = await getActiveAccountEmail();
  if (!active || active === target) {
    await writeActiveSession(accounts[0]);
  }

  return accounts;
}

async function clearSessionKeys() {
  await AsyncStorage.multiRemove([
    "token",
    "userEmail",
    "userId",
    "userName",
    ACTIVE_EMAIL_KEY,
  ]);
}

/**
 * Logout current account only; returns remaining accounts.
 * If only 1 ID was saved, clears everything and returns [].
 */
export async function logoutCurrentAccount(): Promise<SavedAccount[]> {
  try {
    const accounts = await getSavedAccounts();

    // Single ID → wipe list + session so Welcome is the only next step
    if (accounts.length <= 1) {
      await saveAccounts([]);
      await clearSessionKeys();
      return [];
    }

    let active = await getActiveAccountEmail();
    if (!active) {
      active = accounts[0].email;
    }

    return await removeSavedAccount(active);
  } catch {
    try {
      await saveAccounts([]);
      await clearSessionKeys();
    } catch {
      // ignore
    }
    return [];
  }
}

/** Migrate legacy single-session keys into multi-account list once. */
export async function ensureAccountsHydrated(): Promise<SavedAccount[]> {
  const accounts = await getSavedAccounts();
  if (accounts.length > 0) return accounts;

  const [[, token], [, email], [, id], [, name]] = await AsyncStorage.multiGet([
    "token",
    "userEmail",
    "userId",
    "userName",
  ]);

  if (token && email) {
    const result = await upsertSavedAccount({
      id: id || email,
      name: name || "User",
      email,
      token,
    });
    if (result.ok) return result.accounts;
  }

  return [];
}

/** Client-side JWT exp check (no signature verify). Missing/opaque → treat as valid. */
function isJwtExpired(token: string): boolean {
  try {
    const parts = String(token || "").split(".");
    if (parts.length < 2) return false;
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    const json =
      typeof atob === "function"
        ? atob(padded)
        : Buffer.from(padded, "base64").toString("utf8");
    const payload = JSON.parse(json);
    if (typeof payload?.exp !== "number") return false;
    return payload.exp * 1000 <= Date.now();
  } catch {
    return false;
  }
}

/**
 * Active account with a usable token for cold-start restore.
 * Clears session (and empty tokens) if JWT is past exp.
 */
export async function getRestorableActiveAccount(): Promise<SavedAccount | null> {
  try {
    const accounts = await ensureAccountsHydrated();
    if (accounts.length === 0) return null;

    const activeEmail = await getActiveAccountEmail();
    let account =
      (activeEmail && accounts.find((a) => a.email === activeEmail)) ||
      accounts.find((a) => !!a.token) ||
      null;

    if (!account?.token) return null;

    if (isJwtExpired(account.token)) {
      const cleared = accounts
        .map((a) =>
          a.email === account!.email ? { ...a, token: "" } : a,
        )
        .filter((a) => !!a.token);
      await saveAccounts(cleared);
      await clearSessionKeys();
      return null;
    }

    await writeActiveSession(account);
    return account;
  } catch {
    return null;
  }
}
