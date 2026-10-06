/** Pending screen navigation from notification tap (cold start / background). */
export type NotificationNavTarget = {
  screen: number;
  type?: "word" | "dua" | "quest" | "tutor";
  appointmentId?: string;
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
  const appointmentId =
    typeof data.appointmentId === "string" && data.appointmentId.trim()
      ? data.appointmentId.trim()
      : undefined;

  if (type === "tutor") {
    return { screen: 21, type: "tutor", appointmentId };
  }
  if (type === "word") {
    return { screen: 10, type: "word" };
  }
  if (type === "dua") {
    return { screen: 15, type: "dua" };
  }
  if (type === "quest") {
    return { screen: 18, type: "quest" };
  }
  if (Number.isFinite(screenNum) && screenNum >= 10 && screenNum <= 21) {
    return {
      screen: screenNum,
      type: screenNum === 21 ? "tutor" : type,
      appointmentId: screenNum === 21 ? appointmentId : undefined,
    };
  }
  return null;
}

export function consumePendingNotificationNav(): NotificationNavTarget | null {
  const target = pendingTarget;
  pendingTarget = null;
  return target;
}
