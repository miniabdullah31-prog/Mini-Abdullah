const express = require("express");
const { getToday } = require("../controllers/dailyContentController");

const router = express.Router();

router.get("/today", getToday);

module.exports = router;
