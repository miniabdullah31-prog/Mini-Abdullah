const User = require("../models/User");
const RewardClaim = require("../models/RewardClaim");
const { todayKey, getTodayContent } = require("./dailyContentService");

const GAME_COINS = 10;
const GAME_XP = 5;
const SUNNAH_COINS = 5;
const SUNNAH_XP = 3;

function safeKey(value) {
  return String(value || "")
    .trim()
    .slice(0, 80);
}

async function getBalance(userId) {
  const user = await User.findById(userId).select("coins xp").lean();
  return {
    coins: Number(user?.coins) || 0,
    xp: Number(user?.xp) || 0,
  };
}

async function isClaimed(userId, source, sourceId) {
  const doc = await RewardClaim.findOne({
    userId,
    source,
    sourceId: safeKey(sourceId),
  }).lean();
  return !!doc;
}

async function resolveAward(source, sourceId) {
  if (source === "game") {
    if (!/^[\w-]+:L\d+$/.test(sourceId)) {
      return null;
    }
    return { coins: GAME_COINS, xp: GAME_XP };
  }
  if (source === "sunnah") {
    const [rawId, datePart] = sourceId.split(":");
    const id = Number(rawId);
    if (!Number.isInteger(id) || id < 1) return null;
    if (datePart !== todayKey()) return null;
    return { coins: SUNNAH_COINS, xp: SUNNAH_XP };
  }
  if (source === "quest") {
    const today = todayKey();
    if (sourceId !== today) return null;
    const content = await getTodayContent();
    return {
      coins: Number(content?.rewardCoins) || 8,
      xp: Number(content?.rewardXP) || 10,
    };
  }
  return null;
}

async function claimReward(userId, source, sourceId) {
  const id = safeKey(sourceId);
  const award = await resolveAward(source, id);
  if (!award) {
    return { ok: false, status: 400, message: "Invalid reward" };
  }

  try {
    await RewardClaim.create({
      userId,
      source,
      sourceId: id,
      coins: award.coins,
      xp: award.xp,
    });
  } catch (err) {
    if (err && err.code === 11000) {
      const balance = await getBalance(userId);
      return {
        ok: true,
        alreadyClaimed: true,
        awarded: 0,
        ...balance,
      };
    }
    throw err;
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { coins: award.coins, xp: award.xp } },
    { new: true, select: "coins xp" },
  ).lean();

  return {
    ok: true,
    alreadyClaimed: false,
    awarded: award.coins,
    coins: Number(user?.coins) || award.coins,
    xp: Number(user?.xp) || award.xp,
  };
}

module.exports = {
  GAME_COINS,
  SUNNAH_COINS,
  getBalance,
  isClaimed,
  claimReward,
  todayKey,
};
