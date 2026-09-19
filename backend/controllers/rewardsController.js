const {
  getBalance,
  isClaimed,
  claimReward,
  todayKey,
} = require("../services/rewardsService");

async function getMe(req, res) {
  try {
    const balance = await getBalance(req.user.id);
    const questClaimed = await isClaimed(req.user.id, "quest", todayKey());
    return res.json({
      success: true,
      data: {
        ...balance,
        todayQuestClaimed: questClaimed,
      },
    });
  } catch (err) {
    console.log("[rewards] getMe error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to load coins",
    });
  }
}

async function claim(req, res) {
  try {
    const source = String(req.body?.source || "").trim();
    const sourceId = String(req.body?.sourceId || "").trim();
    if (!["game", "sunnah", "quest"].includes(source) || !sourceId) {
      return res.status(400).json({
        success: false,
        message: "Invalid reward request",
      });
    }

    const result = await claimReward(req.user.id, source, sourceId);
    if (!result.ok) {
      return res.status(result.status || 400).json({
        success: false,
        message: result.message || "Could not claim reward",
      });
    }

    return res.json({
      success: true,
      data: {
        coins: result.coins,
        xp: result.xp,
        awarded: result.awarded,
        alreadyClaimed: result.alreadyClaimed,
      },
    });
  } catch (err) {
    console.log("[rewards] claim error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to claim reward",
    });
  }
}

module.exports = { getMe, claim };
