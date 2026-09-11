const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();

const {
  signup,
  login,
  googleLogin,
  forgotPassword,
  verifyOtp,
  resetPassword,
} = require("../controllers/authController");

/** Stricter limit for OTP request / verify (brute-force resistance). */
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many OTP attempts. Please try again later.",
  },
});

router.post("/signup", signup);
router.post("/login", login);
router.post("/google", googleLogin);
router.post("/forgot-password", otpLimiter, forgotPassword);
router.post("/verify-otp", otpLimiter, verifyOtp);
router.post("/reset-password", otpLimiter, resetPassword);

module.exports = router;
