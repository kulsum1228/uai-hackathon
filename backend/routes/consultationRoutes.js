// ============================================================
// routes/consultationRoutes.js — Express router for consultations
// ============================================================

const express = require("express");
const router = express.Router();

const {
  requestConsultation,
  getPatientConsultations,
  getDoctorConsultations,
  getPendingConsultations,
  acceptConsultation,
  completeConsultation,
  addPrescription,
  sendMessage,
  getConsultationById,
} = require("../controllers/consultationController");

const { protect } = require("../middleware/authMiddleware");

// All consultation routes require a valid JWT

// ─── Consultation lifecycle ────────────────────────────────
// POST   /api/consultations/request         → patient creates consultation
// GET    /api/consultations/pending         → doctor sees all pending requests
router.post("/request", protect, requestConsultation);
router.get("/pending", protect, getPendingConsultations);

// GET  /api/consultations/patient/:patientId → patient/doctor views patient's consultations
// GET  /api/consultations/doctor/:doctorId   → doctor views their own consultations
router.get("/patient/:patientId", protect, getPatientConsultations);
router.get("/doctor/:doctorId", protect, getDoctorConsultations);

// PUT  /api/consultations/accept/:consultationId    → doctor accepts
// PUT  /api/consultations/complete/:consultationId  → doctor completes
// PUT  /api/consultations/prescription/:consultationId → doctor adds prescription
router.put("/accept/:consultationId", protect, acceptConsultation);
router.put("/complete/:consultationId", protect, completeConsultation);
router.put("/prescription/:consultationId", protect, addPrescription);

// ─── Messaging (REST fallback) ─────────────────────────────
// POST /api/consultations/message/:consultationId → send a message via HTTP
router.post("/message/:consultationId", protect, sendMessage);

// ─── Single consultation ───────────────────────────────────
// GET  /api/consultations/:consultationId → get full detail + message history
// Keep this LAST — generic /:id pattern must not shadow named routes above
router.get("/:consultationId", protect, getConsultationById);

module.exports = router;