const Appointment = require("../models/Appointment");
const {
  getTutorForBooking,
  getPublicTutorById,
  assertSlotBookable,
  isValidDateKey,
  isValidTime,
  isDateTimePast,
} = require("../services/tutorService");
const {
  getSessionPrice,
  isFreeTrialAvailable,
  tryClaimFreeTrial,
  createPaymentOrderForAppointment,
  buildCheckoutPayload,
  cancelLinkedPaymentOrders,
  newIdempotencyKey,
} = require("../services/paymentService");
const {
  getZoomJoinUrlForAppointment,
  mayExposeZoom,
  isPaymentEligibleForZoom,
} = require("../services/zoomLinkProvider");

function isPastAppointment(appt) {
  return isDateTimePast(appt.date, appt.endTime);
}

function isPastStart(appt) {
  return isDateTimePast(appt.date, appt.startTime);
}

async function lazyComplete(appt) {
  if (
    ["pending", "confirmed"].includes(appt.status) &&
    isPastAppointment(appt)
  ) {
    appt.status = "completed";
    await appt.save();
  }
  return appt;
}

/**
 * Fill zoomLink from tutor/env fallback when the session is payment-eligible.
 * If the only reason status was pending was a missing Zoom URL, promote to
 * confirmed once a real link is available. Does not invent URLs.
 * Unpaid paid sessions stay pending with no Zoom.
 */
async function ensureAppointmentZoom(appt) {
  if (!isPaymentEligibleForZoom(appt)) {
    return appt;
  }
  if (appt.status === "completed") {
    return appt;
  }
  if (String(appt.zoomLink || "").trim() && appt.status === "confirmed") {
    return appt;
  }

  let tutorDoc = appt.tutorId;
  const needsSlug =
    !tutorDoc ||
    typeof tutorDoc !== "object" ||
    !tutorDoc.slug;

  if (needsSlug) {
    try {
      tutorDoc = await getTutorForBooking(
        String(appt.tutorId?._id || appt.tutorId),
      );
    } catch {
      return appt;
    }
  }

  const resolved = getZoomJoinUrlForAppointment(appt, tutorDoc);
  if (!resolved.joinUrl) {
    return appt;
  }

  let dirty = false;
  if (String(appt.zoomLink || "").trim() !== resolved.joinUrl) {
    appt.zoomLink = resolved.joinUrl;
    dirty = true;
  }
  if (appt.status === "pending") {
    appt.status = "confirmed";
    dirty = true;
  }
  if (dirty) {
    try {
      await appt.save();
    } catch {
      // still return in-memory values for this response
    }
  }
  return appt;
}

function paymentLabel(appt) {
  if (appt.isFreeTrial || (!appt.paymentRequired && appt.paymentStatus === "not_required")) {
    return "Free trial";
  }
  const status = appt.paymentStatus || "unpaid";
  if (status === "paid") return "Paid";
  if (status === "pending" || status === "unpaid") return "Payment pending";
  if (status === "failed") return "Payment failed";
  if (status === "cancelled") return "Payment cancelled";
  if (status === "refunded") return "Refunded";
  return status;
}

function toClientAppointment(appt, tutor) {
  const paymentStatus = appt.paymentStatus || "not_required";
  const paymentRequired = !!appt.paymentRequired;
  const isFreeTrial = !!appt.isFreeTrial;
  const pastEnd = isPastAppointment(appt);
  const pastStart = isPastStart(appt);

  const exposeZoom =
    mayExposeZoom(appt) &&
    !!String(appt.zoomLink || "").trim() &&
    !pastEnd;

  const requiresPayment =
    paymentRequired &&
    paymentStatus !== "paid" &&
    appt.status === "pending";

  const isUpcoming =
    ["pending", "confirmed"].includes(appt.status) && !pastEnd;

  return {
    id: String(appt._id),
    tutorId: String(appt.tutorId?._id || appt.tutorId),
    tutorName: tutor?.name || appt.tutorId?.name || "Tutor",
    tutorRole: tutor?.role || appt.tutorId?.role || "",
    subject: appt.subject,
    date: appt.date,
    startTime: appt.startTime,
    endTime: appt.endTime,
    status: appt.status,
    zoomLink: exposeZoom ? String(appt.zoomLink).trim() : "",
    canJoin: exposeZoom,
    notes: String(appt.notes || ""),
    createdAt: appt.createdAt,
    isFreeTrial,
    paymentRequired,
    paymentStatus,
    amount: typeof appt.amount === "number" ? appt.amount : 0,
    currency: String(appt.currency || "PKR"),
    paymentOrderId: appt.paymentOrderId
      ? String(appt.paymentOrderId)
      : null,
    requiresPayment,
    isUpcoming,
    sessionStarted: pastStart && !pastEnd,
    paymentLabel: paymentLabel(appt),
  };
}

async function toClientAppointmentAsync(appt, tutor) {
  await ensureAppointmentZoom(appt);
  return toClientAppointment(appt, tutor || appt.tutorId);
}

/** GET /api/appointments/trial-status */
async function getTrialStatus(req, res) {
  try {
    const available = await isFreeTrialAvailable(req.user.id);
    return res.json({
      success: true,
      data: { freeTrialAvailable: available },
    });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({
      success: false,
      message: err.message || "Failed to load trial status",
    });
  }
}

/** POST /api/appointments */
async function createAppointment(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please log in to book a tutor.",
      });
    }

    const { tutorId, date, startTime, endTime, notes, idempotencyKey } =
      req.body || {};
    if (!tutorId || !date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Tutor, date, and time are required.",
      });
    }
    if (
      !isValidDateKey(date) ||
      !isValidTime(startTime) ||
      !isValidTime(endTime)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please choose a valid date and time.",
      });
    }

    const tutor = await getTutorForBooking(tutorId);
    await assertSlotBookable(tutor, date, startTime, endTime);

    const notesText = String(notes || "").trim().slice(0, 1000);
    const price = getSessionPrice();
    const freeAvailable = await isFreeTrialAvailable(userId);

    let appointment;
    let paymentPayload = null;
    let bookedAsFree = false;

    if (freeAvailable) {
      const claimed = await tryClaimFreeTrial(userId);
      if (claimed) {
        const zoomResolved = getZoomJoinUrlForAppointment(
          { zoomLink: "" },
          tutor,
        );
        const zoomLink = zoomResolved.joinUrl;
        try {
          appointment = await Appointment.create({
            userId,
            tutorId: tutor._id,
            date,
            startTime,
            endTime,
            subject: tutor.subject,
            status: zoomLink ? "confirmed" : "pending",
            zoomLink: zoomLink || "",
            notes: notesText,
            isFreeTrial: true,
            paymentRequired: false,
            paymentStatus: "not_required",
            amount: 0,
            currency: price.currency,
            paymentOrderId: null,
          });
          bookedAsFree = true;
        } catch (dup) {
          // Roll back trial claim if slot lost
          const User = require("../models/User");
          await User.updateOne(
            { _id: userId },
            { $set: { tutorFreeTrialUsed: false, tutorFreeTrialUsedAt: null } },
          );
          if (dup && dup.code === 11000) {
            return res.status(409).json({
              success: false,
              message: "That time is no longer available.",
            });
          }
          throw dup;
        }
      }
    }

    if (!bookedAsFree) {
      try {
        appointment = await Appointment.create({
          userId,
          tutorId: tutor._id,
          date,
          startTime,
          endTime,
          subject: tutor.subject,
          status: "pending",
          zoomLink: "",
          notes: notesText,
          isFreeTrial: false,
          paymentRequired: true,
          paymentStatus: "unpaid",
          amount: price.amount,
          currency: price.currency,
          paymentOrderId: null,
        });
      } catch (dup) {
        if (dup && dup.code === 11000) {
          return res.status(409).json({
            success: false,
            message: "That time is no longer available.",
          });
        }
        throw dup;
      }

      const order = await createPaymentOrderForAppointment(appointment, {
        idempotencyKey: idempotencyKey || newIdempotencyKey(),
      });
      paymentPayload = await buildCheckoutPayload(order);
    }

    const publicTutor = await getPublicTutorById(String(tutor._id));
    const data = await toClientAppointmentAsync(
      appointment,
      publicTutor || tutor,
    );

    return res.status(201).json({
      success: true,
      message: bookedAsFree
        ? "Appointment booked"
        : "Appointment reserved — payment required before confirmation",
      data,
      payment: paymentPayload,
      freeTrialAvailable: false,
    });
  } catch (err) {
    const status = err.status || 500;
    if (status < 500) {
      return res.status(status).json({
        success: false,
        message: err.message,
      });
    }
    console.log("[appointments] create error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Could not book this session. Please try again.",
    });
  }
}

/** GET /api/appointments/my */
async function listMyAppointments(req, res) {
  try {
    const userId = req.user?.id;
    const rows = await Appointment.find({ userId })
      .sort({ date: 1, startTime: 1 })
      .populate("tutorId", "name role subject slug defaultZoomLink");

    const data = [];
    for (const row of rows) {
      const appt = await lazyComplete(row);
      data.push(await toClientAppointmentAsync(appt, appt.tutorId));
    }

    const freeTrialAvailable = await isFreeTrialAvailable(userId);

    return res.json({
      success: true,
      data,
      freeTrialAvailable,
    });
  } catch (err) {
    console.log("[appointments] my error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to load appointments",
    });
  }
}

/** GET /api/appointments/:id */
async function getAppointment(req, res) {
  try {
    const appt = await Appointment.findById(req.params.id).populate(
      "tutorId",
      "name role subject slug defaultZoomLink",
    );
    if (!appt || String(appt.userId) !== String(req.user.id)) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }
    await lazyComplete(appt);
    return res.json({
      success: true,
      data: await toClientAppointmentAsync(appt, appt.tutorId),
    });
  } catch (err) {
    console.log("[appointments] get error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to load appointment",
    });
  }
}

/** PATCH /api/appointments/:id/cancel */
async function cancelAppointment(req, res) {
  try {
    const appt = await Appointment.findById(req.params.id).populate(
      "tutorId",
      "name role subject slug defaultZoomLink",
    );
    if (!appt || String(appt.userId) !== String(req.user.id)) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }
    if (["completed", "cancelled"].includes(appt.status)) {
      return res.status(400).json({
        success: false,
        message: "This appointment cannot be cancelled.",
      });
    }
    if (isPastAppointment(appt)) {
      return res.status(400).json({
        success: false,
        message: "Past appointments cannot be cancelled.",
      });
    }

    appt.status = "cancelled";
    appt.zoomLink = "";
    if (appt.paymentRequired && appt.paymentStatus !== "paid") {
      appt.paymentStatus = "cancelled";
    }
    await appt.save();
    await cancelLinkedPaymentOrders(appt._id);

    return res.json({
      success: true,
      message: "Appointment cancelled",
      data: await toClientAppointmentAsync(appt, appt.tutorId),
    });
  } catch (err) {
    console.log("[appointments] cancel error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Could not cancel this appointment.",
    });
  }
}

module.exports = {
  toClientAppointment,
  toClientAppointmentAsync,
  getTrialStatus,
  createAppointment,
  listMyAppointments,
  getAppointment,
  cancelAppointment,
};
