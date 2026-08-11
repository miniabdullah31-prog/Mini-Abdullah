import { Alert, Platform } from "react-native";
import { getSudaisAudioUrl } from "../data/juzMeta";

type SoundPlayerModule = {
  playUrl: (url: string) => void;
  stop: () => void;
};

type RnFsModule = {
  DocumentDirectoryPath: string;
  exists: (path: string) => Promise<boolean>;
  mkdir: (path: string) => Promise<void>;
  downloadFile: (options: {
    fromUrl: string;
    toFile: string;
  }) => { promise: Promise<{ statusCode: number }> };
};

function loadSoundPlayer(): SoundPlayerModule | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require("react-native-sound-player").default;
  } catch {
    return null;
  }
}

function loadRnFs(): RnFsModule | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require("react-native-fs");
  } catch {
    return null;
  }
}

const SoundPlayer = loadSoundPlayer();
const RNFS = loadRnFs();

function audioDir() {
  if (!RNFS) {
    return "";
  }
  return `${RNFS.DocumentDirectoryPath}/sudais-audio`;
}

function localAudioPath(ayahId: number) {
  return `${audioDir()}/${ayahId}.mp3`;
}

async function ensureAudioCached(ayahId: number): Promise<string | null> {
  if (!RNFS) {
    return null;
  }

  try {
    const dir = audioDir();
    const filePath = localAudioPath(ayahId);

    if (!(await RNFS.exists(dir))) {
      await RNFS.mkdir(dir);
    }

    if (await RNFS.exists(filePath)) {
      return filePath;
    }

    const result = await RNFS.downloadFile({
      fromUrl: getSudaisAudioUrl(ayahId),
      toFile: filePath,
    }).promise;

    if (result.statusCode >= 200 && result.statusCode < 300) {
      return filePath;
    }
  } catch {
    return null;
  }

  return null;
}

function toPlayableUri(filePath: string) {
  if (Platform.OS === "android") {
    return filePath.startsWith("file://") ? filePath : `file://${filePath}`;
  }
  return filePath;
}

/**
 * Play Sudais audio (cache when possible, else stream).
 */
export async function playSudaisAyah(ayahId: number, remoteUrl: string) {
  if (!SoundPlayer) {
    Alert.alert(
      "Audio",
      "Rebuild the app once to enable Sudais audio:\nnpx react-native run-android",
    );
    return false;
  }

  try {
    SoundPlayer.stop();

    const cached = await ensureAudioCached(ayahId);
    if (cached) {
      SoundPlayer.playUrl(toPlayableUri(cached));
      return true;
    }

    SoundPlayer.playUrl(remoteUrl);
    return true;
  } catch (error: any) {
    Alert.alert(
      "Audio Error",
      error?.message ||
        "Could not play audio. Connect once to download, then it works offline.",
    );
    return false;
  }
}

export function stopSudaisAudio() {
  try {
    SoundPlayer?.stop();
  } catch {
    // ignore
  }
}
