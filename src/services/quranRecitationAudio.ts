import { Alert } from "react-native";

type FinishedPayload = { success?: boolean };

type SoundPlayerModule = {
  playUrl: (url: string) => void;
  stop: () => void;
  addEventListener?: (
    event: string,
    handler: (payload: FinishedPayload) => void,
  ) => { remove: () => void } | void;
};

function loadSoundPlayer(): SoundPlayerModule | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("react-native-sound-player").default;
  } catch {
    return null;
  }
}

const SoundPlayer = loadSoundPlayer();

type FinishListener = () => void;
let finishSubscription: { remove: () => void } | null = null;

function clearFinishSubscription() {
  try {
    finishSubscription?.remove?.();
  } catch {
    // ignore
  }
  finishSubscription = null;
}

/**
 * Stream online Quran ayah MP3 (e.g. Sudais CDN URL already on QuranAyah.audioUrl).
 * Uses the same react-native-sound-player pattern as Duas / UI sounds.
 */
export function playQuranRecitation(
  audioUrl: string,
  options?: { onFinished?: FinishListener },
): boolean {
  const url = (audioUrl || "").trim();
  if (!url) {
    Alert.alert(
      "Recitation",
      "No audio link is available for this ayah right now.",
    );
    return false;
  }

  if (!SoundPlayer) {
    Alert.alert(
      "Recitation",
      "Audio player is not available. Rebuild the app once:\nnpx react-native run-android",
    );
    return false;
  }

  try {
    clearFinishSubscription();
    SoundPlayer.stop();

    if (options?.onFinished && SoundPlayer.addEventListener) {
      const sub = SoundPlayer.addEventListener(
        "FinishedPlaying",
        (_payload: FinishedPayload) => {
          clearFinishSubscription();
          options.onFinished?.();
        },
      );
      if (sub && typeof (sub as { remove?: () => void }).remove === "function") {
        finishSubscription = sub as { remove: () => void };
      }
    }

    SoundPlayer.playUrl(url);
    return true;
  } catch (error: any) {
    clearFinishSubscription();
    Alert.alert(
      "Recitation",
      error?.message ||
        "Could not play this recitation. Check your internet connection and try again.",
    );
    return false;
  }
}

export function stopQuranRecitation() {
  clearFinishSubscription();
  try {
    SoundPlayer?.stop();
  } catch {
    // ignore
  }
}
