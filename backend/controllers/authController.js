const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getAuth } = require("firebase-admin/auth");
const User = require("../models/User");
const { sendMail, isMailConfigured, publicMailErrorMessage } = require("../services/emailService");
const {
  initFirebaseAdmin,
  isFirebaseReady,
} = require("../services/notificationService");
const {
  issueTokenPair,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllRefreshTokens,
} = require("../services/tokenService");
const {
  isValidEmailFormat,
  VALID_EMAIL_MESSAGE,
} = require("../utils/emailValidation");

const OTP_EXPIRY_MINUTES = 10;

/**
 * TEMPORARY FLAG — email verification OTP/SMTP signup path.
 * Default OFF (false / unset) restores pre-verification signup → gender/avatar.
 * Set ENABLE_EMAIL_VERIFICATION=true to re-enable OTP + SMTP verification.
 * Do not delete verification routes/controllers when this is false.
 */
function isEmailVerificationEnabled() {
  return (
    String(process.env.ENABLE_EMAIL_VERIFICATION || "")
      .toLowerCase()
      .trim() === "true"
  );
}

/**
 * DEV OTP is ONLY allowed when DEV_OTP_MODE=true explicitly.
 * Missing SMTP alone does NOT enable DEV OTP (production-safe default).
 */
function isDevOtpMode() {
  return String(process.env.DEV_OTP_MODE || "").toLowerCase() === "true";
}

function smtpRequiredMessage() {
  return (
    "Verification email could not be sent. Email service is not configured. " +
    "Please try again later, or contact support."
  );
}

function smtpSendFailedMessage(_mailError) {
  // User-facing copy only — do not claim mailbox existence or delivery receipt.
  return "We couldn't send the verification code to this email. Please check your email address and try again.";
}

// SIGNUP — create unverified account + email OTP (no JWT until verified)
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanName = String(name).trim();

    if (!cleanName || !cleanEmail || !password) {
      return res.json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    if (!isValidEmailFormat(cleanEmail)) {
      return res.json({
        success: false,
        message: VALID_EMAIL_MESSAGE,
      });
    }

    const existingUser = await User.findOne({ email: cleanEmail });

    if (existingUser) {
      return res.json({
        success: false,
        message: "User already exists",
      });
    }

    // --- TEMPORARY BYPASS: email verification disabled ---
    if (!isEmailVerificationEnabled()) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        name: cleanName,
        email: cleanEmail,
        password: hashedPassword,
        authProvider: "local",
        emailVerified: true,
        emailVerifyOtp: null,
        emailVerifyOtpExpires: null,
      });
      await newUser.save();

      const { accessToken, refreshToken } = await issueTokenPair(newUser);

      return res.json({
        success: true,
        message: "Account created successfully",
        verificationRequired: false,
        token: accessToken,
        refreshToken,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          emailVerified: true,
        },
      });
    }
    // --- END TEMPORARY BYPASS — full OTP/SMTP path below ---

    // Production: require SMTP before creating a user row
    if (!isMailConfigured() && !isDevOtpMode()) {
      return res.json({
        success: false,
        message: smtpRequiredMessage(),
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = String(crypto.randomInt(100000, 1000000));
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    const newUser = new User({
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
      authProvider: "local",
      emailVerified: false,
      emailVerifyOtp: otp,
      emailVerifyOtpExpires: expiresAt,
    });

    await newUser.save();

    const userToSend = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      emailVerified: false,
    };

    const successPayload = {
      success: true,
      message:
        "Account created. Please verify your email with the OTP sent to continue.",
      verificationRequired: true,
      user: userToSend,
    };

    // Explicit DEV only — never expose OTP in production responses
    if (!isMailConfigured() && isDevOtpMode()) {
      console.log("========================================");
      console.log(`[DEV OTP] signup email: ${newUser.email}`);
      console.log(`[DEV OTP] code:  ${otp}`);
      console.log("========================================");

      return res.json({
        ...successPayload,
        message: `DEV mode (no SMTP): your verification OTP is ${otp}`,
        devOtp: otp,
      });
    }

    try {
      await sendMail({
        to: newUser.email,
        subject: "Mini Abdullah — Verify your account",
        text:
          `Your Mini Abdullah account was created.\n\n` +
          `Your email verification code is ${otp}.\n` +
          `This code expires in ${OTP_EXPIRY_MINUTES} minutes.\n\n` +
          `If you did not create this account, you can ignore this email.`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #222;">
            <h2 style="margin-bottom: 8px;">Verify your Mini Abdullah account</h2>
            <p>Your Mini Abdullah account was created.</p>
            <p>Your email verification code is:</p>
            <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${otp}</p>
            <p>This code expires in <strong>${OTP_EXPIRY_MINUTES} minutes</strong>.</p>
            <p style="color: #666;">If you did not create this account, you can ignore this email.</p>
          </div>
        `,
      });
    } catch (mailError) {
      console.log(
        "SIGNUP VERIFICATION EMAIL ERROR:",
        publicMailErrorMessage(mailError),
      );

      if (isDevOtpMode()) {
        console.log(`[DEV OTP FALLBACK] signup ${newUser.email} => ${otp}`);
        return res.json({
          ...successPayload,
          message: `Email failed; DEV verification OTP: ${otp}`,
          devOtp: otp,
        });
      }

      await User.findByIdAndDelete(newUser._id);

      return res.json({
        success: false,
        code: "SMTP_SEND_FAILED",
        message: smtpSendFailedMessage(mailError),
      });
    }

    return res.json(successPayload);
  } catch (error) {
    console.log("SIGNUP ERROR:", error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({
        success: false,
        message: "Email and password are required",
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.password) {
      return res.json({
        success: false,
        message:
          "This account uses Google Sign-In. Please continue with Google.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({
        success: false,
        message: "Invalid password",
      });
    }

    // Block unverified local accounts only when email verification is enabled.
    if (isEmailVerificationEnabled() && user.emailVerified === false) {
      return res.json({
        success: false,
        verificationRequired: true,
        message: "Please verify your email before logging in.",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          emailVerified: false,
        },
      });
    }

    const { accessToken, refreshToken } = await issueTokenPair(user);

    const userToSend = {
      id: user._id,
      name: user.name,
      email: user.email,
    };

    res.json({
      success: true,
      message: "Login successful",
      token: accessToken,
      refreshToken,
      user: userToSend,
    });
  } catch (error) {
    console.log("LOGIN ERROR:", error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// FORGOT PASSWORD — generate OTP, save on user, email it
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !String(email).trim()) {
      return res.json({
        success: false,
        message: "Email is required",
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // Case-insensitive match so typed email still finds the account
    const user = await User.findOne({
      email: {
        $regex: new RegExp(
          `^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
          "i"
        ),
      },
    });

    // Same reply whether or not the account exists (don't leak emails)
    const genericMessage =
      "If an account exists with this email, an OTP has been sent";

    if (!user) {
      return res.json({
        success: true,
        message: genericMessage,
      });
    }

    const otp = String(crypto.randomInt(100000, 1000000));
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    user.resetOtp = otp;
    user.resetOtpExpires = expiresAt;
    user.resetOtpVerified = false;
    await user.save();

    // SMTP required unless explicit DEV_OTP_MODE=true
    if (!isMailConfigured()) {
      if (!isDevOtpMode()) {
        user.resetOtp = null;
        user.resetOtpExpires = null;
        user.resetOtpVerified = false;
        await user.save();
        return res.json({
          success: false,
          message: smtpRequiredMessage(),
        });
      }

      console.log("========================================");
      console.log(`[DEV OTP] email: ${user.email}`);
      console.log(`[DEV OTP] code:  ${otp}`);
      console.log("========================================");

      return res.json({
        success: true,
        message: `DEV mode (no SMTP): your OTP is ${otp}`,
        devOtp: otp,
      });
    }

    try {
      await sendMail({
        to: user.email,
        subject: "Mini Abdullah — Password Reset OTP",
        text: `Your Mini Abdullah password reset OTP is ${otp}. It expires in ${OTP_EXPIRY_MINUTES} minutes. If you did not request this, ignore this email.`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #222;">
            <h2 style="margin-bottom: 8px;">Password Reset</h2>
            <p>Your Mini Abdullah OTP is:</p>
            <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${otp}</p>
            <p>This code expires in <strong>${OTP_EXPIRY_MINUTES} minutes</strong>.</p>
            <p style="color: #666;">If you did not request a password reset, you can ignore this email.</p>
          </div>
        `,
      });
    } catch (mailError) {
      console.log(
        "FORGOT PASSWORD EMAIL ERROR:",
        publicMailErrorMessage(mailError),
      );

      if (isDevOtpMode()) {
        console.log(`[DEV OTP FALLBACK] ${user.email} => ${otp}`);
        return res.json({
          success: true,
          message: `Email failed; DEV OTP: ${otp}`,
          devOtp: otp,
        });
      }

      user.resetOtp = null;
      user.resetOtpExpires = null;
      user.resetOtpVerified = false;
      await user.save();

      return res.json({
        success: false,
        message: publicMailErrorMessage(mailError),
      });
    }

    return res.json({
      success: true,
      message: genericMessage,
    });
  } catch (error) {
    console.log("FORGOT PASSWORD ERROR:", error.message);
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// VERIFY OTP — mark reset allowed if code matches and not expired
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !String(email).trim()) {
      return res.json({
        success: false,
        message: "Email is required",
      });
    }

    if (!otp || !String(otp).trim()) {
      return res.json({
        success: false,
        message: "OTP is required",
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanOtp = String(otp).trim();

    const user = await User.findOne({
      email: {
        $regex: new RegExp(
          `^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
          "i"
        ),
      },
    });

    if (!user || !user.resetOtp || !user.resetOtpExpires) {
      return res.json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    if (user.resetOtpExpires.getTime() < Date.now()) {
      user.resetOtp = null;
      user.resetOtpExpires = null;
      user.resetOtpVerified = false;
      await user.save();

      return res.json({
        success: false,
        message: "OTP has expired. Please request a new one",
      });
    }

    if (user.resetOtp !== cleanOtp) {
      return res.json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    user.resetOtpVerified = true;
    await user.save();

    return res.json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.log("VERIFY OTP ERROR:", error.message);
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// RESET PASSWORD — only after OTP verified; then hash + clear OTP fields
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, password } = req.body;
    const nextPassword = newPassword || password;

    if (!email || !String(email).trim()) {
      return res.json({
        success: false,
        message: "Email is required",
      });
    }

    if (!otp || !String(otp).trim()) {
      return res.json({
        success: false,
        message: "OTP is required",
      });
    }

    if (!nextPassword || !String(nextPassword).trim()) {
      return res.json({
        success: false,
        message: "New password is required",
      });
    }

    if (String(nextPassword).length < 6) {
      return res.json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanOtp = String(otp).trim();

    const user = await User.findOne({
      email: {
        $regex: new RegExp(
          `^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
          "i"
        ),
      },
    });

    if (
      !user ||
      !user.resetOtp ||
      !user.resetOtpExpires ||
      !user.resetOtpVerified
    ) {
      return res.json({
        success: false,
        message: "Please verify OTP before resetting password",
      });
    }

    if (user.resetOtpExpires.getTime() < Date.now()) {
      user.resetOtp = null;
      user.resetOtpExpires = null;
      user.resetOtpVerified = false;
      await user.save();

      return res.json({
        success: false,
        message: "OTP has expired. Please request a new one",
      });
    }

    if (user.resetOtp !== cleanOtp) {
      return res.json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    user.password = await bcrypt.hash(String(nextPassword), 10);
    user.resetOtp = null;
    user.resetOtpExpires = null;
    user.resetOtpVerified = false;
    await user.save();

    // Confirmation email — best-effort; never undo a completed password reset.
    const notifyEmail = String(user.email || cleanEmail).trim().toLowerCase();
    if (isMailConfigured()) {
      try {
        await sendMail({
          to: notifyEmail,
          subject: "Mini Abdullah — Password Reset Successful",
          text:
            `Your Mini Abdullah account password was successfully changed.\n\n` +
            `If you did not make this change, please reset your password again immediately or contact support.`,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #222;">
              <h2 style="margin-bottom: 8px;">Password Reset Successful</h2>
              <p>Your Mini Abdullah account password was successfully changed.</p>
              <p style="color: #666;">If you did not make this change, please reset your password again immediately or contact support.</p>
            </div>
          `,
        });
      } catch (mailError) {
        console.log(
          "RESET PASSWORD CONFIRMATION EMAIL ERROR:",
          publicMailErrorMessage(mailError),
        );
      }
    } else {
      console.log(
        `[DEV] Password reset succeeded for ${notifyEmail} (no SMTP — confirmation email skipped)`,
      );
    }

    return res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.log("RESET PASSWORD ERROR:", error.message);
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// GOOGLE SIGN-IN — verify Firebase ID token, find/create user, return JWT
const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken || !String(idToken).trim()) {
      return res.json({
        success: false,
        message: "Google ID token is required",
      });
    }

    if (!initFirebaseAdmin() || !isFirebaseReady()) {
      return res.json({
        success: false,
        message: "Google Sign-In is not configured on the server",
      });
    }

    const decoded = await getAuth().verifyIdToken(String(idToken).trim());
    const { email, name, uid } = decoded;

    if (!email) {
      return res.json({
        success: false,
        message: "Google account has no email address",
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    let user = await User.findOne({
      $or: [{ googleId: uid }, { email: cleanEmail }],
    });

    if (!user) {
      user = new User({
        name: name || cleanEmail.split("@")[0],
        email: cleanEmail,
        googleId: uid,
        authProvider: "google",
        password: null,
        // Google has already verified the mailbox when email_verified is true
        emailVerified: decoded.email_verified !== false,
      });
      await user.save();
    } else {
      if (user.googleId == null || user.googleId === "") {
        user.googleId = uid;
      }
      if (!user.name && name) {
        user.name = name;
      }
      if (decoded.email_verified !== false) {
        user.emailVerified = true;
      }
      await user.save();
    }

    const { accessToken, refreshToken } = await issueTokenPair(user);

    return res.json({
      success: true,
      message: "Google login successful",
      token: accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.log("GOOGLE LOGIN ERROR:", error.message);
    const expired =
      error.code === "auth/id-token-expired" ||
      error.code === "auth/argument-error";
    return res.json({
      success: false,
      message: expired
        ? "Google session expired. Please try again."
        : "Google Sign-In failed. Please try again.",
    });
  }
};

// VERIFY EMAIL — confirm signup OTP, then issue normal login JWT
const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !String(email).trim()) {
      return res.json({
        success: false,
        message: "Email is required",
      });
    }

    if (!otp || !String(otp).trim()) {
      return res.json({
        success: false,
        message: "OTP is required",
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanOtp = String(otp).trim();

    if (!isValidEmailFormat(cleanEmail)) {
      return res.json({
        success: false,
        message: VALID_EMAIL_MESSAGE,
      });
    }

    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    const issueSession = async () => {
      const { accessToken, refreshToken } = await issueTokenPair(user);
      return {
        token: accessToken,
        refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          emailVerified: true,
        },
      };
    };

    if (user.emailVerified) {
      const session = await issueSession();
      return res.json({
        success: true,
        message: "Email is already verified",
        alreadyVerified: true,
        token: session.token,
        refreshToken: session.refreshToken,
        user: session.user,
      });
    }

    if (!user.emailVerifyOtp || !user.emailVerifyOtpExpires) {
      return res.json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    if (user.emailVerifyOtpExpires.getTime() < Date.now()) {
      user.emailVerifyOtp = null;
      user.emailVerifyOtpExpires = null;
      await user.save();

      return res.json({
        success: false,
        message: "OTP has expired. Please request a new one",
      });
    }

    if (user.emailVerifyOtp !== cleanOtp) {
      return res.json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    user.emailVerified = true;
    user.emailVerifyOtp = null;
    user.emailVerifyOtpExpires = null;
    await user.save();

    const session = await issueSession();

    return res.json({
      success: true,
      message: "Email verified successfully",
      token: session.token,
      refreshToken: session.refreshToken,
      user: session.user,
    });
  } catch (error) {
    console.log("VERIFY EMAIL ERROR:", error.message);
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// RESEND VERIFICATION — new signup email OTP (does not create users)
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !String(email).trim()) {
      return res.json({
        success: false,
        message: "Email is required",
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    if (!isValidEmailFormat(cleanEmail)) {
      return res.json({
        success: false,
        message: VALID_EMAIL_MESSAGE,
      });
    }

    const genericMessage =
      "If an account exists and needs verification, an OTP has been sent";

    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.json({
        success: true,
        message: genericMessage,
      });
    }

    if (user.emailVerified) {
      return res.json({
        success: true,
        message: "Email is already verified",
        alreadyVerified: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          emailVerified: true,
        },
      });
    }

    if (!isMailConfigured() && !isDevOtpMode()) {
      return res.json({
        success: false,
        message: smtpRequiredMessage(),
      });
    }

    const otp = String(crypto.randomInt(100000, 1000000));
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    user.emailVerifyOtp = otp;
    user.emailVerifyOtpExpires = expiresAt;
    await user.save();

    const successPayload = {
      success: true,
      message: genericMessage,
    };

    if (!isMailConfigured() && isDevOtpMode()) {
      console.log("========================================");
      console.log(`[DEV OTP] resend verification email: ${user.email}`);
      console.log(`[DEV OTP] code:  ${otp}`);
      console.log("========================================");

      return res.json({
        ...successPayload,
        message: `DEV mode (no SMTP): your verification OTP is ${otp}`,
        devOtp: otp,
      });
    }

    try {
      await sendMail({
        to: user.email,
        subject: "Mini Abdullah — Verify your account",
        text:
          `Your Mini Abdullah account was created.\n\n` +
          `Your email verification code is ${otp}.\n` +
          `This code expires in ${OTP_EXPIRY_MINUTES} minutes.\n\n` +
          `If you did not create this account, you can ignore this email.`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #222;">
            <h2 style="margin-bottom: 8px;">Verify your Mini Abdullah account</h2>
            <p>Your Mini Abdullah account was created.</p>
            <p>Your email verification code is:</p>
            <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${otp}</p>
            <p>This code expires in <strong>${OTP_EXPIRY_MINUTES} minutes</strong>.</p>
            <p style="color: #666;">If you did not create this account, you can ignore this email.</p>
          </div>
        `,
      });
    } catch (mailError) {
      console.log(
        "RESEND VERIFICATION EMAIL ERROR:",
        publicMailErrorMessage(mailError),
      );

      if (isDevOtpMode()) {
        console.log(`[DEV OTP FALLBACK] resend ${user.email} => ${otp}`);
        return res.json({
          ...successPayload,
          message: `Email failed; DEV verification OTP: ${otp}`,
          devOtp: otp,
        });
      }

      user.emailVerifyOtp = null;
      user.emailVerifyOtpExpires = null;
      await user.save();

      return res.json({
        success: false,
        code: "SMTP_SEND_FAILED",
        message: smtpSendFailedMessage(mailError),
      });
    }

    return res.json(successPayload);
  } catch (error) {
    console.log("RESEND VERIFICATION ERROR:", error.message);
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

/** Authenticated profile update — name and/or password (FYP edit-profile). */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { name, password } = req.body || {};
    const nextName =
      typeof name === "string" && name.trim() ? name.trim() : null;
    const nextPassword =
      typeof password === "string" && password.trim()
        ? password.trim()
        : null;

    if (!nextName && !nextPassword) {
      return res.json({
        success: false,
        message: "Provide a name and/or password to update",
      });
    }

    if (nextPassword && nextPassword.length < 6) {
      return res.json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    if (nextName) {
      user.name = nextName;
    }
    if (nextPassword) {
      user.password = await bcrypt.hash(nextPassword, 10);
    }

    await user.save();

    return res.json({
      success: true,
      message: "Profile updated",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.log("UPDATE PROFILE ERROR:", error.message);
    return res.json({
      success: false,
      message: "Could not update profile. Please try again.",
    });
  }
};

// REFRESH — exchange refresh token for a new access + refresh pair (rotation)
const refreshSession = async (req, res) => {
  try {
    const refreshToken = req.body?.refreshToken;
    if (!refreshToken || !String(refreshToken).trim()) {
      return res.status(401).json({
        success: false,
        message: "Refresh token required",
        code: "REFRESH_INVALID",
      });
    }

    const session = await rotateRefreshToken(String(refreshToken).trim());
    return res.json({
      success: true,
      message: "Token refreshed",
      token: session.accessToken,
      refreshToken: session.refreshToken,
      user: session.user,
    });
  } catch (error) {
    const status = error.code === "REFRESH_CONFIG" ? 500 : 401;
    return res.status(status).json({
      success: false,
      message: error.message || "Could not refresh session",
      code: error.code || "REFRESH_INVALID",
    });
  }
};

// LOGOUT — revoke presented refresh token (and optionally all sessions)
const logout = async (req, res) => {
  try {
    const refreshToken =
      req.body?.refreshToken && String(req.body.refreshToken).trim();
    const logoutAll = !!req.body?.all;

    // Prefer authenticated user id when Bearer access token is present
    let userId = req.user?.id || null;

    if (!userId && refreshToken) {
      try {
        const decoded = jwt.decode(refreshToken);
        if (decoded?.id) userId = decoded.id;
      } catch {
        // ignore decode failures — still try hash revoke below if we have userId
      }
    }

    if (userId && logoutAll) {
      await revokeAllRefreshTokens(userId);
      return res.json({ success: true, message: "Logged out" });
    }

    if (userId && refreshToken) {
      await revokeRefreshToken(userId, refreshToken);
      return res.json({ success: true, message: "Logged out" });
    }

    // Best-effort: no tokens to revoke still clears client locally
    return res.json({ success: true, message: "Logged out" });
  } catch (error) {
    console.log("LOGOUT ERROR:", error.message);
    return res.json({
      success: false,
      message: "Could not logout. Please try again.",
    });
  }
};

module.exports = {
  signup,
  login,
  googleLogin,
  forgotPassword,
  verifyOtp,
  resetPassword,
  verifyEmail,
  resendVerification,
  updateProfile,
  refreshSession,
  logout,
};