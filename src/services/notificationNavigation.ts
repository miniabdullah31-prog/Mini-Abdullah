/** Pending screen navigation from notification tap (cold start / background). */
export type NotificationNavTarget = {
  screen: number;
  type?: "word" | "dua" | "quest";
};

let pendingTarget: NotificationNavTarget | null = null;
let navigateHandler: ((target: NotificationNavTarget) => void) | null = null;

export function setNotificationNavigator(
  handler: (target: NotificationNavTarget) => void,
) {
  navigateHandler = handler;
  if (pendingTarget) {
    handler(pendingTarget);
    pendingTarget = null;
  }
}

export function queueNotificationNavigation(target: NotificationNavTarget) {
  if (navigateHandler) {
    navigateHandler(target);
    return;
  }
  pendingTarget = target;
}

export function parseNotificationData(
  data: Record<string, string | undefined> | undefined,
): NotificationNavTarget | null {
  if (!data) return null;

  const type = data.type as NotificationNavTarget["type"] | undefined;
  const screenNum = Number.parseInt(String(data.screen || ""), 10);

  if (type === "word") {
    return { screen: 10, type: "word" };
  }
  if (type === "dua") {
    return { screen: 15, type: "dua" };
  }
  if (type === "quest") {
    return { screen: 18, type: "quest" };
  }
  if (Number.isFinite(screenNum) && screenNum >= 10 && screenNum <= 20) {
    return { screen: screenNum, type };
  }
  return null;
}

export function consumePendingNotificationNav(): NotificationNavTarget | null {
  const target = pendingTarget;
  pendingTarget = null;
  return target;
}
