// ============================================================
// routes/symptomRoutes.js — Express router for symptom checker
// ============================================================

const express = require("express");
const router = express.Router();

const {
  checkSymptoms,
  getSymptomHistory,
  getSymptomCheckById,
} = require("../controllers/symptomController");

const { protect } = require("../middleware/authMiddleware");

// All routes require a valid JWT

// POST /api/symptoms/check                  → patient submits symptoms for analysis
// GET  /api/symptoms/history/:patientId     → patient/doctor views history
// GET  /api/symptoms/:checkId               → get a single result by ID
//
// IMPORTANT: named routes (/check, /history) must come BEFORE
// the generic /:checkId route to avoid being shadowed by it.

router.post("/check", protect, checkSymptoms);
router.get("/history/:patientId", protect, getSymptomHistory);
router.get("/:checkId", protect, getSymptomCheckById);

module.exports = router;