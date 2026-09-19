const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { getMe, claim } = require("../controllers/rewardsController");

const router = express.Router();

router.use(authMiddleware);
router.get("/me", getMe);
router.post("/claim", claim);

module.exports = router;
