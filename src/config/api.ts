import { NativeModules, Platform } from "react-native";

/**
 * Your PC Wi‑Fi IPv4 (`ipconfig`). Update if it changes.
 * Used for physical phone when Metro host cannot be detected.
 */
export const DEV_MACHINE_IP = "192.168.1.11";
export const API_PORT = 5000;

/**
 * Resolve host so backend works on:
 * - Android emulator → always 10.0.2.2 (PC from emulator)
 * - Physical phone (Wi‑Fi) → PC LAN IP from Metro / DEV_MACHINE_IP
 * - iOS simulator → localhost
 */
function resolveDevHost(): string {
  if (Platform.OS === "android") {
    try {
      const scriptURL: string | undefined =
        NativeModules.SourceCode?.scriptURL;
      const host = scriptURL?.split("://")[1]?.split(":")[0];

      // Real device on same Wi‑Fi: Metro reports LAN IP (e.g. 192.168.x.x)
      if (
        host &&
        host !== "localhost" &&
        host !== "127.0.0.1" &&
        host !== "10.0.2.2"
      ) {
        return host;
      }
    } catch {
      // ignore
    }

    // Emulator (or Metro on 10.0.2.2 / localhost): reach PC via emulator alias
    // NEVER use 127.0.0.1 here — that is the emulator itself, not your PC
    return "10.0.2.2";
  }

  try {
    const scriptURL: string | undefined =
      NativeModules.SourceCode?.scriptURL;
    const host = scriptURL?.split("://")[1]?.split(":")[0];
    if (host && host !== "localhost" && host !== "127.0.0.1") {
      return host;
    }
  } catch {
    // ignore
  }

  return Platform.OS === "ios" ? "127.0.0.1" : DEV_MACHINE_IP;
}

export const API_BASE_URL = `http://${resolveDevHost()}:${API_PORT}`;
