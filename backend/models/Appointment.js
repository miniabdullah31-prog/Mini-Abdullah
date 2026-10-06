const mongoose = require("mongoose");

const STATUSES = ["pending", "confirmed", "completed", "cancelled"];

const PAYMENT_STATUSES = [
  "not_required",
  "unpaid",
  "pending",
  "paid",
  "failed",
  "refunded",
  "cancelled",
];

const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tutorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tutor",
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: STATUSES,
      default: "pending",
      index: true,
    },
    zoomLink: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
    isFreeTrial: {
      type: Boolean,
      default: false,
    },
    paymentRequired: {
      type: Boolean,
      default: false,
    },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: "not_required",
      index: true,
    },
    amount: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      default: "PKR",
      trim: true,
    },
    paymentOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaymentOrder",
      default: null,
    },
  },
  { timestamps: true },
);

appointmentSchema.index(
  { tutorId: 1, date: 1, startTime: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["pending", "confirmed"] },
    },
  },
);

module.exports = mongoose.model("Appointment", appointmentSchema);
module.exports.STATUSES = STATUSES;
module.exports.PAYMENT_STATUSES = PAYMENT_STATUSES;
