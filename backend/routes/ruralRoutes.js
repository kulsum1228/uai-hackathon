// ============================================================
// routes/ruralRoutes.js — Routes for rural accessibility features
// ============================================================

const express = require("express");
const router = express.Router();

const {
  getEmergencyInfo,
  lightweightMedicineSearch,
  healthCheck,
} = require("../controllers/ruralController");

const { protect } = require("../middleware/authMiddleware");

// ─── Public routes (no auth required) ─────────────────────

// GET /api/emergency/info
// Public — must work even if the patient's JWT has expired.
// This is the endpoint fetched by EmergencyMode.jsx.
router.get("/emergency/info", getEmergencyInfo);

// GET /api/rural/health-check
// Ultra-lightweight ping — used by frontend to detect connectivity
router.get("/rural/health-check", healthCheck);

// ─── Protected routes ──────────────────────────────────────

// GET /api/rural/medicines/search?name=paracetamol&location=mumbai
// Minimal-payload version of the medicine search for slow networks
router.get("/rural/medicines/search", protect, lightweightMedicineSearch);

module.exports = router;