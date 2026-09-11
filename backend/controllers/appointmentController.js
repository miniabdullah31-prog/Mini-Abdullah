const Appointment = require("../models/Appointment");
const {
  getTutorForBooking,
  getPublicTutorById,
  assertSlotBookable,
  zoomLinkFromTutor,
  isValidDateKey,
  isValidTime,
  isDateTimePast,
} = require("../services/tutorService");

function isPastAppointment(appt) {
  return isDateTimePast(appt.date, appt.endTime);
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

function toClientAppointment(appt, tutor) {
  const zoomOk =
    appt.status === "confirmed" &&
    !!String(appt.zoomLink || "").trim() &&
    !isPastAppointment(appt);

  return {
    id: String(appt._id),
    tutorId: String(appt.tutorId),
    tutorName: tutor?.name || "Tutor",
    tutorRole: tutor?.role || "",
    subject: appt.subject,
    date: appt.date,
    startTime: appt.startTime,
    endTime: appt.endTime,
    status: appt.status,
    zoomLink: zoomOk ? appt.zoomLink : "",
    canJoin: zoomOk,
    createdAt: appt.createdAt,
  };
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

    const { tutorId, date, startTime, endTime } = req.body || {};
    if (!tutorId || !date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Tutor, date, and time are required.",
      });
    }
    if (!isValidDateKey(date) || !isValidTime(startTime) || !isValidTime(endTime)) {
      return res.status(400).json({
        success: false,
        message: "Please choose a valid date and time.",
      });
    }

    const tutor = await getTutorForBooking(tutorId);
    await assertSlotBookable(tutor, date, startTime, endTime);

    const zoomLink = zoomLinkFromTutor(tutor);
    const status = zoomLink ? "confirmed" : "pending";

    let appointment;
    try {
      appointment = await Appointment.create({
        userId,
        tutorId: tutor._id,
        date,
        startTime,
        endTime,
        subject: tutor.subject,
        status,
        zoomLink,
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

    const publicTutor = await getPublicTutorById(String(tutor._id));
    return res.status(201).json({
      success: true,
      message: "Appointment booked",
      data: toClientAppointment(appointment, publicTutor || tutor),
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
      .populate("tutorId", "name role subject");

    const data = [];
    for (const row of rows) {
      const appt = await lazyComplete(row);
      const tutor = appt.tutorId;
      data.push(
        toClientAppointment(appt, {
          name: tutor?.name,
          role: tutor?.role,
        }),
      );
    }

    return res.json({ success: true, data });
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
      "name role subject",
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
      data: toClientAppointment(appt, appt.tutorId),
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
      "name role subject",
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
    await appt.save();

    return res.json({
      success: true,
      message: "Appointment cancelled",
      data: toClientAppointment(appt, appt.tutorId),
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
  createAppointment,
  listMyAppointments,
  getAppointment,
  cancelAppointment,
};
