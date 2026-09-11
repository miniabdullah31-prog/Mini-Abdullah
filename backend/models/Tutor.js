const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema(
  {
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { _id: false },
);

const weeklyDaySchema = new mongoose.Schema(
  {
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
    slots: { type: [slotSchema], default: [] },
  },
  { _id: false },
);

const tutorSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: true,
    },
    specializations: {
      type: [String],
      default: [],
    },
    bio: {
      type: String,
      default: "",
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    weeklyAvailability: {
      type: [weeklyDaySchema],
      default: [],
    },
    unavailableDates: {
      type: [String],
      default: [],
    },
    /** Copied onto appointments when set. Never returned on public tutor APIs. */
    defaultZoomLink: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Tutor", tutorSchema);
