import AsyncStorage from "@react-native-async-storage/async-storage";
import { resolveUserKey } from "./accountStore";

/** Device-wide: onboarding once per phone. */
const ONBOARDING_DONE_KEY = "miniabdullah_onboarding_done_v1";

/** Legacy (pre multi-account) shared keys — migrated once to active user. */
const LEGACY_FEATURE_USED_KEY = "miniabdullah_feature_used_v1";
const LEGACY_RATING_STARS_KEY = "miniabdullah_rating_stars_v1";
const LEGACY_RATING_PROMPT_PENDING_KEY = "miniabdullah_rating_prompt_pending_v1";
const PREFS_MIGRATED_KEY = "miniabdullah_prefs_user_scoped_migrated_v1";

function scoped(base: string, userKey: string) {
  const safe = (userKey || "guest").toLowerCase().trim() || "guest";
  return `${base}__${safe}`;
}

async function migrateLegacyPrefsIfNeeded(userKey: string) {
  try {
    const done = await AsyncStorage.getItem(PREFS_MIGRATED_KEY);
    if (done === "1") return;

    const featureKey = scoped("miniabdullah_feature_used_v1", userKey);
    const starsKey = scoped("miniabdullah_rating_stars_v1", userKey);
    const pendingKey = scoped("miniabdullah_rating_prompt_pending_v1", userKey);

    const existingScoped = await AsyncStorage.multiGet([
      featureKey,
      starsKey,
      pendingKey,
    ]);
    const hasScoped = existingScoped.some(([, v]) => v != null);
    if (!hasScoped) {
      const legacy = await AsyncStorage.multiGet([
        LEGACY_FEATURE_USED_KEY,
        LEGACY_RATING_STARS_KEY,
        LEGACY_RATING_PROMPT_PENDING_KEY,
      ]);
      const pairs: [string, string][] = [];
      if (legacy[0][1] != null) pairs.push([featureKey, legacy[0][1]]);
      if (legacy[1][1] != null) pairs.push([starsKey, legacy[1][1]]);
      if (legacy[2][1] != null) pairs.push([pendingKey, legacy[2][1]]);
      if (pairs.length) await AsyncStorage.multiSet(pairs);
    }

    await AsyncStorage.setItem(PREFS_MIGRATED_KEY, "1");
  } catch {
    // ignore migration errors — scoped keys still work fresh
  }
}

async function prefsKeys() {
  const userKey = await resolveUserKey();
  await migrateLegacyPrefsIfNeeded(userKey);
  return {
    featureUsed: scoped("miniabdullah_feature_used_v1", userKey),
    ratingStars: scoped("miniabdullah_rating_stars_v1", userKey),
    ratingPromptPending: scoped(
      "miniabdullah_rating_prompt_pending_v1",
      userKey,
    ),
  };
}

export async function isOnboardingDone(): Promise<boolean> {
  try {
    const v = await AsyncStorage.getItem(ONBOARDING_DONE_KEY);
    return v === "1";
  } catch {
    return false;
  }
}

export async function markOnboardingDone(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_DONE_KEY, "1");
}

export async function getRatingStars(): Promise<number> {
  try {
    const { ratingStars } = await prefsKeys();
    const raw = await AsyncStorage.getItem(ratingStars);
    const n = raw ? Number(raw) : 0;
    if (Number.isFinite(n) && n >= 1 && n <= 5) return Math.floor(n);
    return 0;
  } catch {
    return 0;
  }
}

export async function setRatingStars(stars: number): Promise<number> {
  const safe = Math.min(5, Math.max(1, Math.floor(stars)));
  const keys = await prefsKeys();
  await AsyncStorage.setItem(keys.ratingStars, String(safe));
  await AsyncStorage.setItem(keys.ratingPromptPending, "0");
  return safe;
}

export async function hasUsedFeature(): Promise<boolean> {
  try {
    const { featureUsed } = await prefsKeys();
    return (await AsyncStorage.getItem(featureUsed)) === "1";
  } catch {
    return false;
  }
}

/** Call when user opens any learning feature (screens 11–18). */
export async function markFeatureUsed(): Promise<void> {
  const already = await hasUsedFeature();
  if (already) return;
  const keys = await prefsKeys();
  await AsyncStorage.setItem(keys.featureUsed, "1");
  const stars = await getRatingStars();
  if (stars === 0) {
    await AsyncStorage.setItem(keys.ratingPromptPending, "1");
  }
}

export async function isRatingPromptPending(): Promise<boolean> {
  try {
    const { ratingPromptPending } = await prefsKeys();
    return (await AsyncStorage.getItem(ratingPromptPending)) === "1";
  } catch {
    return false;
  }
}

export async function dismissRatingPrompt(): Promise<void> {
  const { ratingPromptPending } = await prefsKeys();
  await AsyncStorage.setItem(ratingPromptPending, "0");
}

export function getTimeGreeting(date = new Date()): string {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return "Good Morning";
  if (hour >= 12 && hour < 17) return "Good Afternoon";
  return "Good Evening";
}

/** Device-wide notifications preference (Profile switch). Default ON. */
const NOTIFICATIONS_ENABLED_KEY = "miniabdullah_notifications_enabled_v1";
const PRAYER_TIMES_CACHE_KEY = "miniabdullah_prayer_times_cache_v1";

export async function getNotificationsEnabled(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
    if (raw == null) return true;
    return raw === "1";
  } catch {
    return true;
  }
}

export async function setNotificationsEnabled(
  enabled: boolean,
): Promise<void> {
  await AsyncStorage.setItem(
    NOTIFICATIONS_ENABLED_KEY,
    enabled ? "1" : "0",
  );
}

/** Device-wide UI sound preference (Profile switch). Default ON. */
const SOUND_ENABLED_KEY = "miniabdullah_sound_enabled_v1";

export async function getSoundEnabled(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(SOUND_ENABLED_KEY);
    if (raw == null) return true;
    return raw === "1";
  } catch {
    return true;
  }
}

export async function setSoundEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(SOUND_ENABLED_KEY, enabled ? "1" : "0");
}

export type CachedPrayerTimes = {
  city?: string;
  fajr?: string;
  dhuhr?: string;
  asr?: string;
  maghrib?: string;
  isha?: string;
  updatedAt?: number;
};

export async function getCachedPrayerTimes(): Promise<CachedPrayerTimes | null> {
  try {
    const raw = await AsyncStorage.getItem(PRAYER_TIMES_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedPrayerTimes;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function setCachedPrayerTimes(
  times: CachedPrayerTimes,
): Promise<void> {
  const payload: CachedPrayerTimes = {
    ...times,
    updatedAt: Date.now(),
  };
  await AsyncStorage.setItem(PRAYER_TIMES_CACHE_KEY, JSON.stringify(payload));
}
