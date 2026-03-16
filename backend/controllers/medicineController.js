// ============================================================
// controllers/medicineController.js — Medicine inventory logic
// ============================================================

const Medicine = require("../models/Medicine");

// ─────────────────────────────────────────────────────────────
// @route   POST /api/medicines/add
// @desc    Pharmacy adds a new medicine to their inventory
// @access  Private — pharmacy role only
// ─────────────────────────────────────────────────────────────
const addMedicine = async (req, res) => {
  try {
    // 1. Only pharmacy users can add medicines
    if (req.user.role !== "pharmacy") {
      return res.status(403).json({
        message: "Access denied. Only pharmacy users can add medicines.",
      });
    }

    const {
      name,
      stock,
      price,
      location,
      category,
      requiresPrescription,
      manufacturer,
    } = req.body;

    // 2. Validate required fields
    if (!name || stock === undefined || price === undefined || !location) {
      return res.status(400).json({
        message: "name, stock, price, and location are required.",
      });
    }

    // 3. Prevent duplicate medicine entries for the same pharmacy
    //    Uses case-insensitive match to avoid "Paracetamol" vs "paracetamol" duplicates
    const existing = await Medicine.findOne({
      pharmacyId: req.user._id,
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });

    if (existing) {
      return res.status(409).json({
        message: `'${name}' already exists in your inventory. Use PUT /api/medicines/update/:id to update its stock.`,
        existingMedicineId: existing._id,
      });
    }

    // 4. Create the medicine record linked to this pharmacy user
    const medicine = await Medicine.create({
      name: name.trim(),
      pharmacyId: req.user._id,
      pharmacyName: req.user.name, // pulled from JWT-attached user object
      location: location.trim(),
      stock,
      price,
      category: category || "other",
      requiresPrescription: requiresPrescription || false,
      manufacturer: manufacturer || "",
    });

    res.status(201).json({
      message: "Medicine added to inventory successfully.",
      medicine,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    // MongoDB duplicate key error (from the unique compound index)
    if (error.code === 11000) {
      return res.status(409).json({
        message: "This medicine already exists in your inventory.",
      });
    }
    console.error("addMedicine error:", error);
    res.status(500).json({ message: "Server error while adding medicine." });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   PUT /api/medicines/update/:medicineId
// @desc    Pharmacy updates stock, price, or other fields
// @access  Private — the pharmacy that owns the record only
// ─────────────────────────────────────────────────────────────
const updateMedicine = async (req, res) => {
  try {
    // 1. Role check
    if (req.user.role !== "pharmacy") {
      return res.status(403).json({
        message: "Access denied. Only pharmacy users can update medicines.",
      });
    }

    const medicine = await Medicine.findById(req.params.medicineId);
    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found." });
    }

    // 2. Ownership check — a pharmacy can only update their own inventory
    if (medicine.pharmacyId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Access denied. You can only update medicines in your own inventory.",
      });
    }

    // 3. Whitelist updatable fields
    const allowedUpdates = [
      "stock",
      "price",
      "location",
      "category",
      "requiresPrescription",
      "manufacturer",
    ];

    const updates = {};
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No valid fields provided for update.",
        updatableFields: allowedUpdates,
      });
    }

    // 4. Apply updates; runValidators ensures min/max rules are enforced
    const updated = await Medicine.findByIdAndUpdate(
      req.params.medicineId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Medicine updated successfully.",
      medicine: updated,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid medicine ID format." });
    }
    console.error("updateMedicine error:", error);
    res.status(500).json({ message: "Server error while updating medicine." });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   DELETE /api/medicines/:medicineId
// @desc    Pharmacy removes a medicine from their inventory
// @access  Private — the pharmacy that owns the record only
// ─────────────────────────────────────────────────────────────
const deleteMedicine = async (req, res) => {
  try {
    if (req.user.role !== "pharmacy") {
      return res.status(403).json({
        message: "Access denied. Only pharmacy users can delete medicines.",
      });
    }

    const medicine = await Medicine.findById(req.params.medicineId);
    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found." });
    }

    if (medicine.pharmacyId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Access denied. You can only delete medicines from your own inventory.",
      });
    }

    await Medicine.findByIdAndDelete(req.params.medicineId);

    res.status(200).json({ message: "Medicine removed from inventory." });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid medicine ID format." });
    }
    console.error("deleteMedicine error:", error);
    res.status(500).json({ message: "Server error while deleting medicine." });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   GET /api/medicines/search?name=paracetamol
// @desc    Search medicines by name — returns all pharmacies that stock it
// @access  Private — any authenticated user
//
// Query params:
//   name      (required) — medicine name to search
//   inStock   (optional) — "true" to filter only available stock
//   location  (optional) — filter by pharmacy location
// ─────────────────────────────────────────────────────────────
const searchMedicines = async (req, res) => {
  try {
    const { name, inStock, location } = req.query;

    if (!name || name.trim() === "") {
      return res.status(400).json({
        message: "Query parameter 'name' is required.",
        example: "/api/medicines/search?name=paracetamol",
      });
    }

    // Build a flexible query object
    const query = {
      // Case-insensitive partial match — "para" matches "Paracetamol"
      name: { $regex: name.trim(), $options: "i" },
    };

    // Filter to only in-stock medicines if requested
    if (inStock === "true") {
      query.stock = { $gt: 0 };
    }

    // Optionally filter by pharmacy location (partial match)
    if (location) {
      query.location = { $regex: location.trim(), $options: "i" };
    }

    const medicines = await Medicine.find(query)
      .select("name pharmacyName location stock price category requiresPrescription updatedAt")
      .sort({ stock: -1, price: 1 }); // Most stocked first, then cheapest

    if (medicines.length === 0) {
      return res.status(200).json({
        message: `No pharmacies found carrying '${name}'.`,
        count: 0,
        results: [],
      });
    }

    // Group results: separate in-stock from out-of-stock for better UX
    const inStockResults = medicines.filter((m) => m.stock > 0);
    const outOfStockResults = medicines.filter((m) => m.stock === 0);

    res.status(200).json({
      searchTerm: name,
      count: medicines.length,
      inStockCount: inStockResults.length,
      results: {
        available: inStockResults,
        outOfStock: outOfStockResults,
      },
    });
  } catch (error) {
    console.error("searchMedicines error:", error);
    res.status(500).json({ message: "Server error while searching medicines." });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   GET /api/medicines/pharmacy/:pharmacyId
// @desc    Get the full inventory of a specific pharmacy
// @access  Private — the pharmacy themselves OR a doctor/patient
// ─────────────────────────────────────────────────────────────
const getPharmacyInventory = async (req, res) => {
  try {
    const { pharmacyId } = req.params;

    // A pharmacy can view their own inventory; patients and doctors can also browse
    const isOwnInventory = req.user._id.toString() === pharmacyId;
    const isPharmacy = req.user.role === "pharmacy";

    // Pharmacies can only view their own inventory via this route
    if (isPharmacy && !isOwnInventory) {
      return res.status(403).json({
        message: "Access denied. You can only view your own inventory.",
      });
    }

    const { category, inStock } = req.query;

    const query = { pharmacyId };

    // Optional filters
    if (category) query.category = category;
    if (inStock === "true") query.stock = { $gt: 0 };

    const inventory = await Medicine.find(query).sort({ name: 1 }); // alphabetical

    res.status(200).json({
      count: inventory.length,
      inventory,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid pharmacy ID format." });
    }
    console.error("getPharmacyInventory error:", error);
    res.status(500).json({ message: "Server error while fetching inventory." });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   GET /api/medicines/:medicineId
// @desc    Get a single medicine record by ID
// @access  Private — any authenticated user
// ─────────────────────────────────────────────────────────────
const getMedicineById = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.medicineId).populate(
      "pharmacyId",
      "name email phone"
    );

    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found." });
    }

    res.status(200).json({ medicine });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid medicine ID format." });
    }
    console.error("getMedicineById error:", error);
    res.status(500).json({ message: "Server error while fetching medicine." });
  }
};

module.exports = {
  addMedicine,
  updateMedicine,
  deleteMedicine,
  searchMedicines,
  getPharmacyInventory,
  getMedicineById,
};