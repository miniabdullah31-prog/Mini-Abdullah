const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  registerToken,
  sendTestNotification,
} = require("../controllers/notificationController");

const router = express.Router();

router.post("/register-token", authMiddleware, registerToken);
router.post("/test", authMiddleware, sendTestNotification);

module.exports = router;
