// ============================================================
// routes/healthRecordRoutes.js — Express router for health records
// ============================================================

const express = require("express");
const router = express.Router();

const {
  createHealthRecord,
  getHealthRecord,
  updateHealthRecord,
  deleteHealthRecord,
  getAllRecords,
} = require("../controllers/healthRecordController");

const { protect } = require("../middleware/authMiddleware");

// All routes below require a valid JWT — protect runs first on every one

// GET  /api/records         → doctors only: list all patient records
// POST /api/records         → patients only: create their health record
router.route("/")
  .get(protect, getAllRecords)
  .post(protect, createHealthRecord);

// GET    /api/records/:patientId → patient (own) or doctor: view a record
router.get("/:patientId", protect, getHealthRecord);

// PUT    /api/records/:recordId  → patient (owner only): update their record
// DELETE /api/records/:recordId  → patient (owner only): delete their record
router.route("/:recordId")
  .put(protect, updateHealthRecord)
  .delete(protect, deleteHealthRecord);

module.exports = router;