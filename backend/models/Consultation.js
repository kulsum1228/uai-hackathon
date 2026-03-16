// ============================================================
// models/Consultation.js — Schema for telemedicine consultations
// ============================================================

const mongoose = require("mongoose");

// ─── Sub-schema: Individual chat message ──────────────────
const MessageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messageText: {
      type: String,
      required: [true, "Message text cannot be empty"],
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true } // Each message gets its own _id for reference
);

// ─── Main Consultation Schema ──────────────────────────────
const ConsultationSchema = new mongoose.Schema(
  {
    // The patient who requested this consultation
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Patient ID is required"],
    },

    // The doctor assigned to this consultation
    // Optional at creation — assigned when doctor accepts
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Patient-described symptoms or reason for visit
    symptoms: {
      type: String,
      required: [true, "Symptoms are required"],
      trim: true,
    },

    // Lifecycle status of the consultation
    status: {
      type: String,
      enum: {
        values: ["pending", "accepted", "completed", "cancelled"],
        message: "Status must be pending, accepted, completed, or cancelled",
      },
      default: "pending",
    },

    // All chat messages exchanged during the consultation
    messages: {
      type: [MessageSchema],
      default: [],
    },

    // Prescription notes added by the doctor after consultation
    prescription: {
      type: String,
      default: "",
      trim: true,
    },

    // Mode of consultation
    consultationType: {
      type: String,
      enum: {
        values: ["chat", "audio", "video"],
        message: "Consultation type must be chat, audio, or video",
      },
      required: [true, "Consultation type is required"],
    },
  },
  {
    // Auto-manage createdAt and updatedAt
    timestamps: true,
  }
);

// ─── Index for faster queries ──────────────────────────────
// Frequently queried by patientId and doctorId
ConsultationSchema.index({ patientId: 1 });
ConsultationSchema.index({ doctorId: 1 });
ConsultationSchema.index({ status: 1 });

module.exports = mongoose.model("Consultation", ConsultationSchema);