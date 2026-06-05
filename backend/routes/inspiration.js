const express = require("express");
const router = express.Router();

const quotes = [
  "Indeed, with hardship comes ease.",
  "Seek knowledge from cradle to grave.",
  "Trust Allah’s plan always.",
  "Patience is the key to success.",
  "Do good and good will come back to you."
];

router.get("/daily", (req, res) => {
  const random = Math.floor(Math.random() * quotes.length);

  res.json({
    success: true,
    quote: quotes[random]
  });
});

module.exports = router;