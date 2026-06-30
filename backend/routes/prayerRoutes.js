const express = require("express");
const router = express.Router();

const { getPrayerTimes } = require("../controllers/prayerController");

router.get("/", getPrayerTimes);

module.exports = router;