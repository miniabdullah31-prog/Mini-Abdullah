const User = require("../models/User");

const MAX_TOKENS_PER_USER = 5;

function isValidFcmToken(token) {
  return (
    typeof token === "string" &&
    token.trim().length >= 20 &&
    token.trim().length <= 4096
  );
}

/** POST /api/notifications/register-token */
async function registerToken(req, res) {
  try {
    const { token, platform = "android" } = req.body || {};

    if (!isValidFcmToken(token)) {
      return res.status(400).json({
        success: false,
        message: "Invalid FCM token",
      });
    }

    const cleanToken = token.trim();
    const userId = req.user.id;

    // Remove this token from any other user (device switched accounts)
    await User.updateMany(
      { _id: { $ne: userId }, "fcmTokens.token": cleanToken },
      { $pull: { fcmTokens: { token: cleanToken } } },
    );

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const existing = (user.fcmTokens || []).find((t) => t.token === cleanToken);
    if (existing) {
      existing.updatedAt = new Date();
      existing.platform = platform;
      await user.save();
      return res.json({
        success: true,
        message: "FCM token updated",
      });
    }

    user.fcmTokens = user.fcmTokens || [];
    user.fcmTokens.push({
      token: cleanToken,
      platform,
      updatedAt: new Date(),
    });

    if (user.fcmTokens.length > MAX_TOKENS_PER_USER) {
      user.fcmTokens.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
      user.fcmTokens = user.fcmTokens.slice(0, MAX_TOKENS_PER_USER);
    }

    await user.save();

    return res.json({
      success: true,
      message: "FCM token registered",
    });
  } catch (err) {
    console.log("[notifications] register-token error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to register FCM token",
    });
  }
}

/** POST /api/notifications/test — send test push to authenticated user */
async function sendTestNotification(req, res) {
  try {
    const { type = "word" } = req.body || {};
    const allowed = ["word", "dua", "quest"];
    if (!allowed.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "type must be word, dua, or quest",
      });
    }

    const { sendTestToUser, isFirebaseReady, initFirebaseAdmin } = require(
      "../services/notificationService",
    );

    initFirebaseAdmin();
    if (!isFirebaseReady()) {
      return res.status(503).json({
        success: false,
        message: "Firebase Admin not configured on server",
      });
    }

    const result = await sendTestToUser(req.user.id, type);
    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json({
      success: true,
      message: "Test notification sent",
      ...result,
    });
  } catch (err) {
    console.log("[notifications] test error:", err.message);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to send test notification",
    });
  }
}

module.exports = {
  registerToken,
  sendTestNotification,
};
