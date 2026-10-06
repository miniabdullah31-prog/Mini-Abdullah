import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  AvatarId,
  isAvatarId,
  isProfileGender,
  ProfileGender,
} from "../data/avatars";
import {
  clearAllSecureTokens,
  clearSecureTokens,
  getSecureTokens,
  setSecureTokens,
  SecureTokenPair,
} from "./secureTokenStore";

export type SavedAccount = {
  id: string;
  name: string;
  email: string;
  /**
   * @deprecated Tokens live in Keychain. Optional only during migration /
   * in-memory convenience — never persisted to AsyncStorage accounts JSON.
   */
  token?: string;
  gender?: ProfileGender;
  avatarId?: AvatarId;
};

export const MAX_SAVED_ACCOUNTS = 2;

const ACCOUNTS_KEY = "miniabdullah_saved_accounts_v1";
const ACTIVE_EMAIL_KEY = "miniabdullah_active_account_email_v1";
const LEGACY_TOKEN_KEY = "token";

function normalizeEmail(email: string) {
  return String(email || "")
    .toLowerCase()
    .trim();
}

function stripTokenForStorage(account: SavedAccount): SavedAccount {
  const next: SavedAccount = {
    id: account.id,
    name: account.name,
    email: account.email,
  };
  if (account.gender) next.gender = account.gender;
  if (account.avatarId) next.avatarId = account.avatarId;
  return next;
}

async function writeActiveSession(account: SavedAccount) {
  const email = normalizeEmail(account.email);
  const id = String(account.id || email);
  const name = String(account.name || "User");

  // Non-secret session mirrors only — never write JWT here
  await AsyncStorage.setItem("userEmail", email);
  await AsyncStorage.setItem("userId", id);
  await AsyncStorage.setItem("userName", name);
  await AsyncStorage.setItem(ACTIVE_EMAIL_KEY, email);
  await AsyncStorage.removeItem(LEGACY_TOKEN_KEY);

  const saved = await AsyncStorage.getItem(ACTIVE_EMAIL_KEY);
  if (normalizeEmail(saved || "") !== email) {
    throw new Error("Failed to persist active account");
  }
}

/**
 * Parse account metadata from AsyncStorage only — never touches Keychain.
 * Keychain failures must not make valid accounts disappear.
 */
function parseAccountsFromStorage(parsed: unknown): {
  accounts: SavedAccount[];
  legacyMigrations: { email: string; token: string }[];
} {
  if (!Array.isArray(parsed)) {
    return { accounts: [], legacyMigrations: [] };
  }

  const accounts: SavedAccount[] = [];
  const legacyMigrations: { email: string; token: string }[] = [];

  for (const a of parsed) {
    if (!a || typeof a.email !== "string" || typeof a.name !== "string") {
      continue;
    }
    const email = normalizeEmail(a.email);
    if (!email) continue;

    const account: SavedAccount = {
      id: String(a.id || a.email),
      name: String(a.name),
      email,
    };
    if (isProfileGender(a.gender)) account.gender = a.gender;
    if (isAvatarId(a.avatarId)) account.avatarId = a.avatarId;

    const legacyToken = a.token != null ? String(a.token || "").trim() : "";
    if (legacyToken) {
      legacyMigrations.push({ email, token: legacyToken });
    }

    accounts.push(account);
  }

  return { accounts, legacyMigrations };
}

export async function getSavedAccounts(): Promise<SavedAccount[]> {
  let raw: string | null = null;
  try {
    raw = await AsyncStorage.getItem(ACCOUNTS_KEY);
  } catch {
    return [];
  }
  if (!raw) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  const { accounts, legacyMigrations } = parseAccountsFromStorage(parsed);

  // Best-effort legacy token → Keychain migrate. Never drop accounts on failure.
  if (legacyMigrations.length > 0) {
    try {
      for (const m of legacyMigrations) {
        try {
          const existing = await getSecureTokens(m.email);
          if (!existing?.accessToken) {
            await setSecureTokens(m.email, {
              accessToken: m.token,
              refreshToken: existing?.refreshToken || "",
            });
          }
        } catch {
          // skip this email — metadata still returned
        }
      }
      await saveAccounts(accounts);
    } catch {
      // keep returning parsed accounts even if rewrite failed
    }
  }

  return accounts;
}

async function saveAccounts(accounts: SavedAccount[]) {
  const safe = accounts.map(stripTokenForStorage);
  await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(safe));
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

/** Persist access/refresh for an email in Keychain and refresh active mirrors. */
export async function persistTokensForEmail(
  email: string,
  pair: SecureTokenPair,
): Promise<void> {
  const key = normalizeEmail(email);
  if (!key) return;
  try {
    await setSecureTokens(key, pair);
  } catch {
    // Soft-fail — do not clear session mirrors when Keychain is unavailable
  }
  try {
    await AsyncStorage.removeItem(LEGACY_TOKEN_KEY);
  } catch {
    // ignore
  }
}

/** Clear active AsyncStorage session mirrors (not the whole accounts list). */
export async function clearActiveAuthSession(): Promise<void> {
  await clearSessionKeys();
}

/** Access JWT for the active account (Keychain). */
export async function getActiveAuthToken(): Promise<string | null> {
  try {
    const accounts = await ensureAccountsHydrated();
    const activeEmail = await getActiveAccountEmail();
    const fromList =
      (activeEmail && accounts.find((a) => a.email === activeEmail)) ||
      accounts[0] ||
      null;
    const email = fromList?.email || activeEmail;
    if (email) {
      const pair = await getSecureTokens(email);
      if (pair?.accessToken?.trim()) return pair.accessToken.trim();
    }

    // One-time legacy fallback then wipe plain storage
    const legacy = await AsyncStorage.getItem(LEGACY_TOKEN_KEY);
    if (legacy && legacy.trim() && email) {
      await setSecureTokens(email, {
        accessToken: legacy.trim(),
        refreshToken: "",
      });
      await AsyncStorage.removeItem(LEGACY_TOKEN_KEY);
      return legacy.trim();
    }
    return null;
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

/** Add or refresh an account after login/signup. Max 2 unique emails. */
export async function upsertSavedAccount(input: {
  id?: string | number;
  name: string;
  email: string;
  token: string;
  refreshToken?: string;
  gender?: ProfileGender;
  avatarId?: AvatarId;
}): Promise<{ ok: true; accounts: SavedAccount[] } | { ok: false; reason: "max" }> {
  const email = normalizeEmail(input.email);
  if (!email) {
    return { ok: false, reason: "max" };
  }

  const accessToken = String(input.token || "").trim();
  const refreshToken = String(input.refreshToken || "").trim();

  const account: SavedAccount = {
    id: String(input.id || email),
    name: String(input.name || "").trim() || "User",
    email,
  };

  if (isProfileGender(input.gender)) {
    account.gender = input.gender;
  }
  if (isAvatarId(input.avatarId)) {
    account.avatarId = input.avatarId;
  }

  let accounts = await getSavedAccounts();
  const existingIndex = accounts.findIndex((a) => a.email === email);

  if (existingIndex >= 0) {
    const prev = accounts[existingIndex];
    if (!account.gender && prev.gender) {
      account.gender = prev.gender;
    }
    if (!account.avatarId && prev.avatarId) {
      account.avatarId = prev.avatarId;
    }
    accounts[existingIndex] = account;
  } else {
    if (accounts.length >= MAX_SAVED_ACCOUNTS) {
      return { ok: false, reason: "max" };
    }
    accounts = [...accounts, account];
  }

  // Persist account list + session mirrors first so Profile never goes Guest
  // if Keychain is slow/unavailable.
  await saveAccounts(accounts);
  await writeActiveSession(account);

  if (accessToken) {
    try {
      const prevSecure = await getSecureTokens(email);
      await setSecureTokens(email, {
        accessToken,
        refreshToken: refreshToken || prevSecure?.refreshToken || "",
      });
    } catch {
      // Accounts/mirrors already saved — do not fail login/signup on Keychain
    }
  }

  return { ok: true, accounts };
}

/** Update name / gender / avatar for a saved profile (local persistence). */
export async function updateSavedAccountProfile(
  email: string,
  patch: {
    name?: string;
    gender?: ProfileGender;
    avatarId?: AvatarId;
  },
): Promise<SavedAccount | null> {
  const target = normalizeEmail(email);
  if (!target) return null;

  const accounts = await getSavedAccounts();
  const index = accounts.findIndex((a) => a.email === target);
  if (index < 0) return null;

  const next: SavedAccount = { ...accounts[index] };
  if (typeof patch.name === "string" && patch.name.trim()) {
    next.name = patch.name.trim();
  }
  if (isProfileGender(patch.gender)) {
    next.gender = patch.gender;
  }
  if (isAvatarId(patch.avatarId)) {
    next.avatarId = patch.avatarId;
  }

  accounts[index] = next;
  await saveAccounts(accounts);

  const active = await getActiveAccountEmail();
  if (active === target) {
    await writeActiveSession(next);
  }

  return next;
}

export async function switchToAccount(email: string): Promise<boolean> {
  try {
    const targetEmail = normalizeEmail(email);
    if (!targetEmail) return false;

    const accounts = await getSavedAccounts();
    const target = accounts.find((a) => a.email === targetEmail);
    if (!target) return false;

    await writeActiveSession(target);

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
  await clearSecureTokens(target);

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
    LEGACY_TOKEN_KEY,
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

    if (accounts.length <= 1) {
      await clearAllSecureTokens(accounts.map((a) => a.email));
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
    // Do not wipe valid account records on unexpected Keychain/storage errors.
    try {
      return await getSavedAccounts();
    } catch {
      return [];
    }
  }
}

/** Migrate legacy single-session keys into multi-account list once. */
export async function ensureAccountsHydrated(): Promise<SavedAccount[]> {
  const accounts = await getSavedAccounts();
  if (accounts.length > 0) return accounts;

  const [[, token], [, email], [, id], [, name]] = await AsyncStorage.multiGet([
    LEGACY_TOKEN_KEY,
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

function isJwtExpiredLocal(token: string): boolean {
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
 * Tries secure refresh once if access JWT is expired.
 */
export async function getRestorableActiveAccount(): Promise<SavedAccount | null> {
  try {
    const accounts = await ensureAccountsHydrated();
    if (accounts.length === 0) return null;

    const activeEmail = await getActiveAccountEmail();
    let account =
      (activeEmail && accounts.find((a) => a.email === activeEmail)) ||
      accounts[0] ||
      null;

    if (!account) return null;

    let pair = await getSecureTokens(account.email);
    let access = pair?.accessToken?.trim() || "";

    // Keychain miss/timeout must not erase AsyncStorage session mirrors.
    if (!access) {
      return null;
    }

    if (isJwtExpiredLocal(access)) {
      try {
        const { refreshActiveSession } = await import("./authSession");
        const refreshed = await refreshActiveSession();
        if (!refreshed) {
          // Keep local account list + mirrors; splash simply won't auto-restore.
          return null;
        }
        access = refreshed;
      } catch {
        return null;
      }
    }

    try {
      await writeActiveSession(account);
    } catch {
      // ignore mirror rewrite failures for restore
    }
    return { ...account, token: access };
  } catch {
    return null;
  }
}
