const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendMail, isMailConfigured } = require("../services/emailService");

const OTP_EXPIRY_MINUTES = 10;

function isDevOtpMode() {
  return (
    String(process.env.DEV_OTP_MODE || "").toLowerCase() === "true" ||
    !isMailConfigured()
  );
}

// SIGNUP
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const userToSend = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
    };

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "User created successfully",
      token,
      user: userToSend,
    });
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

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({
        success: false,
        message: "Invalid password",
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const userToSend = {
      id: user._id,
      name: user.name,
      email: user.email,
    };

    res.json({
      success: true,
      message: "Login successful",
      token,
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

    // SMTP = ONE app sender mailbox (not each user's email).
    // If SMTP is not set, DEV mode still lets you test OTP (console + response).
    if (!isMailConfigured()) {
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
      console.log("FORGOT PASSWORD EMAIL ERROR:", mailError.message);

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
        message:
          mailError.message ||
          "Could not send OTP email. Check SMTP settings in backend/.env",
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

module.exports = {
  signup,
  login,
  forgotPassword,
  verifyOtp,
  resetPassword,
};