import { Image, Platform } from "react-native";

type SoundPlayerModule = {
  playUrl: (url: string) => void;
  stop: () => void;
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

const SOUNDS = {
  tap: require("../assets/sounds/talk_tap.wav"),
  listen: require("../assets/sounds/talk_listen.wav"),
  think: require("../assets/sounds/talk_think.wav"),
  speak: require("../assets/sounds/talk_speak.wav"),
} as const;

export type TalkSoundName = keyof typeof SOUNDS;

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

export function stopTalkSound(): void {
  try {
    SoundPlayer?.stop();
  } catch {
    // ignore
  }
}

/** Short cartoon pings — never throw, never interrupt TTS for long. */
export function playTalkSound(name: TalkSoundName): void {
  if (!SoundPlayer) {
    return;
  }
  try {
    const uri = resolvePlayableUri(SOUNDS[name]);
    if (!uri) {
      return;
    }
    SoundPlayer.stop();
    SoundPlayer.playUrl(uri);
  } catch {
    // ignore — talk still works without SFX
  }
}
