const mongoose = require("mongoose");

const dailyContentSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    word: { type: String, required: true },
    wordMeaning: { type: String, required: true },
    wordExample: { type: String, default: "" },
    dua: { type: String, required: true },
    duaMeaning: { type: String, required: true },
    questTitle: { type: String, required: true },
    questDescription: { type: String, required: true },
    rewardXP: { type: Number, default: 10 },
    rewardCoins: { type: Number, default: 5 },
    wordSentAt: { type: Date, default: null },
    duaSentAt: { type: Date, default: null },
    questSentAt: { type: Date, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("DailyContent", dailyContentSchema);
