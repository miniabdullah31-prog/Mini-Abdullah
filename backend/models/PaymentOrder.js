const mongoose = require("mongoose");

const ORDER_STATUSES = [
  "created",
  "pending",
  "succeeded",
  "failed",
  "expired",
  "refunded",
  "cancelled",
];

const paymentOrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: "PKR",
      trim: true,
    },
    provider: {
      type: String,
      required: true,
      default: "none",
      trim: true,
    },
    providerRef: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    idempotencyKey: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "created",
      index: true,
    },
    /** Non-secret provider verify metadata only (never store API keys). */
    rawVerifyMeta: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true },
);

paymentOrderSchema.index({ idempotencyKey: 1 }, { unique: true });
paymentOrderSchema.index({ appointmentId: 1, status: 1 });

module.exports = mongoose.model("PaymentOrder", paymentOrderSchema);
module.exports.ORDER_STATUSES = ORDER_STATUSES;
