// ============================================================
// routes/authRoutes.js — Express router for authentication
// ============================================================

const express = require("express");
const router = express.Router();

const { registerUser, loginUser, getMe } = require("../controllers/authController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// ─── Public Routes ─────────────────────────────────────────
// No token required for registration and login
router.post("/register", registerUser);
router.post("/login", loginUser);

// ─── Protected Routes ──────────────────────────────────────
// Token required — protect middleware validates the JWT first

// GET /api/auth/me — any authenticated user can fetch their own profile
router.get("/me", protect, getMe);

// Example of role-restricted routes (ready to use in other modules):
// router.get("/doctor-dashboard", protect, authorizeRoles("doctor"), getDoctorData);
// router.get("/pharmacy-panel",   protect, authorizeRoles("pharmacy"), getPharmacyData);
// router.get("/admin-only",       protect, authorizeRoles("doctor", "pharmacy"), getAdminData);

module.exports = router;