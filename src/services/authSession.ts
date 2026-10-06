import { API_BASE_URL } from "../config/api";
import { getSecureTokens } from "./secureTokenStore";
import {
  getActiveAccountEmail,
  getActiveAuthToken,
  persistTokensForEmail,
} from "./accountStore";

let refreshInFlight: Promise<string | null> | null = null;

/** Client-side JWT exp check (no signature verify). */
export function isJwtExpired(token: string, skewMs = 30_000): boolean {
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
    return payload.exp * 1000 <= Date.now() + skewMs;
  } catch {
    return false;
  }
}

/**
 * Refresh access token once for the active account.
 * Shared promise prevents concurrent refresh storms.
 */
export async function refreshActiveSession(): Promise<string | null> {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = (async () => {
    try {
      const email = await getActiveAccountEmail();
      if (!email) return null;

      const pair = await getSecureTokens(email);
      const refreshToken = pair?.refreshToken?.trim();
      if (!refreshToken) {
        return null;
      }

      const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok || !data?.success || !data?.token) {
        // Transient refresh/network failure must not wipe Keychain or session mirrors.
        return null;
      }

      await persistTokensForEmail(email, {
        accessToken: String(data.token),
        refreshToken: String(data.refreshToken || refreshToken),
      });

      return String(data.token);
    } catch {
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

/**
 * Return a usable access token, refreshing once if expired.
 * If refresh temporarily fails, keep the existing access token so the
 * local session is not treated as logged-out.
 */
export async function getValidAccessToken(): Promise<string | null> {
  const token = await getActiveAuthToken();
  if (!token) return null;
  if (!isJwtExpired(token)) return token;

  const refreshed = await refreshActiveSession();
  return refreshed || token;
}

/**
 * fetch() with Bearer access token + single 401→refresh→retry.
 * Does not refresh /api/auth/refresh itself.
 */
export async function authFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  const url = typeof input === "string" ? input : String(input);
  const isRefreshCall = url.includes("/api/auth/refresh");

  const buildHeaders = async (access: string | null) => {
    const headers = new Headers(init.headers || {});
    if (!headers.has("Content-Type") && init.body) {
      headers.set("Content-Type", "application/json");
    }
    if (access) {
      headers.set("Authorization", `Bearer ${access}`);
    }
    return headers;
  };

  let access = isRefreshCall
    ? await getActiveAuthToken()
    : await getValidAccessToken();

  let res = await fetch(input, {
    ...init,
    headers: await buildHeaders(access),
  });

  if (res.status !== 401 || isRefreshCall) {
    return res;
  }

  const refreshed = await refreshActiveSession();
  if (!refreshed) {
    return res;
  }

  res = await fetch(input, {
    ...init,
    headers: await buildHeaders(refreshed),
  });
  return res;
}

/** Best-effort server revoke of refresh token (never logs tokens). */
export async function revokeServerSession(): Promise<void> {
  try {
    const email = await getActiveAccountEmail();
    if (!email) return;
    const pair = await getSecureTokens(email);
    const refreshToken = pair?.refreshToken || "";
    const access = pair?.accessToken || "";

    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(access ? { Authorization: `Bearer ${access}` } : {}),
      },
      body: JSON.stringify({
        refreshToken: refreshToken || undefined,
      }),
    });
  } catch {
    // local logout still proceeds
  }
}
