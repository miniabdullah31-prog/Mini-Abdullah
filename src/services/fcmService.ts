/**
 * Firebase Cloud Messaging (FCM) — server push for Word / Dua / Daily Quest.
 *
 * Local prayer reminders stay in notificationService.ts (react-native-notify-kit).
 * Requires android/app/google-services.json and backend Firebase Admin credentials.
 */
import "@react-native-firebase/app";
import { PermissionsAndroid, Platform } from "react-native";
import axios from "axios";
import type { Messaging, RemoteMessage } from "@react-native-firebase/messaging";
import { getMessaging } from "@react-native-firebase/messaging";
import type {
  AndroidImportance,
  EventType,
  ModuleWithStatics,
} from "react-native-notify-kit";
import { API_BASE_URL } from "../config/api";
import { getActiveAuthToken } from "./accountStore";
import {
  parseNotificationData,
  queueNotificationNavigation,
} from "./notificationNavigation";

const FCM_CHANNEL_ID = "miniabdullah_fcm_v2";
const FCM_CHANNEL_NAME = "Mini Abdullah Learning";

type NotifyKitRuntimeEnums = {
  EventType: typeof EventType;
  AndroidImportance: typeof AndroidImportance;
};

let notifeeMod: ModuleWithStatics | null = null;
let notifyKitEnums: NotifyKitRuntimeEnums | null = null;
let notifyKitLoadFailed = false;

function logFcmError(context: string, error: unknown): void {
  const msg = error instanceof Error ? error.message : String(error);
  console.warn(`[FCM] ERROR: ${context} — ${msg}`);
}

function loadNotifyKit(): { notifee: ModuleWithStatics; enums: NotifyKitRuntimeEnums } | null {
  if (notifyKitLoadFailed) return null;
  if (notifeeMod && notifyKitEnums) {
    return { notifee: notifeeMod, enums: notifyKitEnums };
  }
  try {
    const mod = require("react-native-notify-kit") as {
      default?: ModuleWithStatics;
      EventType: typeof EventType;
      AndroidImportance: typeof AndroidImportance;
    };
    const api = (mod.default ?? mod) as ModuleWithStatics;
    const enums: NotifyKitRuntimeEnums = {
      EventType: mod.EventType,
      AndroidImportance: mod.AndroidImportance,
    };
    notifeeMod = api;
    notifyKitEnums = enums;
    return { notifee: api, enums };
  } catch (e) {
    notifyKitLoadFailed = true;
    logFcmError("notify-kit load", e);
    return null;
  }
}

let messagingInstance: Messaging | null = null;
let listenersAttached = false;
let unsubscribeForeground: (() => void) | null = null;
let unsubscribeOpened: (() => void) | null = null;
let unsubscribeTokenRefresh: (() => void) | null = null;

function loadMessaging(): Messaging | null {
  if (messagingInstance) {
    return messagingInstance;
  }
  try {
    console.log("[FCM] module loading");
    messagingInstance = getMessaging();
    console.log("[FCM] module loaded successfully");
    return messagingInstance;
  } catch (e) {
    // Do not latch failures — index.js may run before native Firebase is ready;
    // initFcmForAuthenticatedUser() retries when the user reaches Home.
    logFcmError("module load", e);
    return null;
  }
}

function logPlatformContext(): void {
  console.log(
    `[FCM] platform=${Platform.OS} apiLevel=${androidApiLevel()}`,
  );
}

function androidApiLevel(): number {
  if (typeof Platform.Version === "number") return Platform.Version;
  const parsed = Number.parseInt(String(Platform.Version), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

async function ensureAndroidNotificationPermission(): Promise<boolean> {
  if (Platform.OS !== "android") return true;
  try {
    if (androidApiLevel() < 33) {
      console.log("[FCM] Checking notification permission... (not required below API 33)");
      return true;
    }

    console.log("[FCM] Checking notification permission...");
    const granted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    if (granted) {
      console.log("[FCM] permission already granted");
      return true;
    }

    console.log("[FCM] requesting notification permission");
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
    const allowed = result === PermissionsAndroid.RESULTS.GRANTED;
    console.log("[FCM] permission result:", allowed ? "granted" : result);
    return allowed;
  } catch (e) {
    logFcmError("notification permission", e);
    return false;
  }
}

async function ensureFcmChannel(): Promise<void> {
  if (Platform.OS !== "android") return;
  const loaded = loadNotifyKit();
  if (!loaded) return;
  try {
    await loaded.notifee.createChannel({
      id: FCM_CHANNEL_ID,
      name: FCM_CHANNEL_NAME,
      importance: loaded.enums.AndroidImportance.HIGH,
      sound: "default",
      vibration: true,
    });
  } catch (e) {
    logFcmError("channel create", e);
  }
}

async function displayForegroundNotification(
  title: string,
  body: string,
  data?: Record<string, string>,
): Promise<void> {
  const loaded = loadNotifyKit();
  if (!loaded) return;
  try {
    await loaded.notifee.displayNotification({
      title,
      body,
      data: data || {},
      android: {
        channelId: FCM_CHANNEL_ID,
        pressAction: { id: "default" },
        smallIcon: "ic_stat_miniabdullah",
        largeIcon: "ic_notification_logo",
        color: "#7B5CFA",
        circularLargeIcon: true,
        // Match channel + FCM android.notification.sound so foreground also plays audio
        sound: "default",
        importance: loaded.enums.AndroidImportance.HIGH,
      },
    });
    console.log("[FCM] notification displayed");
  } catch (e) {
    logFcmError("foreground display", e);
  }
}

export async function getFcmToken(): Promise<string | null> {
  const messaging = loadMessaging();
  if (!messaging) return null;

  try {
    await ensureAndroidNotificationPermission();
    console.log("[FCM] getting FCM token");
    const token = await messaging.getToken();
    if (token?.trim()) {
      console.log("[FCM] FCM token received");
      return token.trim();
    }
    logFcmError("getToken", "empty token");
    return null;
  } catch (e) {
    logFcmError("getToken", e);
    return null;
  }
}

export async function registerFcmTokenWithBackend(
  token?: string | null,
  baseURL = API_BASE_URL,
): Promise<boolean> {
  try {
    const authToken = await getActiveAuthToken();
    if (!authToken) {
      logFcmError("register-token", "no auth token — user not logged in");
      return false;
    }

    const fcmToken = token ?? (await getFcmToken());
    if (!fcmToken) {
      logFcmError("register-token", "no FCM token available");
      return false;
    }

    const registerUrl = `${baseURL}/api/notifications/register-token`;
    console.log("[FCM] backend registration started");
    console.log(`[FCM] backend URL: ${registerUrl}`);
    const response = await axios.post(
      registerUrl,
      { token: fcmToken, platform: Platform.OS },
      {
        timeout: 15000,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      },
    );

    if (response.data?.success) {
      console.log("[FCM] backend token registration successful");
      return true;
    }
    logFcmError(
      "register-token",
      `backend rejected registration: ${response.data?.message || "not successful"}`,
    );
    return false;
  } catch (e) {
    if (axios.isAxiosError(e)) {
      const status = e.response?.status;
      const message = e.response?.data?.message || e.message;
      logFcmError(
        "register-token",
        status ? `HTTP ${status} — ${message}` : message,
      );
    } else {
      logFcmError("register-token", e);
    }
    return false;
  }
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
  if (listenersAttached) {
    console.log("[FCM] listeners already attached — skipping");
    return;
  }
  const messaging = loadMessaging();
  if (!messaging) {
    logFcmError("attach listeners", "messaging module unavailable");
    return;
  }

  listenersAttached = true;
  console.log("[FCM] attaching messaging listeners");

  unsubscribeForeground = messaging.onMessage(async (remoteMessage: RemoteMessage) => {
    console.log("[FCM] foreground message received");
    const title =
      remoteMessage.notification?.title ||
      (typeof remoteMessage.data?.title === "string"
        ? remoteMessage.data.title
        : undefined) ||
      "Mini Abdullah";
    const body =
      remoteMessage.notification?.body ||
      (typeof remoteMessage.data?.body === "string"
        ? remoteMessage.data.body
        : undefined) ||
      "New learning reminder!";
    const data = Object.fromEntries(
      Object.entries(remoteMessage.data || {}).filter(
        (entry): entry is [string, string] => typeof entry[1] === "string",
      ),
    );
    await displayForegroundNotification(title, body, data);
  });

  unsubscribeOpened = messaging.onNotificationOpenedApp(
    (remoteMessage: RemoteMessage) => {
      handleRemoteMessageOpen(
        remoteMessage?.data as Record<string, string | undefined>,
      );
    },
  );

  unsubscribeTokenRefresh = messaging.onTokenRefresh(async (newToken: string) => {
    console.log("[FCM] token refreshed");
    await registerFcmTokenWithBackend(newToken);
  });

  console.log("[FCM] messaging listeners attached");
}

export async function checkInitialNotification(): Promise<void> {
  const messaging = loadMessaging();
  if (!messaging) return;

  try {
    const initial = await messaging.getInitialNotification();
    if (initial?.data) {
      handleRemoteMessageOpen(
        initial.data as Record<string, string | undefined>,
      );
    }
    console.log("[FCM] initial notification checked");
  } catch (e) {
    logFcmError("getInitialNotification", e);
  }
}

/** Call once after user reaches Home / has session. Idempotent. */
export async function initFcmForAuthenticatedUser(): Promise<void> {
  console.log("[FCM] initFcmForAuthenticatedUser() called");
  logPlatformContext();

  const messaging = loadMessaging();
  if (!messaging) {
    logFcmError("init", "Firebase Messaging unavailable — loadMessaging() returned null");
    return;
  }

  try {
    console.log("[FCM] FCM initialization started");
    await ensureAndroidNotificationPermission();
    await ensureFcmChannel();

    const authToken = await getActiveAuthToken();
    if (!authToken) {
      logFcmError("init", "no authenticated session");
      return;
    }
    console.log("[FCM] authenticated user/session found");

    attachMessagingListeners();

    const token = await getFcmToken();
    if (token) {
      await registerFcmTokenWithBackend(token);
    } else {
      logFcmError("init", "FCM token could not be obtained");
    }

    await checkInitialNotification();
    console.log("[FCM] initFcmForAuthenticatedUser() completed");
  } catch (e) {
    logFcmError("init", e);
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
  console.log("[FCM] registerBackgroundMessageHandler() called");
  try {
    const messaging = loadMessaging();
    if (!messaging) {
      logFcmError(
        "registerBackgroundMessageHandler",
        "messaging unavailable at startup — will retry when Home initializes FCM",
      );
      return;
    }

    messaging.setBackgroundMessageHandler(async (_remoteMessage: RemoteMessage) => {
      // System tray handles notification+data payloads when app is backgrounded.
    });
    console.log("[FCM] background message handler registered");
  } catch (e) {
    logFcmError("registerBackgroundMessageHandler", e);
  }
}

/** Notify-kit press events for foreground-displayed FCM messages */
export function attachNotifeePressHandler(): (() => void) | null {
  const loaded = loadNotifyKit();
  if (!loaded) return null;
  try {
    const pressType = loaded.enums.EventType.PRESS;
    return loaded.notifee.onForegroundEvent(({ type, detail }) => {
      if (type !== pressType) return;
      const data = detail?.notification?.data as
        | Record<string, string | undefined>
        | undefined;
      handleRemoteMessageOpen(data);
    });
  } catch (e) {
    logFcmError("notifee press handler", e);
    return null;
  }
}
