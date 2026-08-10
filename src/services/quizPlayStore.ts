import AsyncStorage from "@react-native-async-storage/async-storage";
import { resolveUserKey } from "./accountStore";

const PREFIX = "miniabdullah_quiz_plays_";
const QUIZ_MIGRATED_KEY = "miniabdullah_quiz_user_scoped_migrated_v1";

const KNOWN_GAMES = ["wordsearch", "match", "meaning"] as const;
const KNOWN_LEVELS = [1, 2] as const;

function playKey(userKey: string, gameId: string, level: number) {
  const safe = (userKey || "guest").toLowerCase().trim() || "guest";
  return `${PREFIX}${safe}__${gameId}_l${level}`;
}

function legacyPlayKey(gameId: string, level: number) {
  return `${PREFIX}${gameId}_l${level}`;
}

/** One-time: copy old shared quiz counts onto the then-active account only. */
async function migrateLegacyQuizIfNeeded(userKey: string) {
  try {
    const done = await AsyncStorage.getItem(QUIZ_MIGRATED_KEY);
    if (done === "1") return;

    const pairs: [string, string][] = [];
    for (const gameId of KNOWN_GAMES) {
      for (const level of KNOWN_LEVELS) {
        const scoped = playKey(userKey, gameId, level);
        const existing = await AsyncStorage.getItem(scoped);
        if (existing != null) continue;
        const legacy = await AsyncStorage.getItem(legacyPlayKey(gameId, level));
        if (legacy != null) pairs.push([scoped, legacy]);
      }
    }
    if (pairs.length) await AsyncStorage.multiSet(pairs);
    await AsyncStorage.setItem(QUIZ_MIGRATED_KEY, "1");
  } catch {
    // ignore
  }
}

export async function getPlayCount(gameId: string, level: number) {
  try {
    const userKey = await resolveUserKey();
    await migrateLegacyQuizIfNeeded(userKey);
    const v = await AsyncStorage.getItem(playKey(userKey, gameId, level));
    return v ? parseInt(v, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

export async function bumpPlayCount(gameId: string, level: number) {
  const userKey = await resolveUserKey();
  await migrateLegacyQuizIfNeeded(userKey);
  const key = playKey(userKey, gameId, level);
  const raw = await AsyncStorage.getItem(key);
  const n = raw ? parseInt(raw, 10) || 0 : 0;
  const next = n + 1;
  await AsyncStorage.setItem(key, String(next));
  return next;
}
