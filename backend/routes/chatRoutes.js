const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { chat } = require("../controllers/chatController");

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many messages. Please wait a moment.",
  },
});

router.post("/", authMiddleware, chatLimiter, chat);

module.exports = router;
