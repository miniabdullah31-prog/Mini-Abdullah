const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { submitSupport } = require("../controllers/supportController");

router.post("/", authMiddleware, submitSupport);

module.exports = router;
