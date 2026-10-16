/**
 * Firebase Cloud Messaging (FCM) — server push for Word / Dua / Daily Quest.
 *
 * Local prayer reminders stay in notificationService.ts (react-native-notify-kit).
 * Requires android/app/google-services.json and backend Firebase Admin credentials.
 */
import { PermissionsAndroid, Platform } from "react-native";
import axios from "axios";
import type { RemoteMessage } from "@react-native-firebase/messaging";
import { API_BASE_URL } from "../config/api";
import { getActiveAuthToken } from "./accountStore";
import {
  parseNotificationData,
  queueNotificationNavigation,
} from "./notificationNavigation";

const FCM_CHANNEL_ID = "miniabdullah_fcm";
const FCM_CHANNEL_NAME = "Mini Abdullah Learning";

type MessagingModule = typeof import("@react-native-firebase/messaging");

let messagingMod: MessagingModule | null = null;
let messagingLoadFailed = false;
let listenersAttached = false;
let unsubscribeForeground: (() => void) | null = null;
let unsubscribeOpened: (() => void) | null = null;
let unsubscribeTokenRefresh: (() => void) | null = null;

function loadMessaging(): MessagingModule | null {
  if (messagingLoadFailed) return null;
  if (messagingMod) return messagingMod;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    messagingMod = require("@react-native-firebase/messaging") as MessagingModule;
    return messagingMod;
  } catch (e) {
    messagingLoadFailed = true;
    console.warn("[FCM] Messaging module unavailable:", e);
    return null;
  }
}

async function ensureAndroidNotificationPermission(): Promise<boolean> {
  console.log("[FCM] Checking notification permission...");
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
          "Mini Abdullah sends daily Word, Dua, and Quest reminders to help you learn Islam!",
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

async function ensureFcmChannel(): Promise<void> {
  if (Platform.OS !== "android") return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require("react-native-notify-kit");
    const notifee = mod.default || mod;
    await notifee.createChannel({
      id: FCM_CHANNEL_ID,
      name: FCM_CHANNEL_NAME,
      importance: mod.AndroidImportance?.HIGH ?? 4,
      sound: "default",
    });
  } catch (e) {
    console.warn("[FCM] Channel create failed:", e);
  }
}

async function displayForegroundNotification(
  title: string,
  body: string,
  data?: Record<string, string>,
): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require("react-native-notify-kit");
    const notifee = mod.default || mod;
    await notifee.displayNotification({
      title,
      body,
      data: data || {},
      android: {
        channelId: FCM_CHANNEL_ID,
        pressAction: { id: "default" },
        smallIcon: "ic_launcher",
      },
    });
  } catch (e) {
    console.warn("[FCM] Foreground display failed:", e);
  }
}

export async function getFcmToken(): Promise<string | null> {
  const mod = loadMessaging();
if (!mod) return null;

try {
  await ensureAndroidNotificationPermission();
  const messaging = mod.getMessaging();
  const token = await mod.getToken(messaging);
    return token?.trim() || null;
  } catch (e) {
    console.warn("[FCM] getToken failed:", e);
    return null;
  }
}

export async function registerFcmTokenWithBackend(
  token?: string | null,
  baseURL = API_BASE_URL,
): Promise<boolean> {
  try {
    const authToken = await getActiveAuthToken();
    if (!authToken) return false;

    const fcmToken = token ?? (await getFcmToken());
    if (!fcmToken) return false;

    const response = await axios.post(
      `${baseURL}/api/notifications/register-token`,
      { token: fcmToken, platform: Platform.OS },
      {
        timeout: 15000,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      },
    );

    return !!response.data?.success;
  } catch (e) {
    console.warn("[FCM] register-token failed:", e);
    return false;
  }
}
function toStringRecord(
  data: Record<string, string | object> | undefined,
): Record<string, string | undefined> {
  const result: Record<string, string | undefined> = {};

  for (const [key, value] of Object.entries(data || {})) {
    if (typeof value === "string") {
      result[key] = value;
    }
  }

  return result;
}

function handleRemoteMessageOpen(
  data: Record<string, string | undefined> | undefined,
) {
  const target = parseNotificationData(data);
  if (target) {
    queueNotificationNavigation(target);
  }
}

function attachMessagingListeners(): void {
  if (listenersAttached) return;

  const mod = loadMessaging();
  if (!mod) return;

  const messaging = mod.getMessaging();
  listenersAttached = true;

  unsubscribeForeground = mod.onMessage(
    messaging,
    async (remoteMessage: RemoteMessage) => {
    const title =
  remoteMessage.notification?.title ||
  (typeof remoteMessage.data?.title === "string"
    ? remoteMessage.data.title
    : "Mini Abdullah");
const body =
  remoteMessage.notification?.body ||
  (typeof remoteMessage.data?.body === "string"
    ? remoteMessage.data.body
    : "New learning reminder!");

      const data: Record<string, string> = {};

for (const [key, value] of Object.entries(remoteMessage.data || {})) {
  if (typeof value === "string") {
    data[key] = value;
  }
}

await displayForegroundNotification(title, body, data);
    },
  );

    unsubscribeOpened = mod.onNotificationOpenedApp(
    messaging,
    (remoteMessage: RemoteMessage) => {
      handleRemoteMessageOpen(toStringRecord(remoteMessage?.data));
    },
  );

  unsubscribeTokenRefresh = mod.onTokenRefresh(
    messaging,
    async (newToken: string) => {
      await registerFcmTokenWithBackend(newToken);
    },
  );
}
export async function checkInitialNotification(): Promise<void> {
  const mod = loadMessaging();
  if (!mod) return;

  try {
    const messaging = mod.getMessaging();
    const initial = await mod.getInitialNotification(messaging);

    if (initial?.data) {
    handleRemoteMessageOpen(toStringRecord(initial.data));
      
    }
  } catch (e) {
    console.warn("[FCM] getInitialNotification failed:", e);
  }
}
/** Call once after user reaches Home / has session. Idempotent. */
/** Call once after user reaches Home / has session. Idempotent. */
export async function initFcmForAuthenticatedUser(): Promise<void> {
  console.log("[FCM] initFcmForAuthenticatedUser() called");

  const mod = loadMessaging();
  if (!mod) return;

  try {
    await ensureAndroidNotificationPermission();
    await ensureFcmChannel();

    const authToken = await getActiveAuthToken();
    if (!authToken) return;

    attachMessagingListeners();

    const token = await getFcmToken();
    if (token) {
      await registerFcmTokenWithBackend(token);
    }

    await checkInitialNotification();
  } catch (e) {
    console.warn("[FCM] init failed:", e);
  }
}
export function teardownFcmListeners(): void {
  unsubscribeForeground?.();
  unsubscribeOpened?.();
  unsubscribeTokenRefresh?.();
  unsubscribeForeground = null;
  unsubscribeOpened = null;
  unsubscribeTokenRefresh = null;
  listenersAttached = false;
}

/** Background handler — register from index.js before AppRegistry */
export function registerBackgroundMessageHandler(): void {
  const mod = loadMessaging();
  if (!mod) return;

  const messaging = mod.getMessaging();

  mod.setBackgroundMessageHandler(
    messaging,
    async (_remoteMessage: RemoteMessage) => {
      // System tray handles notification+data payloads
      // when the app is backgrounded.
    },
  );
}

/** Notify-kit press events for foreground-displayed FCM messages */
export function attachNotifeePressHandler(): (() => void) | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require("react-native-notify-kit");
    const notifee = mod.default || mod;
    return notifee.onForegroundEvent(({ type, detail }: any) => {
      const pressTypes = [mod.EventType?.PRESS, 1];
      if (!pressTypes.includes(type)) return;
      const data = detail?.notification?.data as
        | Record<string, string | undefined>
        | undefined;
      handleRemoteMessageOpen(data);
    });
  } catch {
    return null;
  }
}
