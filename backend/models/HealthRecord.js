// ============================================================
// models/HealthRecord.js — Mongoose schema for patient health records
// ============================================================

const mongoose = require("mongoose");

const HealthRecordSchema = new mongoose.Schema(
  {
    // Reference to the User who owns this record (must be a patient)
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Patient ID is required"],
      unique: true, // One health record per patient
    },

    age: {
      type: Number,
      min: [0, "Age cannot be negative"],
      max: [150, "Age seems invalid"],
    },

    gender: {
      type: String,
      enum: {
        values: ["male", "female", "other", "prefer_not_to_say"],
        message: "Gender must be male, female, other, or prefer_not_to_say",
      },
    },

    bloodGroup: {
      type: String,
      enum: {
        values: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "unknown"],
        message: "Invalid blood group",
      },
      default: "unknown",
    },

    // Height in centimetres
    height: {
      type: Number,
      min: [0, "Height cannot be negative"],
    },

    // Weight in kilograms
    weight: {
      type: Number,
      min: [0, "Weight cannot be negative"],
    },

    // Arrays of strings — each item added via the API is pushed into the array
    allergies: {
      type: [String],
      default: [],
    },

    chronicDiseases: {
      type: [String],
      default: [],
    },

    currentMedications: {
      type: [String],
      default: [],
    },

    // Free-text field for past surgeries, hospitalisations, family history, etc.
    medicalHistory: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    // Automatically manage createdAt and updatedAt timestamps
    timestamps: true,
  }
);

module.exports = mongoose.model("HealthRecord", HealthRecordSchema);