const mongoose = require("mongoose");

const prayerSchema = new mongoose.Schema(
  {
    city: String,
    fajr: String,
    dhuhr: String,
    asr: String,
    maghrib: String,
    isha: String,
    /** Local calendar day (YYYY-MM-DD, Asia/Karachi) these timings were fetched for. */
    forDate: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Prayer", prayerSchema);
