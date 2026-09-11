const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["image", "video", "audio"],
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    /** Public path under /media, e.g. stories/prophet-musa.png */
    filePath: {
      type: String,
      default: "",
    },
    thumbnailPath: {
      type: String,
      default: "",
    },
    duration: {
      type: Number,
      default: null,
    },
    extra: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Media", mediaSchema);
