const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const ACCESS_TYP = "access";
const REFRESH_TYP = "refresh";

function accessSecret() {
  return process.env.JWT_SECRET;
}

function refreshSecret() {
  return process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
}

function accessExpiresIn() {
  return process.env.JWT_ACCESS_EXPIRES || "1h";
}

function refreshExpiresIn() {
  return process.env.JWT_REFRESH_EXPIRES || "30d";
}

function hashToken(token) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

function signAccessToken(user) {
  const secret = accessSecret();
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      typ: ACCESS_TYP,
    },
    secret,
    { expiresIn: accessExpiresIn() },
  );
}

function signRefreshToken(user) {
  const secret = refreshSecret();
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  const jti = crypto.randomBytes(16).toString("hex");
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      typ: REFRESH_TYP,
      jti,
    },
    secret,
    { expiresIn: refreshExpiresIn() },
  );
}

/**
 * Issue access + refresh pair and persist hashed refresh token on the user.
 * Does not log token values.
 */
async function issueTokenPair(user) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  const decoded = jwt.decode(refreshToken);
  const expiresAt =
    decoded && typeof decoded.exp === "number"
      ? new Date(decoded.exp * 1000)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const entry = {
    tokenHash: hashToken(refreshToken),
    createdAt: new Date(),
    expiresAt,
  };

  if (!Array.isArray(user.refreshTokens)) {
    user.refreshTokens = [];
  }
  // Keep a small window of sessions (max 2 saved accounts × a few devices)
  user.refreshTokens.push(entry);
  const maxSessions = 8;
  if (user.refreshTokens.length > maxSessions) {
    user.refreshTokens = user.refreshTokens.slice(-maxSessions);
  }
  await user.save();

  return { accessToken, refreshToken };
}

async function revokeRefreshToken(userId, refreshToken) {
  if (!refreshToken || !userId) return false;
  const tokenHash = hashToken(refreshToken);
  const result = await User.updateOne(
    { _id: userId },
    { $pull: { refreshTokens: { tokenHash } } },
  );
  return result.modifiedCount > 0;
}

async function revokeAllRefreshTokens(userId) {
  if (!userId) return;
  await User.updateOne({ _id: userId }, { $set: { refreshTokens: [] } });
}

/**
 * Validate refresh JWT + stored hash, rotate, return new pair.
 */
async function rotateRefreshToken(refreshToken) {
  if (!refreshToken || typeof refreshToken !== "string") {
    const err = new Error("Refresh token required");
    err.code = "REFRESH_INVALID";
    throw err;
  }

  const secret = refreshSecret();
  if (!secret) {
    const err = new Error("Server auth not configured");
    err.code = "REFRESH_CONFIG";
    throw err;
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken.trim(), secret);
  } catch (_e) {
    const err = new Error("Invalid or expired refresh token");
    err.code = "REFRESH_INVALID";
    throw err;
  }

  if (decoded.typ && decoded.typ !== REFRESH_TYP) {
    const err = new Error("Invalid refresh token");
    err.code = "REFRESH_INVALID";
    throw err;
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    const err = new Error("Invalid or expired refresh token");
    err.code = "REFRESH_INVALID";
    throw err;
  }

  const tokenHash = hashToken(refreshToken.trim());
  const stored = (user.refreshTokens || []).find(
    (t) => t.tokenHash === tokenHash,
  );
  if (!stored) {
    const err = new Error("Invalid or expired refresh token");
    err.code = "REFRESH_INVALID";
    throw err;
  }

  if (stored.expiresAt && stored.expiresAt.getTime() < Date.now()) {
    user.refreshTokens = (user.refreshTokens || []).filter(
      (t) => t.tokenHash !== tokenHash,
    );
    await user.save();
    const err = new Error("Invalid or expired refresh token");
    err.code = "REFRESH_INVALID";
    throw err;
  }

  // Rotation: drop presented refresh token, issue a new pair
  user.refreshTokens = (user.refreshTokens || []).filter(
    (t) => t.tokenHash !== tokenHash,
  );
  const pair = await issueTokenPair(user);
  return {
    accessToken: pair.accessToken,
    refreshToken: pair.refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  };
}

module.exports = {
  ACCESS_TYP,
  REFRESH_TYP,
  accessSecret,
  hashToken,
  issueTokenPair,
  revokeRefreshToken,
  revokeAllRefreshTokens,
  rotateRefreshToken,
};
