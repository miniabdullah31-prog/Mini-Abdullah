import { Image, Platform } from "react-native";
import { getSoundEnabled } from "./appPrefsStore";

type SoundPlayerModule = {
  playUrl: (url: string) => void;
  stop: () => void;
  setVolume?: (volume: number) => void;
};

export type UiSoundName =
  | "tap"
  | "success"
  | "wrong"
  | "coin"
  | "achievement"
  | "gameWin"
  | "cardOpen"
  | "goodDeed"
  | "wudu";

function loadSoundPlayer(): SoundPlayerModule | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("react-native-sound-player").default;
  } catch {
    return null;
  }
}

const SoundPlayer = loadSoundPlayer();

const ASSETS: Record<UiSoundName, number> = {
  tap: require("../assets/sounds/ui_tap.wav"),
  success: require("../assets/sounds/ui_success.wav"),
  wrong: require("../assets/sounds/ui_wrong.wav"),
  coin: require("../assets/sounds/ui_coin.wav"),
  achievement: require("../assets/sounds/ui_achievement.wav"),
  gameWin: require("../assets/sounds/ui_gameWin.wav"),
  cardOpen: require("../assets/sounds/ui_cardOpen.wav"),
  goodDeed: require("../assets/sounds/ui_goodDeed.wav"),
  wudu: require("../assets/sounds/ui_wudu.wav"),
};

const COOLDOWN_MS: Record<UiSoundName, number> = {
  tap: 160,
  cardOpen: 280,
  success: 220,
  wrong: 280,
  coin: 420,
  wudu: 300,
  goodDeed: 700,
  achievement: 800,
  gameWin: 1400,
};

const LONG_SOUNDS: ReadonlySet<UiSoundName> = new Set([
  "gameWin",
  "achievement",
  "goodDeed",
]);

const lastPlayed: Partial<Record<UiSoundName, number>> = {};
let enabled = true;
let hydrated = false;
let hydratePromise: Promise<void> | null = null;

function resolvePlayableUri(asset: number): string | null {
  const resolved = Image.resolveAssetSource(asset);
  if (!resolved?.uri) {
    return null;
  }
  if (
    Platform.OS === "android" &&
    !resolved.uri.startsWith("http") &&
    !resolved.uri.startsWith("file://") &&
    !resolved.uri.startsWith("asset:/")
  ) {
    return `file://${resolved.uri}`;
  }
  return resolved.uri;
}

export function isUiSoundEnabled(): boolean {
  return enabled;
}

export async function hydrateUiSoundPref(): Promise<void> {
  if (hydrated) {
    return;
  }
  if (!hydratePromise) {
    hydratePromise = getSoundEnabled()
      .then((value) => {
        enabled = value;
        hydrated = true;
      })
      .catch(() => {
        enabled = true;
        hydrated = true;
      });
  }
  await hydratePromise;
}

export function setUiSoundEnabledCache(value: boolean): void {
  enabled = value;
  hydrated = true;
}

function shouldPlay(name: UiSoundName): boolean {
  if (!enabled || !SoundPlayer) {
    return false;
  }
  const now = Date.now();
  const wait = COOLDOWN_MS[name];
  if (now - (lastPlayed[name] || 0) < wait) {
    return false;
  }
  lastPlayed[name] = now;
  return true;
}

/** Short UI SFX. Never throws. Skips automatically when App sounds are off. */
export function playUiSound(name: UiSoundName): void {
  if (!hydrated) {
    hydrateUiSoundPref().catch(() => undefined);
  }
  const player = SoundPlayer;
  if (!player || !shouldPlay(name)) {
    return;
  }
  try {
    const uri = resolvePlayableUri(ASSETS[name]);
    if (!uri) {
      return;
    }
    if (typeof player.setVolume === "function") {
      player.setVolume(0.55);
    }
    if (LONG_SOUNDS.has(name)) {
      player.stop();
    }
    player.playUrl(uri);
  } catch {
    // UI never depends on SFX
  }
}

export const SoundService = {
  play: playUiSound,
  hydrate: hydrateUiSoundPref,
  isEnabled: isUiSoundEnabled,
  setEnabledCache: setUiSoundEnabledCache,
};
