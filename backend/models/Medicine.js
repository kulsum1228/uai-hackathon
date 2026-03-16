// ============================================================
// models/Medicine.js — Schema for pharmacy medicine inventory
// ============================================================

const mongoose = require("mongoose");

const MedicineSchema = new mongoose.Schema(
  {
    // Medicine name — indexed for fast case-insensitive search
    name: {
      type: String,
      required: [true, "Medicine name is required"],
      trim: true,
    },

    // The pharmacy user who owns this inventory record
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Pharmacy ID is required"],
    },

    // Denormalised for fast reads (avoids extra User lookup on every search)
    pharmacyName: {
      type: String,
      required: [true, "Pharmacy name is required"],
      trim: true,
    },

    // Physical location / address of the pharmacy
    location: {
      type: String,
      required: [true, "Pharmacy location is required"],
      trim: true,
    },

    // Number of units available; 0 = out of stock
    stock: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },

    // Price per unit in local currency
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    // Category helps patients and doctors filter medicines
    category: {
      type: String,
      enum: {
        values: [
          "antibiotic",
          "analgesic",
          "antiviral",
          "antifungal",
          "antacid",
          "antihistamine",
          "antidiabetic",
          "antihypertensive",
          "vitamin",
          "vaccine",
          "other",
        ],
        message: "Invalid medicine category",
      },
      default: "other",
    },

    // Whether the medicine requires a doctor's prescription
    requiresPrescription: {
      type: Boolean,
      default: false,
    },

    // Optional: manufacturer or brand name
    manufacturer: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true, // createdAt + updatedAt auto-managed by Mongoose
  }
);

// ─── Indexes ───────────────────────────────────────────────
// Text index on name enables fast $text search queries
MedicineSchema.index({ name: "text" });

// Compound index for pharmacy inventory lookups
MedicineSchema.index({ pharmacyId: 1, name: 1 });

// Unique constraint: a pharmacy can only have one record per medicine name
MedicineSchema.index({ pharmacyId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Medicine", MedicineSchema);