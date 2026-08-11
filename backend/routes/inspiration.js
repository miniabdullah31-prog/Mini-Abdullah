const express = require("express");
const router = express.Router();

/** Exactly 5 quotes — after the last one, cycle restarts from the first. */
const quotes = [
  {
    arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    quote: "Indeed, with hardship comes ease.",
    source: "Surah Ash-Sharh (94:6)",
  },
  {
    arabic: "وَقُل رَّبِّ زِدْنِي عِلْمًا",
    quote: "My Lord, increase me in knowledge.",
    source: "Surah Ta-Ha (20:114)",
  },
  {
    arabic: "فَاذْكُرُونِي أَذْكُرْكُمْ",
    quote: "Remember Me; I will remember you.",
    source: "Surah Al-Baqarah (2:152)",
  },
  {
    arabic: "وَاصْبِرْ وَمَا صَبْرُكَ إِلَّا بِاللَّهِ",
    quote: "Be patient, and your patience is only through Allah.",
    source: "Surah An-Nahl (16:127)",
  },
  {
    arabic: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
    quote: "Indeed, Allah is with the patient.",
    source: "Surah Al-Baqarah (2:153)",
  },
];

/**
 * One quote per hour (changes every 1 hour), then cycles.
 * Change QUOTE_ROTATION_MS to adjust rotation (e.g. 24 * 60 * 60 * 1000 for daily).
 */
const QUOTE_ROTATION_MS = 60 * 60 * 1000;

function getQuoteIndex() {
  return Math.floor(Date.now() / QUOTE_ROTATION_MS) % quotes.length;
}

router.get("/daily", (_req, res) => {
  try {
    const index = getQuoteIndex();
    const selected = quotes[index];

    return res.json({
      success: true,
      data: {
        arabic: selected.arabic || "",
        quote: selected.quote,
        source: selected.source || "",
        dayIndex: index,
        totalQuotes: quotes.length,
        rotationMs: QUOTE_ROTATION_MS,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Could not load daily inspiration",
    });
  }
});

module.exports = router;
