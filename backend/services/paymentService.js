const crypto = require("crypto");
const User = require("../models/User");
const Appointment = require("../models/Appointment");
const PaymentOrder = require("../models/PaymentOrder");
const {
  getProviderName,
  isProviderConfigured,
  createCheckout,
  verifyClientReturn,
  verifyWebhook,
} = require("./payments/paymentProvider");
const { getTutorForBooking } = require("./tutorService");
const { getZoomJoinUrlForAppointment } = require("./zoomLinkProvider");

function getSessionPrice() {
  const parsed = Number(process.env.TUTOR_SESSION_PRICE_AMOUNT);
  const amount =
    Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  const currency =
    String(process.env.TUTOR_SESSION_PRICE_CURRENCY || "PKR").trim() ||
    "PKR";
  return { amount, currency };
}

/**
 * True when the user may still take the one free tutor lecture.
 * Syncs User.tutorFreeTrialUsed from prior countable appointments.
 */
async function isFreeTrialAvailable(userId) {
  const user = await User.findById(userId).select("tutorFreeTrialUsed");
  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }
  if (user.tutorFreeTrialUsed) {
    return false;
  }

  const prior = await Appointment.exists({
    userId,
    status: { $in: ["pending", "confirmed", "completed"] },
  });
  if (prior) {
    await User.updateOne(
      { _id: userId },
      {
        $set: {
          tutorFreeTrialUsed: true,
          tutorFreeTrialUsedAt: new Date(),
        },
      },
    );
    return false;
  }
  return true;
}

async function markFreeTrialUsed(userId) {
  await User.updateOne(
    { _id: userId },
    {
      $set: {
        tutorFreeTrialUsed: true,
        tutorFreeTrialUsedAt: new Date(),
      },
    },
  );
}

/**
 * Atomically claim free trial. Returns false if already claimed.
 */
async function tryClaimFreeTrial(userId) {
  const available = await isFreeTrialAvailable(userId);
  if (!available) {
    return false;
  }
  const claimed = await User.findOneAndUpdate(
    { _id: userId, tutorFreeTrialUsed: { $ne: true } },
    {
      $set: {
        tutorFreeTrialUsed: true,
        tutorFreeTrialUsedAt: new Date(),
      },
    },
    { new: true },
  );
  return !!claimed;
}

function newIdempotencyKey() {
  return crypto.randomUUID();
}

async function createPaymentOrderForAppointment(appt, { idempotencyKey } = {}) {
  const key = String(idempotencyKey || newIdempotencyKey()).trim();
  if (!key) {
    const err = new Error("Idempotency key is required");
    err.status = 400;
    throw err;
  }

  const existing = await PaymentOrder.findOne({ idempotencyKey: key });
  if (existing) {
    if (String(existing.appointmentId) !== String(appt._id)) {
      const err = new Error("Idempotency key already used for another order");
      err.status = 409;
      throw err;
    }
    return existing;
  }

  const open = await PaymentOrder.findOne({
    appointmentId: appt._id,
    status: { $in: ["created", "pending"] },
  }).sort({ createdAt: -1 });
  if (open) {
    return open;
  }

  try {
    const order = await PaymentOrder.create({
      userId: appt.userId,
      appointmentId: appt._id,
      amount: appt.amount,
      currency: appt.currency,
      provider: getProviderName(),
      providerRef: "",
      idempotencyKey: key,
      status: "created",
      rawVerifyMeta: null,
    });
    appt.paymentOrderId = order._id;
    if (appt.paymentStatus === "unpaid") {
      appt.paymentStatus = "pending";
    }
    await appt.save();
    return order;
  } catch (dup) {
    if (dup && dup.code === 11000) {
      const again = await PaymentOrder.findOne({ idempotencyKey: key });
      if (again) return again;
    }
    throw dup;
  }
}

async function buildCheckoutPayload(order) {
  const checkout = await createCheckout({
    orderId: String(order._id),
    amount: order.amount,
    currency: order.currency,
    customerRef: String(order.userId),
    returnUrl: process.env.PAYMENT_RETURN_URL || "",
  });
  return {
    orderId: String(order._id),
    appointmentId: String(order.appointmentId),
    amount: order.amount,
    currency: order.currency,
    status: order.status,
    provider: order.provider,
    checkoutConfigured: !!checkout.configured,
    checkoutUrl: checkout.checkoutUrl || null,
    message:
      checkout.message ||
      "Complete payment with the configured provider when available.",
  };
}

/**
 * Idempotent paid confirmation. Only call after a real provider verified success.
 */
async function confirmAppointmentPaid(order, meta = null) {
  if (!order) {
    const err = new Error("Payment order not found");
    err.status = 404;
    throw err;
  }

  if (order.status === "succeeded") {
    const appt = await Appointment.findById(order.appointmentId);
    return { alreadyConfirmed: true, order, appointment: appt };
  }

  if (["cancelled", "expired", "refunded"].includes(order.status)) {
    const err = new Error("This payment order cannot be confirmed");
    err.status = 400;
    throw err;
  }

  const appt = await Appointment.findById(order.appointmentId);
  if (!appt) {
    const err = new Error("Appointment not found for payment order");
    err.status = 404;
    throw err;
  }

  if (appt.status === "cancelled") {
    const err = new Error("Appointment was cancelled");
    err.status = 400;
    throw err;
  }

  if (appt.paymentStatus === "paid" && appt.status === "confirmed") {
    order.status = "succeeded";
    if (meta != null) order.rawVerifyMeta = meta;
    await order.save();
    return { alreadyConfirmed: true, order, appointment: appt };
  }

  const tutor = await getTutorForBooking(String(appt.tutorId));
  const resolved = getZoomJoinUrlForAppointment(appt, tutor);
  const zoomLink = resolved.joinUrl;

  order.status = "succeeded";
  if (meta != null) {
    order.rawVerifyMeta = meta;
  }
  if (!order.providerRef && meta && typeof meta.providerRef === "string") {
    order.providerRef = meta.providerRef;
  }
  await order.save();

  appt.paymentStatus = "paid";
  appt.paymentRequired = true;
  appt.paymentOrderId = order._id;
  appt.zoomLink = zoomLink || "";
  appt.status = zoomLink ? "confirmed" : "pending";
  await appt.save();

  return { alreadyConfirmed: false, order, appointment: appt };
}

async function cancelLinkedPaymentOrders(appointmentId) {
  await PaymentOrder.updateMany(
    {
      appointmentId,
      status: { $in: ["created", "pending"] },
    },
    { $set: { status: "cancelled" } },
  );
}

module.exports = {
  getSessionPrice,
  isFreeTrialAvailable,
  markFreeTrialUsed,
  tryClaimFreeTrial,
  newIdempotencyKey,
  createPaymentOrderForAppointment,
  buildCheckoutPayload,
  confirmAppointmentPaid,
  cancelLinkedPaymentOrders,
  getProviderName,
  isProviderConfigured,
  verifyClientReturn,
  verifyWebhook,
};
