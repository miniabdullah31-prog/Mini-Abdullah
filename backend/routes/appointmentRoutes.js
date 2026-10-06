const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  createAppointment,
  listMyAppointments,
  getAppointment,
  cancelAppointment,
  getTrialStatus,
} = require("../controllers/appointmentController");

const router = express.Router();

router.use(authMiddleware);

router.get("/trial-status", getTrialStatus);
router.post("/", createAppointment);
router.get("/my", listMyAppointments);
router.get("/:id", getAppointment);
router.patch("/:id/cancel", cancelAppointment);

module.exports = router;
