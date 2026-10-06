const { initializeApp, getApps, cert } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");
const path = require("path");
const User = require("../models/User");
const {
  getTodayContent,
  toClientShape,
  todayKey,
} = require("./dailyContentService");
const DailyContent = require("../models/DailyContent");

let firebaseReady = false;

function initFirebaseAdmin() {
  if (firebaseReady) {
    return true;
  }

  try {
    if (getApps().length > 0) {
      firebaseReady = true;
      return true;
    }

    const jsonPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    const jsonInline = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

    if (jsonPath && String(jsonPath).trim()) {
      const resolved = path.isAbsolute(jsonPath)
        ? jsonPath
        : path.join(__dirname, "..", jsonPath);
      if (!require("fs").existsSync(resolved)) {
        console.log(`[FCM] Service account file not found: ${resolved}`);
        return false;
      }
      // eslint-disable-next-line import/no-dynamic-require, global-require
      const serviceAccount = require(resolved);
      initializeApp({
        credential: cert(serviceAccount),
      });
      firebaseReady = true;
      console.log("[FCM] Firebase Admin initialized (service account file)");
      return true;
    }

    if (jsonInline && String(jsonInline).trim()) {
      const serviceAccount = JSON.parse(String(jsonInline));
      initializeApp({
        credential: cert(serviceAccount),
      });
      firebaseReady = true;
      console.log("[FCM] Firebase Admin initialized (inline JSON env)");
      return true;
    }

    console.log(
      "[FCM] Firebase Admin not configured — set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_JSON in backend/.env",
    );
    return false;
  } catch (err) {
    console.log("[FCM] Firebase Admin init failed:", err.message);
    return false;
  }
}

function isFirebaseReady() {
  return firebaseReady && getApps().length > 0;
}

async function collectAllTokens() {
  const users = await User.find(
    { "fcmTokens.0": { $exists: true } },
    { fcmTokens: 1 },
  ).lean();

  const tokens = new Set();
  for (const user of users) {
    for (const entry of user.fcmTokens || []) {
      if (entry?.token && typeof entry.token === "string") {
        tokens.add(entry.token.trim());
      }
    }
  }
  return [...tokens];
}

async function sendToTokens(tokens, payload) {
  if (!tokens.length) {
    return { success: false, message: "No FCM tokens registered" };
  }
  if (!initFirebaseAdmin() || !isFirebaseReady()) {
    return { success: false, message: "Firebase Admin not configured" };
  }

  const message = {
    tokens,
    notification: {
      title: payload.title,
      body: payload.body,
    },
    data: {
      type: String(payload.type || "word"),
      screen: String(payload.screen || "10"),
      click_action: "FLUTTER_NOTIFICATION_CLICK",
    },
    android: {
      priority: "high",
      notification: {
        channelId: "miniabdullah_fcm_v2",
        sound: "default",
        defaultSound: true,
        defaultVibrateTimings: true,
        icon: "ic_stat_miniabdullah",
        color: "#7B5CFA",
      },
    },
  };

  const response = await getMessaging().sendEachForMulticast(message);

  const permanentErrorCodes = new Set([
    "messaging/registration-token-not-registered",
    "messaging/invalid-registration-token",
  ]);

  const deadTokens = [];
  for (let i = 0; i < response.responses.length; i += 1) {
    const entry = response.responses[i];
    if (entry.success) continue;
    const code = entry.error && entry.error.code;
    if (!permanentErrorCodes.has(code)) continue;
    const failedToken = tokens[i];
    if (typeof failedToken === "string" && failedToken) {
      deadTokens.push(failedToken);
    }
  }

  if (deadTokens.length > 0) {
    try {
      await User.updateMany(
        { "fcmTokens.token": { $in: deadTokens } },
        { $pull: { fcmTokens: { token: { $in: deadTokens } } } },
      );
    } catch (_cleanupErr) {
      // Keep send result intact; do not log token values.
    }
  }

  if (response.successCount === 0) {
    return {
      success: false,
      message: "All FCM deliveries failed",
      successCount: response.successCount,
      failureCount: response.failureCount,
    };
  }

  return {
    success: true,
    successCount: response.successCount,
    failureCount: response.failureCount,
  };
}

async function broadcastDailyNotification(type) {
  const content = await getTodayContent();
  const shaped = toClientShape(content);
  if (!shaped) {
    return { success: false, message: "No daily content" };
  }

  const dateKey = todayKey();
  const fieldMap = {
    word: { sentField: "wordSentAt", build: buildWordPayload },
    dua: { sentField: "duaSentAt", build: buildDuaPayload },
    quest: { sentField: "questSentAt", build: buildQuestPayload },
  };

  const cfg = fieldMap[type];
  if (!cfg) {
    return { success: false, message: "Unknown notification type" };
  }

  const doc = await DailyContent.findOne({ date: dateKey });
  if (doc?.[cfg.sentField]) {
    return {
      success: true,
      skipped: true,
      message: `${type} already sent today`,
    };
  }

  const payload = cfg.build(shaped);
  const tokens = await collectAllTokens();
  const result = await sendToTokens(tokens, payload);

  if (result.success && !result.skipped) {
    await DailyContent.updateOne(
      { date: dateKey },
      { $set: { [cfg.sentField]: new Date() } },
    );
  }

  return result;
}

function buildWordPayload(content) {
  return {
    type: "word",
    screen: "10",
    title: "🌟 Today's Islamic Word",
    body: `Learn today's word: ${content.word} — ${content.wordMeaning}. Tap to continue your learning!`,
  };
}

function buildDuaPayload(_content) {
  return {
    type: "dua",
    screen: "15",
    title: "🤲 Today's Dua",
    body: "A beautiful Dua is waiting for you. Open Mini Abdullah and learn it!",
  };
}

function buildQuestPayload(content) {
  return {
    type: "quest",
    screen: "18",
    title: "🎮 Your Daily Quest is Ready!",
    body: `Complete today's Islamic challenge: ${content.questTitle} — earn ${content.rewardXP} XP and ${content.rewardCoins} coins!`,
  };
}

async function sendTestToUser(userId, type = "word") {
  const user = await User.findById(userId).lean();
  if (!user?.fcmTokens?.length) {
    return { success: false, message: "No FCM token on this account" };
  }
  const tokens = user.fcmTokens.map((t) => t.token).filter(Boolean);
  const content = toClientShape(await getTodayContent());
  const builders = {
    word: buildWordPayload,
    dua: buildDuaPayload,
    quest: buildQuestPayload,
  };
  const payload = builders[type]?.(content) || buildWordPayload(content);
  return sendToTokens(tokens, payload);
}

/** Tip / reminder payloads (no DailyContent sent-at tracking — cron fires once/day). */
function buildMorningTipPayload() {
  return {
    type: "word",
    screen: "10",
    title: "☀️ Mid-morning learning time!",
    body: "Take a tiny break and learn one Name of Allah with Mini Abdullah. You've got this!",
  };
}

function buildEveningTipPayload() {
  return {
    type: "dua",
    screen: "15",
    title: "🌅 Evening tip from Abdullah",
    body: "Maghrib vibes! Say Alhamdulillah for today, then open a short dua with Mini Abdullah.",
  };
}

function buildBedtimePayload() {
  return {
    type: "dua",
    screen: "15",
    title: "🌙 Bedtime dua nudge",
    body: "Time to rest! Recite your sleep dua and sleep with a happy heart. Mini Abdullah is proud of you!",
  };
}

function buildTestPushPayload() {
  return {
    type: "word",
    screen: "10",
    title: "🔔 Mini Abdullah test ping",
    body: "This is your 5-minute FCM sound test. If you hear this, push + sound are working!",
  };
}

const tipBuilders = {
  morningTip: buildMorningTipPayload,
  eveningTip: buildEveningTipPayload,
  bedtime: buildBedtimePayload,
  test: buildTestPushPayload,
};

/** Broadcast a tip/test notification to all registered FCM tokens (no daily dedup). */
async function broadcastTipNotification(tipKey) {
  const build = tipBuilders[tipKey];
  if (!build) {
    return { success: false, message: `Unknown tip type: ${tipKey}` };
  }
  const tokens = await collectAllTokens();
  return sendToTokens(tokens, build());
}

module.exports = {
  initFirebaseAdmin,
  isFirebaseReady,
  sendToTokens,
  broadcastDailyNotification,
  broadcastTipNotification,
  sendTestToUser,
  buildWordPayload,
  buildDuaPayload,
  buildQuestPayload,
  buildMorningTipPayload,
  buildEveningTipPayload,
  buildBedtimePayload,
  buildTestPushPayload,
};
