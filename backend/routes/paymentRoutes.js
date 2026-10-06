const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  createOrder,
  verifyPayment,
  paymentWebhook,
} = require("../controllers/paymentController");

const router = express.Router();

/** Provider callbacks — no user JWT; must verify signature inside provider port. */
router.post("/webhook", paymentWebhook);

router.use(authMiddleware);
router.post("/create-order", createOrder);
router.post("/verify", verifyPayment);

module.exports = router;
