import { NativeModules, Platform } from "react-native";

/**
 * PC Wi‑Fi IPv4 (ipconfig → Wireless LAN adapter Wi‑Fi → IPv4 Address).
 * Update this whenever your PC gets a new LAN IP.
 * USB: `adb reverse tcp:5000 tcp:5000` AND `adb reverse tcp:8081 tcp:8081`
 * so the phone can use 127.0.0.1 when Metro itself is loaded over USB.
 */
export const DEV_MACHINE_IP = "192.168.100.182";
export const API_PORT = 5000;

function isLoopbackHost(host: string): boolean {
  return host === "localhost" || host === "127.0.0.1";
}

function isPrivateLanHost(host: string): boolean {
  if (!/^[\d.]+$/.test(host)) {
    return false;
  }
  if (host.startsWith("192.168.")) {
    return true;
  }
  if (host.startsWith("10.")) {
    return true;
  }
  const match = /^172\.(\d+)\./.exec(host);
  if (match) {
    const second = Number.parseInt(match[1], 10);
    return second >= 16 && second <= 31;
  }
  return false;
}

function isAndroidEmulator(): boolean {
  if (Platform.OS !== "android") {
    return false;
  }
  try {
    const c = NativeModules.PlatformConstants as Record<string, string> | undefined;
    if (!c) {
      return false;
    }
    const blob = [c.Model, c.Brand, c.Manufacturer, c.Fingerprint, c.Product]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return /sdk|emulator|simulator|genymotion|google_sdk|goldfish|ranchu|vbox/.test(
      blob,
    );
  } catch {
    return false;
  }
}

/** Host that actually served this JS bundle (Metro). */
function metroBundleHost(): string | null {
  try {
    const scriptURL: string | undefined = NativeModules.SourceCode?.scriptURL;
    const host = scriptURL?.split("://")[1]?.split(":")[0];
    if (!host) {
      return null;
    }
    // USB + adb reverse: bundle is localhost — API must use the same path.
    if (isLoopbackHost(host)) {
      return "127.0.0.1";
    }
    // 10.0.2.2 is only valid on the Android emulator, never on a USB phone.
    if (host === "10.0.2.2") {
      return null;
    }
    if (isPrivateLanHost(host)) {
      return host;
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * - Emulator → 10.0.2.2 (Android emulator loopback to host)
 * - Physical phone loading Metro over USB reverse → 127.0.0.1 (needs adb reverse tcp:5000)
 * - Physical phone loading Metro over Wi‑Fi → Metro LAN host, else DEV_MACHINE_IP
 */
function resolveDevHost(): string {
  if (Platform.OS === "android" && isAndroidEmulator()) {
    return "10.0.2.2";
  }

  return metroBundleHost() || DEV_MACHINE_IP;
}

export const API_BASE_URL = `http://${resolveDevHost()}:${API_PORT}`;

/** Real phone + PC: same Wi‑Fi, backend npm run backend, firewall allow port 5000 */
export function getApiSetupHint(): string {
  return `Backend: ${API_BASE_URL} — PC par "npm run backend", phone same Wi‑Fi, ipconfig se DEV_MACHINE_IP match karo.`;
}
