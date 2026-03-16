// ============================================================
// routes/medicineRoutes.js — Express router for medicine inventory
// ============================================================

const express = require("express");
const router = express.Router();

const {
  addMedicine,
  updateMedicine,
  deleteMedicine,
  searchMedicines,
  getPharmacyInventory,
  getMedicineById,
} = require("../controllers/medicineController");

const { protect } = require("../middleware/authMiddleware");

// All routes require a valid JWT

// ─── Named routes (must come BEFORE generic /:id routes) ───

// POST   /api/medicines/add               → pharmacy adds a medicine
// GET    /api/medicines/search?name=...   → any user searches by name
router.post("/add", protect, addMedicine);
router.get("/search", protect, searchMedicines);

// GET    /api/medicines/pharmacy/:pharmacyId → view a pharmacy's full inventory
router.get("/pharmacy/:pharmacyId", protect, getPharmacyInventory);

// ─── Generic ID routes ─────────────────────────────────────

// GET    /api/medicines/:medicineId       → get a single medicine record
// PUT    /api/medicines/update/:medicineId→ pharmacy updates their medicine
// DELETE /api/medicines/:medicineId       → pharmacy removes a medicine
router.get("/:medicineId", protect, getMedicineById);
router.put("/update/:medicineId", protect, updateMedicine);
router.delete("/:medicineId", protect, deleteMedicine);

module.exports = router;