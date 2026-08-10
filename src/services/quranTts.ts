import Tts from "react-native-tts";

/**
 * Speak Arabic with device TTS (best-effort language selection).
 */
export async function speakArabic(text: string) {
  const value = (text || "").trim();
  if (!value) return;

  try {
    await Tts.stop();
  } catch {
    // ignore
  }

  try {
    await Tts.setDefaultLanguage("ar-SA");
  } catch {
    try {
      await Tts.setDefaultLanguage("ar");
    } catch {
      // device may not ship Arabic voice; still attempt speak
    }
  }

  try {
    await Tts.setDefaultRate(0.42);
  } catch {
    // ignore
  }

  try {
    await Tts.speak(value);
  } catch {
    // ignore TTS failures so UI never crashes
  }
}

export function stopSpeaking() {
  try {
    Tts.stop();
  } catch {
    // ignore
  }
}
