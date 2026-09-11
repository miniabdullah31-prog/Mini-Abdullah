/**
 * Local scheduled notifications for Mini Abdullah (FYP).
 *
 * Approach: react-native-notify-kit (maintained Notifee-compatible API).
 * No Firebase / FCM — this project has no google-services.json.
 * Prayer times + daily reminders are scheduled on-device when Profile
 * Notifications is ON. Server push is not required for the demo.
 */
import { PermissionsAndroid, Platform } from "react-native";
import {
  getNotificationsEnabled,
  getCachedPrayerTimes,
  CachedPrayerTimes,
} from "./appPrefsStore";

const CHANNEL_ID = "miniabdullah_reminders";
const CHANNEL_NAME = "Mini Abdullah Reminders";
const SMALL_ICON = "ic_stat_miniabdullah";
const LARGE_ICON = "ic_notification_logo";
const ACCENT_COLOR = "#7B5CFA";

const ID = {
  quote: "daily-islamic-quote",
  sunnah: "daily-sunnah-reminder",
  lesson: "evening-learning-nudge",
  fajr: "prayer-fajr",
  dhuhr: "prayer-dhuhr",
  asr: "prayer-asr",
  maghrib: "prayer-maghrib",
  isha: "prayer-isha",
} as const;

type NotifeeModule = typeof import("react-native-notify-kit").default & {
  createChannel: (c: object) => Promise<string>;
  createTriggerNotification: (n: object, t: object) => Promise<string>;
  displayNotification: (n: object) => Promise<string>;
  cancelAllNotifications: () => Promise<void>;
  requestPermission: () => Promise<{ authorizationStatus: number }>;
};

type TriggerEnums = {
  TriggerType: { TIMESTAMP: number };
  RepeatFrequency: { DAILY: number; NONE: number };
  AndroidImportance: { HIGH: number; DEFAULT: number };
  AuthorizationStatus: {
    AUTHORIZED: number;
    PROVISIONAL: number;
    DENIED: number;
  };
};

let notifee: NotifeeModule | null = null;
let enums: TriggerEnums | null = null;
let loadFailed = false;

function loadNotifee(): { notifee: NotifeeModule; enums: TriggerEnums } | null {
  if (loadFailed) return null;
  if (notifee && enums) return { notifee, enums };
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require("react-native-notify-kit");
    notifee = (mod.default || mod) as NotifeeModule;
    enums = {
      TriggerType: mod.TriggerType,
      RepeatFrequency: mod.RepeatFrequency,
      AndroidImportance: mod.AndroidImportance,
      AuthorizationStatus: mod.AuthorizationStatus,
    };
    return { notifee: notifee!, enums: enums! };
  } catch (e) {
    loadFailed = true;
    console.warn("[notifications] Library unavailable:", e);
    return null;
  }
}

async function ensureAndroidPermission(): Promise<boolean> {
  if (Platform.OS !== "android") return true;
  try {
    if (Platform.Version < 33) return true;
    const granted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    if (granted) return true;
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      {
        title: "Notifications",
        message:
          "Mini Abdullah would like to remind you about prayer times and daily learning.",
        buttonPositive: "Allow",
        buttonNegative: "Not now",
      },
    );
    return (
      result === PermissionsAndroid.RESULTS.GRANTED || result === "granted"
    );
  } catch {
    return false;
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const androidOk = await ensureAndroidPermission();
    if (!androidOk) return false;

    const loaded = loadNotifee();
    if (!loaded) return false;

    const settings = await loaded.notifee.requestPermission();
    const status = settings?.authorizationStatus;
    const Auth = loaded.enums.AuthorizationStatus;
    return (
      status === Auth.AUTHORIZED ||
      status === Auth.PROVISIONAL ||
      status === 1 ||
      status === 2
    );
  } catch (e) {
    console.warn("[notifications] Permission failed:", e);
    return false;
  }
}

async function ensureChannel(): Promise<void> {
  const loaded = loadNotifee();
  if (!loaded || Platform.OS !== "android") return;
  try {
    await loaded.notifee.createChannel({
      id: CHANNEL_ID,
      name: CHANNEL_NAME,
      importance: loaded.enums.AndroidImportance.HIGH,
      sound: "default",
    });
  } catch (e) {
    console.warn("[notifications] Channel create failed:", e);
  }
}

function nextOccurrenceMs(hour: number, minute: number): number {
  const d = new Date();
  d.setSeconds(0, 0);
  d.setHours(hour, minute, 0, 0);
  if (d.getTime() <= Date.now() + 15_000) {
    d.setDate(d.getDate() + 1);
  }
  return d.getTime();
}

/** Parse "05:30", "5:30 AM", "17:45" → { hour, minute } or null. */
export function parsePrayerClock(
  raw: string | undefined | null,
): { hour: number; minute: number } | null {
  if (!raw || typeof raw !== "string") return null;
  const s = raw.trim();
  const ampm = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (ampm) {
    let hour = Number(ampm[1]);
    const minute = Number(ampm[2]);
    const mer = ampm[3].toUpperCase();
    if (mer === "PM" && hour < 12) hour += 12;
    if (mer === "AM" && hour === 12) hour = 0;
    if (hour > 23 || minute > 59) return null;
    return { hour, minute };
  }
  const h24 = s.match(/^(\d{1,2}):(\d{2})$/);
  if (h24) {
    const hour = Number(h24[1]);
    const minute = Number(h24[2]);
    if (hour > 23 || minute > 59) return null;
    return { hour, minute };
  }
  return null;
}

async function scheduleAt(
  id: string,
  title: string,
  body: string,
  timestamp: number,
  repeatDaily: boolean,
): Promise<void> {
  const loaded = loadNotifee();
  if (!loaded) return;
  if (timestamp <= Date.now()) return;

  const trigger = {
    type: loaded.enums.TriggerType.TIMESTAMP,
    timestamp,
    repeatFrequency: repeatDaily
      ? loaded.enums.RepeatFrequency.DAILY
      : loaded.enums.RepeatFrequency.NONE,
    alarmManager: { allowWhileIdle: true },
  };

  await loaded.notifee.createTriggerNotification(
    {
      id,
      title,
      body,
      android: {
        channelId: CHANNEL_ID,
        pressAction: { id: "default" },
        smallIcon: SMALL_ICON,
        largeIcon: LARGE_ICON,
        color: ACCENT_COLOR,
        circularLargeIcon: true,
      },
    },
    trigger,
  );
}

const PRAYER_COPY: Record<
  keyof Omit<CachedPrayerTimes, "city" | "updatedAt">,
  { id: string; title: string; body: string }
> = {
  fajr: {
    id: ID.fajr,
    title: "Fajr time! 🌅",
    body: "Good morning little star — time for Fajr prayer. Allah loves your salah!",
  },
  dhuhr: {
    id: ID.dhuhr,
    title: "Dhuhr time! ☀️",
    body: "It's Dhuhr — take a short break and pray. You're doing great!",
  },
  asr: {
    id: ID.asr,
    title: "Asr time! 🌤️",
    body: "Asr is here! Let's pray together and make Allah happy.",
  },
  maghrib: {
    id: ID.maghrib,
    title: "Maghrib time! 🌇",
    body: "Sun is setting — Maghrib prayer time. Open Mini Abdullah!",
  },
  isha: {
    id: ID.isha,
    title: "Isha time! 🌙",
    body: "Isha prayer before sleep. End your day with a beautiful salah!",
  },
};

async function schedulePrayerReminders(
  times: CachedPrayerTimes | null,
): Promise<void> {
  // Demo-friendly defaults if user enabled notifications before opening Prayer Times
  const effective: CachedPrayerTimes = times || {
    fajr: "05:15",
    dhuhr: "12:30",
    asr: "16:00",
    maghrib: "18:45",
    isha: "20:15",
  };
  const keys: (keyof typeof PRAYER_COPY)[] = [
    "fajr",
    "dhuhr",
    "asr",
    "maghrib",
    "isha",
  ];
  for (const key of keys) {
    const clock = parsePrayerClock(effective[key]);
    if (!clock) continue;
    const copy = PRAYER_COPY[key];
    const ts = nextOccurrenceMs(clock.hour, clock.minute);
    try {
      await scheduleAt(copy.id, copy.title, copy.body, ts, true);
    } catch (e) {
      console.warn(`[notifications] Prayer ${key} schedule failed:`, e);
    }
  }
}

async function scheduleDailyReminders(): Promise<void> {
  try {
    await scheduleAt(
      ID.quote,
      "Mini Abdullah 🌟",
      "Assalamualaikum! 12:30 reminder — open Mini Abdullah for today's Islamic quote.",
      nextOccurrenceMs(12, 30),
      true,
    );
  } catch (e) {
    console.warn("[notifications] 12:30 reminder schedule failed:", e);
  }

  try {
    await scheduleAt(
      ID.sunnah,
      "Mini Abdullah 💚",
      "5:00 PM reminder — learn one lovely Sunnah of Prophet ﷺ today!",
      nextOccurrenceMs(17, 0),
      true,
    );
  } catch (e) {
    console.warn("[notifications] 5:00 reminder schedule failed:", e);
  }

  try {
    await scheduleAt(
      ID.lesson,
      "Mini Abdullah 📖",
      "9:00 PM reminder — a short Quran lesson before sleep keeps your heart bright.",
      nextOccurrenceMs(21, 0),
      true,
    );
  } catch (e) {
    console.warn("[notifications] 9:00 reminder schedule failed:", e);
  }
}

export async function cancelAllAppNotifications(): Promise<void> {
  try {
    const loaded = loadNotifee();
    if (!loaded) return;
    await loaded.notifee.cancelAllNotifications();
  } catch (e) {
    console.warn("[notifications] Cancel failed:", e);
  }
}

/**
 * Enable: permission + channel + schedule all reminders.
 * Disable: cancel everything.
 */
export async function syncNotificationsFromPreference(
  enabled: boolean,
): Promise<boolean> {
  try {
    if (!enabled) {
      await cancelAllAppNotifications();
      return true;
    }

    const allowed = await requestNotificationPermission();
    if (!allowed) {
      await cancelAllAppNotifications();
      return false;
    }

    await ensureChannel();
    await cancelAllAppNotifications();

    const times = await getCachedPrayerTimes();
    await schedulePrayerReminders(times);
    await scheduleDailyReminders();
    return true;
  } catch (e) {
    console.warn("[notifications] Sync failed:", e);
    return false;
  }
}

/** Call on app / Home mount if notifications preference is ON. */
export async function hydrateNotificationsIfEnabled(): Promise<void> {
  try {
    const enabled = await getNotificationsEnabled();
    if (!enabled) return;
    await syncNotificationsFromPreference(true);
  } catch (e) {
    console.warn("[notifications] Hydrate failed:", e);
  }
}

/** Re-schedule after Home fetches new prayer times (if notifications ON). */
export async function refreshPrayerNotificationsIfEnabled(): Promise<void> {
  try {
    const enabled = await getNotificationsEnabled();
    if (!enabled) return;
    await syncNotificationsFromPreference(true);
  } catch (e) {
    console.warn("[notifications] Prayer refresh failed:", e);
  }
}
