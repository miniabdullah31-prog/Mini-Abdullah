import * as Keychain from "react-native-keychain";

export type SecureTokenPair = {
  accessToken: string;
  refreshToken: string;
};

/** Hard ceiling so Keychain never blocks login/profile forever. */
export const KEYCHAIN_TIMEOUT_MS = 4000;

function normalizeEmail(email: string) {
  return String(email || "")
    .toLowerCase()
    .trim();
}

function serviceForEmail(email: string) {
  return `com.miniabdullah.auth.${normalizeEmail(email)}`;
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${ms}ms`));
    }, ms);
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (timer) clearTimeout(timer);
  }) as Promise<T>;
}

/**
 * Store access + refresh tokens in Android Keystore-backed Keychain.
 * Never logs token values. Rejects on timeout/failure (caller may soft-fail).
 */
export async function setSecureTokens(
  email: string,
  pair: SecureTokenPair,
): Promise<void> {
  const key = normalizeEmail(email);
  if (!key) return;
  const accessToken = String(pair.accessToken || "").trim();
  const refreshToken = String(pair.refreshToken || "").trim();
  if (!accessToken) return;

  await withTimeout(
    Keychain.setGenericPassword(
      "session",
      JSON.stringify({ accessToken, refreshToken }),
      {
        service: serviceForEmail(key),
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      },
    ).then(() => undefined),
    KEYCHAIN_TIMEOUT_MS,
    "Keychain setSecureTokens",
  );
}

export async function getSecureTokens(
  email: string,
): Promise<SecureTokenPair | null> {
  const key = normalizeEmail(email);
  if (!key) return null;
  try {
    const creds = await withTimeout(
      Keychain.getGenericPassword({
        service: serviceForEmail(key),
      }),
      KEYCHAIN_TIMEOUT_MS,
      "Keychain getSecureTokens",
    );
    if (!creds || !creds.password) return null;
    const parsed = JSON.parse(creds.password);
    const accessToken = String(parsed?.accessToken || "").trim();
    const refreshToken = String(parsed?.refreshToken || "").trim();
    if (!accessToken) return null;
    return { accessToken, refreshToken };
  } catch {
    return null;
  }
}

export async function clearSecureTokens(email: string): Promise<void> {
  const key = normalizeEmail(email);
  if (!key) return;
  try {
    await withTimeout(
      Keychain.resetGenericPassword({ service: serviceForEmail(key) }).then(
        () => undefined,
      ),
      KEYCHAIN_TIMEOUT_MS,
      "Keychain clearSecureTokens",
    );
  } catch {
    // ignore — never block logout/switch
  }
}

export async function clearAllSecureTokens(emails: string[]): Promise<void> {
  for (const email of emails) {
    await clearSecureTokens(email);
  }
}
