const express = require("express");
const {
  listTutors,
  getTutor,
  getAvailability,
} = require("../controllers/tutorController");

const router = express.Router();

router.get("/", listTutors);
router.get("/:id/availability", getAvailability);
router.get("/:id", getTutor);

module.exports = router;
