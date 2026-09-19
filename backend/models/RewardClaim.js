const mongoose = require("mongoose");

const rewardClaimSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    source: {
      type: String,
      enum: ["game", "sunnah", "quest"],
      required: true,
    },
    sourceId: {
      type: String,
      required: true,
      trim: true,
    },
    coins: {
      type: Number,
      required: true,
      min: 0,
    },
    xp: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true },
);

rewardClaimSchema.index({ userId: 1, source: 1, sourceId: 1 }, { unique: true });

module.exports = mongoose.model("RewardClaim", rewardClaimSchema);
