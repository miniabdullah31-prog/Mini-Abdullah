const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    default: null,
  },

  /**
   * Firebase Auth UID for Google Sign-In.
   * Omit entirely for email/password users (do NOT store null).
   * Uniqueness is enforced only when a real string googleId exists
   * (see partial unique index below).
   */
  googleId: {
    type: String,
  },

  authProvider: {
    type: String,
    enum: ["local", "google"],
    default: "local",
  },

  // Password-reset OTP (set by forgot-password flow)
  resetOtp: {
    type: String,
    default: null,
  },

  resetOtpExpires: {
    type: Date,
    default: null,
  },

  resetOtpVerified: {
    type: Boolean,
    default: false,
  },

  /** Wallet — earned from games, daily sunnah, and daily good-deed quest */
  coins: {
    type: Number,
    default: 0,
    min: 0,
  },

  xp: {
    type: Number,
    default: 0,
    min: 0,
  },
  fcmTokens: [
    {
      token: { type: String, required: true },
      platform: { type: String, default: "android" },
      updatedAt: { type: Date, default: Date.now },
    },
  ],
});

// Unique only when googleId is a real string — multiple users without googleId are allowed.
userSchema.index(
  { googleId: 1 },
  {
    unique: true,
    name: "googleId_partial_unique",
    partialFilterExpression: { googleId: { $type: "string" } },
  },
);

/**
 * Safe migration for the E11000 googleId: null bug:
 * - Unset googleId on docs where it is null (keep the user document)
 * - Drop the old unique googleId_1 index if present
 * - Sync schema indexes (creates googleId_partial_unique)
 */
async function ensureGoogleIdIndex() {
  const col = mongoose.connection.collection("users");

  const unsetResult = await col.updateMany(
    { googleId: null },
    { $unset: { googleId: "" } },
  );
  if (unsetResult.modifiedCount > 0) {
    console.log(
      `[users] unset googleId:null on ${unsetResult.modifiedCount} user(s)`,
    );
  }

  const indexes = await col.indexes();
  for (const idx of indexes) {
    const isGoogleIdKey =
      idx.key &&
      Object.keys(idx.key).length === 1 &&
      idx.key.googleId === 1;
    if (!isGoogleIdKey) continue;
    if (idx.name === "googleId_partial_unique") continue;
    try {
      await col.dropIndex(idx.name);
      console.log(`[users] dropped old index ${idx.name}`);
    } catch (err) {
      if (err.code !== 27 && err.codeName !== "IndexNotFound") {
        throw err;
      }
    }
  }

  await mongoose.model("User").syncIndexes();
  console.log("[users] googleId partial unique index ready");
}

module.exports = mongoose.model("User", userSchema);
module.exports.ensureGoogleIdIndex = ensureGoogleIdIndex;
