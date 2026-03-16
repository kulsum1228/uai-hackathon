// ============================================================
// models/SymptomCheck.js — Schema for AI symptom checker results
// ============================================================

const mongoose = require("mongoose");

const SymptomCheckSchema = new mongoose.Schema(
  {
    // The patient who submitted this symptom check
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Patient ID is required"],
    },

    // Raw symptoms submitted by the patient (e.g. ["fever", "cough"])
    symptoms: {
      type: [String],
      required: [true, "At least one symptom is required"],
      validate: {
        validator: (arr) => arr.length > 0,
        message: "Symptoms array cannot be empty",
      },
    },

    // Possible conditions identified by the rule-based engine
    possibleConditions: {
      type: [String],
      default: [],
    },

    // Urgency-level recommendation returned to the patient
    recommendation: {
      type: String,
      enum: {
        values: [
          "Mild condition – monitor symptoms",
          "Consult a doctor",
          "Seek immediate medical attention",
        ],
        message: "Invalid recommendation value",
      },
      required: true,
    },

    // Urgency level stored separately for easy filtering/sorting
    urgencyLevel: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true,
    },

    // Additional advice message shown to the patient
    adviceMessage: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, // createdAt + updatedAt auto-managed
  }
);

// Index for fast history lookups per patient
SymptomCheckSchema.index({ patientId: 1, createdAt: -1 });

module.exports = mongoose.model("SymptomCheck", SymptomCheckSchema);