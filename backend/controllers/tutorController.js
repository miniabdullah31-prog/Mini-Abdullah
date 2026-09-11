const {
  listActiveTutors,
  getPublicTutorById,
  getTutorForBooking,
  getAvailabilityForDate,
  isValidDateKey,
} = require("../services/tutorService");
const { todayKey } = require("../services/dailyContentService");

/** GET /api/tutors */
async function listTutors(_req, res) {
  try {
    const tutors = await listActiveTutors();
    return res.json({ success: true, data: tutors });
  } catch (err) {
    console.log("[tutors] list error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to load tutors",
    });
  }
}

/** GET /api/tutors/:id */
async function getTutor(req, res) {
  try {
    const tutor = await getPublicTutorById(req.params.id);
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor not found",
      });
    }
    return res.json({ success: true, data: tutor });
  } catch (err) {
    console.log("[tutors] get error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to load tutor",
    });
  }
}

/** GET /api/tutors/:id/availability?date=YYYY-MM-DD */
async function getAvailability(req, res) {
  try {
    const date = String(req.query.date || todayKey());
    if (!isValidDateKey(date)) {
      return res.status(400).json({
        success: false,
        message: "Please choose a valid date.",
      });
    }

    const tutor = await getTutorForBooking(req.params.id);
    if (!tutor || !tutor.isActive) {
      return res.status(404).json({
        success: false,
        message: "Tutor not found",
      });
    }

    const data = await getAvailabilityForDate(tutor, date);
    return res.json({ success: true, data });
  } catch (err) {
    console.log("[tutors] availability error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to load available times",
    });
  }
}

module.exports = {
  listTutors,
  getTutor,
  getAvailability,
};
