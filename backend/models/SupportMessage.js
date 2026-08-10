const mongoose = require("mongoose");

const supportMessageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "Guest",
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    type: {
      type: String,
      enum: ["support", "feedback"],
      default: "support",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SupportMessage", supportMessageSchema);
