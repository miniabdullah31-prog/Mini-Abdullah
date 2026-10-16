import Tts from "react-native-tts";

type SpeakOptions = {
  /** Prefer a female voice when available (Names of Allah, etc.). */
  preferFemale?: boolean;
  /** Language hint: Arabic name → ar-SA; transliteration fallback → en-US. */
  language?: "ar-SA" | "ar" | "en-US" | "ur-PK";
};

type TtsVoice = {
  id: string;
  name?: string;
  language?: string;
  gender?: string;
  quality?: number;
};

function isFemaleVoice(voice: TtsVoice): boolean {
  const gender = String(voice.gender || "").toLowerCase();
  if (gender === "female" || gender === "f") return true;
  if (gender === "male" || gender === "m") return false;
  const blob = `${voice.name || ""} ${voice.id || ""}`.toLowerCase();
  if (
    /male|man\b|boy|david|mark|daniel|thomas|alex|fred|bruce|ravi|googleuk|network/.test(
      blob,
    ) &&
    !/female|woman|girl/.test(blob)
  ) {
    return false;
  }
  return /female|woman|girl|samantha|karen|moira|tessa|fiona|veena|zira|susan|hazel|serena|allison|ava|salli|joanna|ivy|kimberly|kendra|nicole|emma|amy|aria|jenny|natasha|helen|lisa|laila|hoda|salma/.test(
    blob,
  );
}

function langMatches(voiceLang: string | undefined, wanted: string): boolean {
  if (!voiceLang) return false;
  const a = voiceLang.toLowerCase().replace("_", "-");
  const b = wanted.toLowerCase().replace("_", "-");
  if (a === b) return true;
  return a.split("-")[0] === b.split("-")[0];
}

async function listVoices(): Promise<TtsVoice[]> {
  try {
    const voices = (await Tts.voices()) as TtsVoice[];
    return Array.isArray(voices) ? voices : [];
  } catch {
    return [];
  }
}

async function pickVoice(
  preferredLangs: string[],
  femaleOnly: boolean,
): Promise<string | null> {
  const voices = await listVoices();
  if (!voices.length) return null;

  const pool = femaleOnly ? voices.filter(isFemaleVoice) : voices;
  for (const lang of preferredLangs) {
    const match = pool.find((v) => langMatches(v.language, lang));
    if (match?.id) return match.id;
  }
  if (femaleOnly && pool[0]?.id) return pool[0].id;
  if (!femaleOnly) {
    for (const lang of preferredLangs) {
      const match = voices.find((v) => langMatches(v.language, lang));
      if (match?.id) return match.id;
    }
    return voices[0]?.id || null;
  }
  return null;
}

async function applyLanguage(language: string) {
  try {
    await Tts.setDefaultLanguage(language);
  } catch {
    try {
      await Tts.setDefaultLanguage(language.startsWith("ar") ? "ar" : "en-US");
    } catch {
      // device may not ship requested voice; still attempt speak
    }
  }
}

async function applyVoiceId(voiceId: string | null) {
  if (!voiceId) return;
  try {
    await Tts.setDefaultVoice(voiceId);
  } catch {
    // ignore
  }
}

async function configureVoice(options?: SpeakOptions) {
  const preferFemale = !!options?.preferFemale;
  const language = options?.language || "ar-SA";
  const langOrder =
    language === "en-US"
      ? ["en-US", "en", "ur-PK", "ar-SA", "ar"]
      : language === "ur-PK"
        ? ["ur-PK", "ur", "en-US", "en", "ar-SA", "ar"]
        : ["ar-SA", "ar", "ur-PK", "en-US", "en"];

  await applyLanguage(language);

  if (preferFemale) {
    const femaleId = await pickVoice(langOrder, true);
    await applyVoiceId(femaleId);
  }

  try {
    await Tts.setDefaultRate(0.42);
  } catch {
    // ignore
  }
}

/**
 * Speak Arabic with device TTS — female voice by default (kids pronunciation).
 */
export async function speakArabic(text: string, options?: SpeakOptions) {
  const value = (text || "").trim();
  if (!value) return;

  try {
    await Tts.stop();
  } catch {
    // ignore
  }

  const preferFemale = options?.preferFemale !== false;

  await configureVoice({
    preferFemale,
    language: options?.language || "ar-SA",
  });

  try {
    await Tts.speak(value);
  } catch {
    // ignore TTS failures so UI never crashes
  }
}

/**
 * Speak Names of Allah pronunciation with a female voice when available.
 * Prefers an Arabic female voice for the Arabic name; otherwise a female
 * English voice for the transliteration; last resort is any Arabic voice.
 */
export async function speakArabicFemale(
  arabicText: string,
  transliteration?: string,
) {
  const arabic = (arabicText || "").trim();
  const english = (transliteration || "").trim();

  try {
    await Tts.stop();
  } catch {
    // ignore
  }

  try {
    await Tts.setDefaultRate(0.42);
  } catch {
    // ignore
  }

  const femaleAr = await pickVoice(["ar-SA", "ar"], true);
  if (arabic && femaleAr) {
    await applyLanguage("ar-SA");
    await applyVoiceId(femaleAr);
    try {
      await Tts.speak(arabic);
      return;
    } catch {
      // fall through
    }
  }

  const femaleEn = await pickVoice(["en-US", "en"], true);
  if (english && femaleEn) {
    await applyLanguage("en-US");
    await applyVoiceId(femaleEn);
    try {
      await Tts.speak(english);
      return;
    } catch {
      // fall through
    }
  }

  // Last resort: Arabic (or transliteration) with best available voice
  if (arabic) {
    await applyLanguage("ar-SA");
    const anyAr = await pickVoice(["ar-SA", "ar"], false);
    await applyVoiceId(anyAr);
    try {
      await Tts.speak(arabic);
      return;
    } catch {
      // ignore
    }
  }

  if (english) {
    await applyLanguage("en-US");
    const anyEn = await pickVoice(["en-US", "en"], false);
    await applyVoiceId(anyEn);
    try {
      await Tts.speak(english);
    } catch {
      // ignore
    }
  }
}

function isChildLikeVoice(voice: TtsVoice): boolean {
  const blob = `${voice.name || ""} ${voice.id || ""}`.toLowerCase();
  return /child|kid|kids|junior|young|pediatric|ivy|little|boy|girl|cartoon/.test(
    blob,
  );
}

async function pickKidVoice(preferredLangs: string[]): Promise<string | null> {
  const voices = await listVoices();
  if (!voices.length) return null;

  for (const lang of preferredLangs) {
    const child = voices.find(
      (v) => isChildLikeVoice(v) && langMatches(v.language, lang),
    );
    if (child?.id) return child.id;
  }

  for (const lang of preferredLangs) {
    const softFemale = voices.find(
      (v) => isFemaleVoice(v) && langMatches(v.language, lang),
    );
    if (softFemale?.id) return softFemale.id;
  }

  return pickVoice(preferredLangs, false);
}

async function configureKidVoice(language: string) {
  const langOrder =
    language === "en-US"
      ? ["en-US", "en", "ur-PK", "ar-SA", "ar"]
      : language === "ur-PK"
        ? ["ur-PK", "ur", "en-US", "en", "ar-SA", "ar"]
        : ["ar-SA", "ar", "ur-PK", "en-US", "en"];

  await applyLanguage(language);
  const kidVoiceId = await pickKidVoice(langOrder);
  await applyVoiceId(kidVoiceId);

  try {
    await Tts.setDefaultRate(0.5);
  } catch {
    // ignore
  }
  try {
    await Tts.setDefaultPitch(1.32);
  } catch {
    // ignore
  }
}

function detectConversationalLanguage(text: string): "ur-PK" | "ar-SA" | "en-US" {
  if (/[\u0600-\u06FF]/.test(text)) {
    if (/[\u0679\u0686\u0691\u06AF\u06BE\u06C1\u06D2]/.test(text)) {
      return "ur-PK";
    }
    return "ar-SA";
  }
  return "en-US";
}

/**
 * Talking Abdullah — child-like voice (higher pitch + kid TTS when available).
 */
export async function speakConversational(text: string) {
  const value = (text || "").trim();
  if (!value) return;

  try {
    await Tts.stop();
  } catch {
    // ignore
  }

  const language = detectConversationalLanguage(value);
  await configureKidVoice(language);

  try {
    await Tts.speak(value);
  } catch {
    // ignore
  }
}

/** Speak and resolve when TTS finishes or is cancelled. */
export function speakConversationalAndWait(
  text: string,
  callbacks?: {
    onStart?: () => void;
    onProgress?: () => void;
  },
): Promise<void> {
  const value = (text || "").trim();
  if (!value) return Promise.resolve();

   return new Promise<void>((resolve) => {
    let settled = false;
    let fallbackTimer: ReturnType<typeof setTimeout>;

    const onStart = () => {
      callbacks?.onStart?.();
    };

    const onProgress = () => {
      callbacks?.onProgress?.();
    };

    const finish = () => {
      if (settled) return;
      settled = true;

      Tts.removeEventListener("tts-finish", finish);
      Tts.removeEventListener("tts-cancel", finish);
      Tts.removeEventListener("tts-progress", onProgress);
      Tts.removeEventListener("tts-start", onStart);

      clearTimeout(fallbackTimer);
      resolve();
    };

    Tts.addEventListener("tts-finish", finish);
    Tts.addEventListener("tts-cancel", finish);
    Tts.addEventListener("tts-start", onStart);
    Tts.addEventListener("tts-progress", onProgress);

    fallbackTimer = setTimeout(finish, 90000);

    speakConversational(value).catch(() => finish());
  });
}

export function stopSpeaking() {
  try {
    Tts.stop();
  } catch {
    // ignore
  }
}
