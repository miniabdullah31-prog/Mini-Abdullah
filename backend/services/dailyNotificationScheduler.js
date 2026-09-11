const cron = require("node-cron");
const {
  initFirebaseAdmin,
  isFirebaseReady,
  broadcastDailyNotification,
  broadcastTipNotification,
} = require("./notificationService");
const { TZ } = require("./dailyContentService");

let schedulerStarted = false;

function isEnvEnabled(name, defaultValue = true) {
  const raw = process.env[name];
  if (raw === undefined || raw === null || String(raw).trim() === "") {
    return defaultValue;
  }
  return String(raw).toLowerCase() !== "false";
}

async function runSafe(label, fn) {
  try {
    if (!isFirebaseReady()) initFirebaseAdmin();
    if (!isFirebaseReady()) return;
    const result = await fn();
    console.log(`[FCM] ${label}:`, result.skipped ? "skipped" : "sent", result);
  } catch (err) {
    console.log(`[FCM] ${label} schedule error:`, err.message);
  }
}

function scheduleFiveMinuteTestPush() {
  // DEV/test only — fires once ~5 minutes after backend start.
  // Disable after verifying: set ENABLE_FCM_TEST_PUSH=false in backend/.env and restart.
  if (!isEnvEnabled("ENABLE_FCM_TEST_PUSH", true)) {
    console.log("[FCM] 5-min test push disabled (ENABLE_FCM_TEST_PUSH=false)");
    return;
  }

  const delayMs = 5 * 60 * 1000;
  const fireAt = new Date(Date.now() + delayMs);
  console.log(
    `[FCM] 5-min test push armed — will fire at ~${fireAt.toISOString()} (local ${fireAt.toString()})`,
  );
  console.log(
    "[FCM] To remove the 5-min test later: set ENABLE_FCM_TEST_PUSH=false in backend/.env and restart the server",
  );

  setTimeout(() => {
    runSafe("5-min test push", () => broadcastTipNotification("test"));
  }, delayMs);
}

function startDailyNotificationScheduler() {
  if (schedulerStarted) {
    return;
  }
  schedulerStarted = true;

  initFirebaseAdmin();
  if (!isFirebaseReady()) {
    console.log(
      "[FCM] Scheduler waiting — configure Firebase Admin in .env to send push notifications",
    );
  }

  // One-shot test is independent of the daily cron flag (still gated by ENABLE_FCM_TEST_PUSH).
  scheduleFiveMinuteTestPush();

  if (!isEnvEnabled("ENABLE_FCM_SCHEDULER", true)) {
    console.log("[FCM] Daily scheduler disabled (ENABLE_FCM_SCHEDULER=false)");
    return;
  }

  // ── Existing daily slots (Asia/Karachi) ──────────────────────────
  // 08:00 — Word of the Day
  cron.schedule(
    "0 8 * * *",
    () => runSafe("Word of the Day", () => broadcastDailyNotification("word")),
    { timezone: TZ },
  );

  // 16:00 (4 PM) — Dua of the Day
  cron.schedule(
    "0 16 * * *",
    () => runSafe("Dua of the Day", () => broadcastDailyNotification("dua")),
    { timezone: TZ },
  );

  // 19:30 (7:30 PM) — Daily Quest
  cron.schedule(
    "30 19 * * *",
    () => runSafe("Daily Quest", () => broadcastDailyNotification("quest")),
    { timezone: TZ },
  );

  // ── New daily tips (Asia/Karachi) ────────────────────────────────
  // 10:30 — Mid-morning learning nudge
  cron.schedule(
    "30 10 * * *",
    () => runSafe("Morning tip", () => broadcastTipNotification("morningTip")),
    { timezone: TZ },
  );

  // 18:15 — Maghrib-ish evening tip
  cron.schedule(
    "15 18 * * *",
    () => runSafe("Evening tip", () => broadcastTipNotification("eveningTip")),
    { timezone: TZ },
  );

  // 21:00 — Bedtime dua nudge
  cron.schedule(
    "0 21 * * *",
    () => runSafe("Bedtime dua", () => broadcastTipNotification("bedtime")),
    { timezone: TZ },
  );

  console.log(
    `[FCM] Daily scheduler started (${TZ}: 08:00 word, 10:30 morningTip, 16:00 dua, 18:15 eveningTip, 19:30 quest, 21:00 bedtime)`,
  );
}

module.exports = { startDailyNotificationScheduler };
