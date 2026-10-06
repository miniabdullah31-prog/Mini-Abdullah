const Appointment = require("../models/Appointment");
const PaymentOrder = require("../models/PaymentOrder");
const {
  createPaymentOrderForAppointment,
  buildCheckoutPayload,
  confirmAppointmentPaid,
  newIdempotencyKey,
  verifyClientReturn,
  verifyWebhook,
} = require("../services/paymentService");
const {
  getPublicTutorById,
} = require("../services/tutorService");
const {
  toClientAppointmentAsync,
} = require("./appointmentController");

/**
 * POST /api/payments/create-order
 * Body: { appointmentId, idempotencyKey? }
 */
async function createOrder(req, res) {
  try {
    const userId = req.user.id;
    const { appointmentId, idempotencyKey } = req.body || {};
    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: "appointmentId is required",
      });
    }

    const appt = await Appointment.findById(appointmentId);
    if (!appt || String(appt.userId) !== String(userId)) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }
    if (!appt.paymentRequired) {
      return res.status(400).json({
        success: false,
        message: "This appointment does not require payment",
      });
    }
    if (appt.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "This appointment is already paid",
      });
    }
    if (appt.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cancelled appointments cannot be paid",
      });
    }

    const order = await createPaymentOrderForAppointment(appt, {
      idempotencyKey: idempotencyKey || newIdempotencyKey(),
    });
    const payment = await buildCheckoutPayload(order);

    return res.status(201).json({
      success: true,
      message: payment.checkoutConfigured
        ? "Payment order created"
        : "Payment order created — provider checkout not available yet",
      data: { payment },
    });
  } catch (err) {
    const status = err.status || 500;
    if (status < 500) {
      return res.status(status).json({
        success: false,
        message: err.message,
      });
    }
    console.log("[payments] create-order error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Could not create payment order",
    });
  }
}

/**
 * POST /api/payments/verify
 * Auth required. Does NOT mark paid unless the provider port verifies.
 * Body: { orderId?, idempotencyKey?, ...provider fields later }
 */
async function verifyPayment(req, res) {
  try {
    const userId = req.user.id;
    const { orderId, idempotencyKey } = req.body || {};

    let order = null;
    if (orderId) {
      order = await PaymentOrder.findById(orderId);
    } else if (idempotencyKey) {
      order = await PaymentOrder.findOne({
        idempotencyKey: String(idempotencyKey).trim(),
      });
    }

    if (!order || String(order.userId) !== String(userId)) {
      return res.status(404).json({
        success: false,
        message: "Payment order not found",
      });
    }

    if (order.status === "succeeded") {
      const appt = await Appointment.findById(order.appointmentId).populate(
        "tutorId",
        "name role subject slug defaultZoomLink",
      );
      return res.json({
        success: true,
        message: "Payment already confirmed",
        data: {
          alreadyConfirmed: true,
          paymentStatus: "paid",
          appointment: appt
            ? await toClientAppointmentAsync(appt, appt.tutorId)
            : null,
        },
      });
    }

    const result = await verifyClientReturn(req.body || {});
    if (!result.verified) {
      return res.status(402).json({
        success: false,
        message:
          result.reason ||
          "Payment could not be verified. No provider confirmation.",
        data: {
          verified: false,
          orderId: String(order._id),
          orderStatus: order.status,
        },
      });
    }

    const confirmed = await confirmAppointmentPaid(order, {
      source: "client_verify",
      providerRef: result.providerRef || "",
      ...(result.meta && typeof result.meta === "object" ? result.meta : {}),
    });

    const tutor =
      confirmed.appointment &&
      (await getPublicTutorById(String(confirmed.appointment.tutorId)));

    return res.json({
      success: true,
      message: confirmed.alreadyConfirmed
        ? "Payment already confirmed"
        : "Payment confirmed",
      data: {
        alreadyConfirmed: confirmed.alreadyConfirmed,
        paymentStatus: "paid",
        appointment: confirmed.appointment
          ? await toClientAppointmentAsync(
              confirmed.appointment,
              tutor || { name: "Tutor", role: "" },
            )
          : null,
      },
    });
  } catch (err) {
    const status = err.status || 500;
    if (status < 500) {
      return res.status(status).json({
        success: false,
        message: err.message,
      });
    }
    console.log("[payments] verify error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Payment verification failed",
    });
  }
}

/**
 * POST /api/payments/webhook
 * No user JWT. Provider signature verification required before confirm.
 * Stub provider never verifies — never fakes success.
 */
async function paymentWebhook(req, res) {
  try {
    const result = await verifyWebhook(req);
    if (!result.verified) {
      return res.status(400).json({
        success: false,
        message: result.reason || "Webhook not verified",
      });
    }

    let order = null;
    if (result.orderId) {
      order = await PaymentOrder.findById(result.orderId);
    } else if (result.providerRef) {
      order = await PaymentOrder.findOne({ providerRef: result.providerRef });
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Payment order not found for webhook",
      });
    }

    await confirmAppointmentPaid(order, {
      source: "webhook",
      providerRef: result.providerRef || order.providerRef,
      ...(result.meta && typeof result.meta === "object" ? result.meta : {}),
    });

    return res.json({ success: true, message: "Webhook processed" });
  } catch (err) {
    console.log("[payments] webhook error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Webhook processing failed",
    });
  }
}

module.exports = {
  createOrder,
  verifyPayment,
  paymentWebhook,
};
