// ============================================================
// controllers/ruralController.js
// Rural accessibility features:
//   - Emergency info endpoint (works as a static fallback)
//   - Minimal-payload medicine search
//   - Compression-friendly API responses
// ============================================================

const Medicine = require("../models/Medicine");

// ─── Static emergency data ────────────────────────────────
// Defined in the controller so it can be updated without a deploy
// by pulling from a database in future iterations.
const EMERGENCY_DATA = {
  emergencyNumbers: [
    { label: "National Emergency", number: "112", icon: "🚨" },
    { label: "Ambulance", number: "108", icon: "🚑" },
    { label: "Police", number: "100", icon: "👮" },
    { label: "Fire Brigade", number: "101", icon: "🔥" },
    { label: "Women Helpline", number: "1091", icon: "👩" },
    { label: "Poison Control", number: "1800-11-6117", icon: "☠️" },
    { label: "Child Helpline", number: "1098", icon: "🧒" },
    { label: "Senior Citizen", number: "14567", icon: "👴" },
  ],
  firstAidTips: [
    {
      id: 1,
      title: "Heart Attack",
      icon: "❤️",
      urgency: "critical",
      steps: [
        "Call 108 immediately.",
        "Keep the person calm — do not let them walk.",
        "Loosen tight clothing around chest and neck.",
        "If unconscious and not breathing, begin CPR.",
        "Give 325mg aspirin if available and not allergic.",
      ],
    },
    {
      id: 2,
      title: "Choking",
      icon: "🫁",
      urgency: "critical",
      steps: [
        "If they cannot speak, act immediately.",
        "Stand behind person, arms around waist.",
        "Give sharp upward abdominal thrusts (Heimlich).",
        "Repeat until expelled or person loses consciousness.",
        "If unconscious, call 108 and begin CPR.",
      ],
    },
    {
      id: 3,
      title: "Severe Bleeding",
      icon: "🩸",
      urgency: "critical",
      steps: [
        "Apply firm, direct pressure with a clean cloth.",
        "Do NOT remove cloth — add more on top if soaked.",
        "Raise injured part above heart level.",
        "Press continuously for 10–15 minutes.",
        "Call 108 for wounds that won't stop bleeding.",
      ],
    },
    {
      id: 4,
      title: "Burns",
      icon: "🔥",
      urgency: "high",
      steps: [
        "Move person away from heat source.",
        "Cool under cool running water for 20 minutes.",
        "Do NOT use ice, butter, or toothpaste.",
        "Cover loosely with a clean non-fluffy cloth.",
        "Seek care for burns larger than the person's palm.",
      ],
    },
    {
      id: 5,
      title: "Snake Bite",
      icon: "🐍",
      urgency: "critical",
      steps: [
        "Keep person calm and still.",
        "Immobilise the bitten limb below heart level.",
        "Remove rings and tight clothing near the bite.",
        "Do NOT cut, suck, or apply tourniquet.",
        "Rush to the nearest hospital immediately.",
      ],
    },
    {
      id: 6,
      title: "High Fever",
      icon: "🌡️",
      urgency: "medium",
      steps: [
        "Give paracetamol at correct age/weight dosage.",
        "Apply a cool damp cloth to forehead and armpits.",
        "Ensure the person drinks plenty of fluids.",
        "Seek care if fever exceeds 39.5°C or lasts 3+ days.",
      ],
    },
  ],
  generalAdvice: [
    "Keep a basic first aid kit at home.",
    "Know your nearest government hospital address.",
    "Store emergency numbers in your phone.",
    "Do not self-medicate for more than 2 days without improvement.",
  ],
};

// ─────────────────────────────────────────────────────────────
// @route   GET /api/emergency/info
// @desc    Returns emergency numbers, first aid tips, and advice
// @access  Public (no auth required — must work even if session expired)
//
// Response is intentionally small (<5 KB) for slow networks.
// ─────────────────────────────────────────────────────────────
const getEmergencyInfo = (req, res) => {
  // Set cache headers so browsers and CDNs cache this for 1 hour
  // This reduces repeat network requests on slow connections
  res.set("Cache-Control", "public, max-age=3600");

  res.status(200).json({
    success: true,
    data: EMERGENCY_DATA,
  });
};

// ─────────────────────────────────────────────────────────────
// @route   GET /api/rural/medicines/search?name=...
// @desc    Lightweight medicine search — minimal payload
// @access  Private
//
// Unlike the full /api/medicines/search endpoint, this returns
// ONLY the fields needed for display on a low-bandwidth screen.
// A typical response is ~1–2 KB vs ~8–10 KB from the full API.
// ─────────────────────────────────────────────────────────────
const lightweightMedicineSearch = async (req, res) => {
  try {
    const { name, location } = req.query;

    if (!name || name.trim() === "") {
      return res.status(400).json({
        message: "Query parameter 'name' is required.",
      });
    }

    const query = {
      name: { $regex: name.trim(), $options: "i" },
      stock: { $gt: 0 }, // Only return in-stock results
    };

    if (location) {
      query.location = { $regex: location.trim(), $options: "i" };
    }

    // select() limits fields returned from MongoDB — reduces payload size
    // Only return what the UI actually needs
    const medicines = await Medicine.find(query)
      .select("name pharmacyName location stock price -_id")
      .sort({ stock: -1, price: 1 })
      .limit(20); // Cap results to keep response small

    // Set cache header — medicine availability changes slowly
    // Cache for 5 minutes to reduce server load from repeat searches
    res.set("Cache-Control", "private, max-age=300");

    res.status(200).json({
      query: name,
      count: medicines.length,
      results: medicines,
    });
  } catch (error) {
    console.error("lightweightMedicineSearch error:", error);
    res.status(500).json({ message: "Server error during medicine search." });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   GET /api/rural/health-check
// @desc    Minimal ping endpoint for connectivity detection
// @access  Public
//
// Clients use this to check if they have a server connection.
// Response is a flat 40 bytes — minimal data waste.
// ─────────────────────────────────────────────────────────────
const healthCheck = (req, res) => {
  res.set("Cache-Control", "no-store");
  res.status(200).json({ ok: true });
};

module.exports = {
  getEmergencyInfo,
  lightweightMedicineSearch,
  healthCheck,
};