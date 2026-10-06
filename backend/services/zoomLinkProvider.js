/**
 * Zoom join URL resolution for tutor appointments.
 *
 * Fallback chain (first non-empty wins):
 *   1. stored appointment.zoomLink
 *   2. Tutor.defaultZoomLink
 *   3. env TUTOR_QURAN_ZOOM_LINK / TUTOR_ISLAMIC_ZOOM_LINK (by tutor slug)
 *
 * Future: swap getZoomJoinUrlForAppointment body for Zoom Meeting API without
 * redesigning TutorScreen (keep return shape { joinUrl, source }).
 */

const { zoomLinkFromTutor } = require("./tutorService");

/**
 * @param {object} appt Appointment doc
 * @param {object} tutor Tutor doc (needs slug / defaultZoomLink)
 * @returns {{ joinUrl: string, source: "appointment" | "tutor_fallback" | "none" }}
 */
function getZoomJoinUrlForAppointment(appt, tutor) {
  const stored = String(appt?.zoomLink || "").trim();
  if (stored) {
    return { joinUrl: stored, source: "appointment" };
  }
  if (!tutor) {
    return { joinUrl: "", source: "none" };
  }
  const fallback = zoomLinkFromTutor(tutor);
  if (fallback) {
    return { joinUrl: fallback, source: "tutor_fallback" };
  }
  return { joinUrl: "", source: "none" };
}

/**
 * Payment side allows Zoom (free trial or verified paid). Status may still be
 * pending when no join URL was available at booking time.
 */
function isPaymentEligibleForZoom(appt) {
  if (!appt) return false;
  if (["cancelled", "completed"].includes(appt.status)) return false;
  const paymentRequired = !!appt.paymentRequired;
  const paymentStatus = appt.paymentStatus || "not_required";
  if (paymentRequired && paymentStatus !== "paid") return false;
  return true;
}

/**
 * Whether Zoom may be exposed to the client for this appointment.
 */
function mayExposeZoom(appt) {
  if (!appt) return false;
  if (appt.status !== "confirmed") return false;
  return isPaymentEligibleForZoom(appt);
}

module.exports = {
  getZoomJoinUrlForAppointment,
  mayExposeZoom,
  isPaymentEligibleForZoom,
};
