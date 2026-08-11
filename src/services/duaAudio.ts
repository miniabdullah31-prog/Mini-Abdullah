import { Alert, Image, Platform } from "react-native";

type SoundPlayerModule = {
  playUrl: (url: string) => void;
  stop: () => void;
};

function loadSoundPlayer(): SoundPlayerModule | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require("react-native-sound-player").default;
  } catch {
    return null;
  }
}

const SoundPlayer = loadSoundPlayer();

/**
 * Play a locally attached dua recording (from require(...mp3)).
 * Returns true if playback started.
 */
export async function playDuaAudio(asset: number | null | undefined) {
  if (asset == null) {
    Alert.alert(
      "Audio not added",
      "Record your dua audio, put the file in src/assets/duas/, then set audio: require(\"../assets/duas/yourfile.mp3\") in src/data/duas.ts",
    );
    return false;
  }

  if (!SoundPlayer) {
    Alert.alert(
      "Audio",
      "Rebuild the app once to enable dua audio:\nnpx react-native run-android",
    );
    return false;
  }

  try {
    SoundPlayer.stop();
    const resolved = Image.resolveAssetSource(asset);
    if (!resolved?.uri) {
      throw new Error("Could not resolve audio file");
    }
    const uri =
      Platform.OS === "android" &&
      !resolved.uri.startsWith("http") &&
      !resolved.uri.startsWith("file://") &&
      !resolved.uri.startsWith("asset:/")
        ? `file://${resolved.uri}`
        : resolved.uri;
    SoundPlayer.playUrl(uri);
    return true;
  } catch (error: any) {
    Alert.alert("Audio Error", error?.message || "Could not play dua audio.");
    return false;
  }
}

export function stopDuaAudio() {
  try {
    SoundPlayer?.stop();
  } catch {
    // ignore
  }
}
