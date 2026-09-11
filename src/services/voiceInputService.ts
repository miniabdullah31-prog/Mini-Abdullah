import Voice from "@react-native-voice/voice";
import { NativeModules, PermissionsAndroid, Platform } from "react-native";

const LOCALE_CANDIDATES = ["en-US", "en-GB", "en", "ur-PK"];

/** Android registers as RCTVoice; iOS as Voice. */
export function getVoiceNativeModule() {
  return NativeModules.Voice ?? NativeModules.RCTVoice ?? null;
}

export type VoiceListenerHandlers = {
  onPartial?: (text: string) => void;
  onResult?: (text: string) => void;
  onEnd?: () => void;
  onError?: (message: string) => void;
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Android STT often fires these when user pauses or session ends — not real failures. */
export function isBenignSpeechError(message: string): boolean {
  const m = (message || "").toLowerCase();
  return (
    /no match|no speech|speech timeout|didn't understand|timeout|cancel|abort|busy|client|audio|permission|network/i.test(
      m,
    ) || /\b(error\s*)?[56789]\b/.test(m)
  );
}

let suppressSpeechErrors = false;

export function suppressVoiceErrorsFor(ms = 700) {
  suppressSpeechErrors = true;
  setTimeout(() => {
    suppressSpeechErrors = false;
  }, ms);
}

export function shouldSuppressVoiceError(): boolean {
  return suppressSpeechErrors;
}

/** Native module must exist — rebuild app if false. */
export function isVoiceNativeModuleReady(): boolean {
  return !!getVoiceNativeModule();
}

function assertVoiceNativeModule() {
  if (!isVoiceNativeModuleReady()) {
    throw new Error(
      "Voice module load nahi hua. Metro band karke dubara start karo, phir android se gradlew installDebug chalao.",
    );
  }
}

/** Safe cleanup — never call Voice.removeAllListeners() (crashes when native module is null). */
export function clearVoiceListenerHandlers() {
  Voice.onSpeechStart = () => {};
  Voice.onSpeechPartialResults = () => {};
  Voice.onSpeechResults = () => {};
  Voice.onSpeechEnd = () => {};
  Voice.onSpeechError = () => {};
}

export async function ensureMicPermission(): Promise<boolean> {
  if (Platform.OS !== "android") {
    return true;
  }

  const already = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
  );
  if (already) {
    return true;
  }

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    {
      title: "Microphone permission",
      message: "Talking Abdullah ke liye microphone chahiye.",
      buttonPositive: "OK",
      buttonNegative: "Cancel",
    },
  );

  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

async function resetVoiceSession() {
  assertVoiceNativeModule();
  suppressVoiceErrorsFor(800);
  clearVoiceListenerHandlers();

  try {
    await Voice.cancel();
  } catch {
    // ignore
  }
  try {
    await Voice.stop();
  } catch {
    // ignore
  }
  try {
    await Voice.destroy();
  } catch {
    // ignore
  }

  await delay(450);
}

export function bindVoiceListeners(handlers: VoiceListenerHandlers) {
  assertVoiceNativeModule();

  Voice.onSpeechPartialResults = (event) => {
    const spoken = event.value?.[0];
    if (spoken) {
      handlers.onPartial?.(spoken);
    }
  };

  Voice.onSpeechResults = (event) => {
    const spoken = event.value?.[0];
    if (spoken) {
      handlers.onResult?.(spoken);
    }
  };

  Voice.onSpeechEnd = () => {
    handlers.onEnd?.();
  };

  Voice.onSpeechError = (event) => {
    const message =
      event.error?.message ||
      String(event.error?.code || "") ||
      "Speech recognition error";
    handlers.onError?.(message);
  };
}

/**
 * Start STT after TTS/audio — waits so Android mic is not blocked.
 */
export async function startVoiceListening(
  handlers: VoiceListenerHandlers,
  options?: { afterAudioMs?: number },
): Promise<void> {
  assertVoiceNativeModule();

  const allowed = await ensureMicPermission();
  if (!allowed) {
    throw new Error("Microphone permission denied");
  }

  await delay(options?.afterAudioMs ?? 480);
  await resetVoiceSession();
  bindVoiceListeners(handlers);

  let available = false;
  try {
    available = !!(await Voice.isAvailable());
  } catch {
    available = Platform.OS === "android";
  }

  if (!available) {
    throw new Error(
      "Speech recognition is not available. Install Google app / speech services.",
    );
  }

  let lastError: unknown = null;

  for (const locale of LOCALE_CANDIDATES) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        if (attempt > 0) {
          await resetVoiceSession();
          bindVoiceListeners(handlers);
          await delay(350);
        }
        await Voice.start(locale);
        return;
      } catch (error) {
        lastError = error;
      }
    }
  }

  const detail =
    lastError instanceof Error ? lastError.message : String(lastError || "");
  throw new Error(
    detail
      ? `Mic start failed: ${detail}`
      : "Mic start failed. Check Google Speech Services on device.",
  );
}

export async function stopVoiceListening() {
  if (!isVoiceNativeModuleReady()) {
    return;
  }
  try {
    await Voice.stop();
  } catch {
    // ignore
  }
}

export async function releaseVoiceSession() {
  if (!isVoiceNativeModuleReady()) {
    return;
  }
  suppressVoiceErrorsFor(800);
  clearVoiceListenerHandlers();
  try {
    await Voice.cancel();
  } catch {
    // ignore
  }
  try {
    await Voice.destroy();
  } catch {
    // ignore
  }
}
