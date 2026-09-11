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

  /** Firebase Auth UID for Google Sign-In (password not stored for these users) */
  googleId: {
    type: String,
    default: null,
    sparse: true,
    unique: true,
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

  /** FCM device tokens — one user may have multiple phones/tablets */
  fcmTokens: [
    {
      token: { type: String, required: true },
      platform: { type: String, default: "android" },
      updatedAt: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
