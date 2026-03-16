// ============================================================
// controllers/symptomController.js
// AI symptom analysis using Google Gemini (free tier)
// ============================================================

const SymptomCheck        = require("../models/SymptomCheck");
const { analyzeSymptoms } = require("../services/aiService");

// ─────────────────────────────────────────────────────────────
// @route   POST /api/symptoms/check
// @desc    Analyse symptoms using Gemini AI and save result
// @access  Private — patients only
// ─────────────────────────────────────────────────────────────
const checkSymptoms = async (req, res) => {
  try {
    // 1. Role check
    if (req.user.role !== "patient") {
      return res.status(403).json({
        message: "Access denied. Only patients can use the symptom checker.",
      });
    }

    const { symptoms } = req.body;

    // 2. Validate — accept both array ["fever","cough"] and string "fever, cough"
    if (!symptoms || (Array.isArray(symptoms) && symptoms.length === 0)) {
      return res.status(400).json({
        message: "Please provide symptoms.",
        example: { symptoms: ["fever", "cough", "sore throat"] },
      });
    }

    const symptomsText = Array.isArray(symptoms)
      ? symptoms.join(", ")
      : String(symptoms).trim();

    if (!symptomsText) {
      return res.status(400).json({ message: "Symptoms cannot be empty." });
    }

    // 3. Call Gemini AI via aiService
    const aiResult = await analyzeSymptoms(symptoms);

    // 4. Map urgency level to recommendation text
    const recommendationMap = {
      Low:    "Mild condition – monitor symptoms",
      Medium: "Consult a doctor",
      High:   "Seek immediate medical attention",
    };

    // 5. Persist result to MongoDB for patient history
    const record = await SymptomCheck.create({
      patientId:          req.user._id,
      symptoms:           Array.isArray(symptoms)
        ? symptoms
        : symptoms.split(",").map((s) => s.trim()).filter(Boolean),
      possibleConditions: aiResult.conditions,
      recommendation:     recommendationMap[aiResult.urgency] || "Consult a doctor",
      urgencyLevel:       aiResult.urgency.toLowerCase(),
      adviceMessage:      aiResult.advice,
    });

    // 6. Return structured AI response
    res.status(201).json({
      message: "Symptom analysis complete.",
      result: {
        _id:            record._id,
        symptoms:       record.symptoms,
        conditions:     aiResult.conditions,
        urgency:        aiResult.urgency,
        advice:         aiResult.advice,
        disclaimer:     aiResult.disclaimer,
        recommendation: record.recommendation,
        urgencyLevel:   record.urgencyLevel,
        createdAt:      record.createdAt,
      },
    });
  } catch (error) {
    // ── Gemini-specific error handling ───────────────────

    // Invalid or missing API key
    if (error.message?.includes("API_KEY_INVALID") || error.status === 400) {
      console.error("Gemini API key error:", error.message);
      return res.status(500).json({
        message: "AI service configuration error. Check your GEMINI_API_KEY.",
      });
    }

    // Rate limit (free tier: 15 requests/min)
    if (error.status === 429) {
      return res.status(429).json({
        message: "AI service rate limit reached. Please wait a moment and try again.",
      });
    }

    // Safety filter blocked the content
    if (error.message?.includes("SAFETY")) {
      return res.status(400).json({
        message: "Please rephrase your symptoms using standard medical terms.",
      });
    }

    // Mongoose validation error
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }

    console.error("checkSymptoms error:", error);
    res.status(500).json({
      message: "Symptom analysis failed. Please try again.",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   GET /api/symptoms/history/:patientId
// @access  Private — the patient or a doctor
// ─────────────────────────────────────────────────────────────
const getSymptomHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const isOwn    = req.user._id.toString() === patientId;
    const isDoctor = req.user.role === "doctor";

    if (!isOwn && !isDoctor) {
      return res.status(403).json({ message: "Access denied." });
    }

    const history = await SymptomCheck.find({ patientId })
      .sort({ createdAt: -1 })
      .populate("patientId", "name email");

    res.status(200).json({ count: history.length, history });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid patient ID format." });
    }
    res.status(500).json({ message: "Server error while fetching symptom history." });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   GET /api/symptoms/:checkId
// @access  Private — the patient or a doctor
// ─────────────────────────────────────────────────────────────
const getSymptomCheckById = async (req, res) => {
  try {
    const check = await SymptomCheck.findById(req.params.checkId)
      .populate("patientId", "name email");

    if (!check) return res.status(404).json({ message: "Record not found." });

    const isOwner  = check.patientId._id.toString() === req.user._id.toString();
    const isDoctor = req.user.role === "doctor";
    if (!isOwner && !isDoctor) return res.status(403).json({ message: "Access denied." });

    res.status(200).json({ result: check });
  } catch (error) {
    if (error.name === "CastError") return res.status(400).json({ message: "Invalid ID." });
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = { checkSymptoms, getSymptomHistory, getSymptomCheckById };