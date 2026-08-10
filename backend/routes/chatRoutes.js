const express = require("express");
const router = express.Router();
const { chat } = require("../controllers/chatController");

const hits = new Map();
const WINDOW_MS = 60 * 1000;
const MAX_HITS = 30;

function chatRateLimit(req, res, next) {
  const key = req.ip || "unknown";
  const now = Date.now();
  const bucket = hits.get(key) || [];
  const recent = bucket.filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_HITS) {
    return res.status(429).json({
      success: false,
      message: "Too many messages. Please wait a moment.",
    });
  }

  recent.push(now);
  hits.set(key, recent);
  next();
}

router.post("/", chatRateLimit, chat);

module.exports = router;
