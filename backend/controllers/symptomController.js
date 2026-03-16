// ============================================================
// controllers/symptomController.js
// Rule-based AI symptom analysis engine + API handlers
// ============================================================

const SymptomCheck = require("../models/SymptomCheck");

// ============================================================
// SECTION 1 — RULE-BASED AI ENGINE
// ============================================================
//
// How it works:
//   1. Each rule defines a set of trigger symptoms, the
//      condition it maps to, and an urgency level (low/medium/high).
//   2. A symptom is "matched" if the patient's input contains
//      the trigger word as a substring — so "chest pain" matches
//      both "chest pain" and "pain in chest".
//   3. All matching rules fire; the highest urgency level across
//      all matches determines the final recommendation.
//   4. If no rule matches, we default to "Consult a doctor".
// ============================================================

// ─── Rule definitions ─────────────────────────────────────
// Each rule:
//   triggers   — array of symptom keywords (ALL must be present to match)
//   condition  — human-readable condition name shown to patient
//   urgency    — "low" | "medium" | "high"
//   advice     — specific guidance for this condition

const SYMPTOM_RULES = [
  // ── Respiratory ──────────────────────────────────────────
  {
    triggers: ["fever", "cough"],
    condition: "Possible Influenza (Flu)",
    urgency: "medium",
    advice: "Rest, stay hydrated, and take paracetamol for fever. Consult a doctor if symptoms worsen after 3 days.",
  },
  {
    triggers: ["fever", "cough", "breathing difficulty"],
    condition: "Possible Pneumonia or COVID-19",
    urgency: "high",
    advice: "Difficulty breathing with fever is a serious sign. Seek medical attention immediately.",
  },
  {
    triggers: ["cough", "cold", "sneezing"],
    condition: "Possible Common Cold",
    urgency: "low",
    advice: "Rest well, drink warm fluids, and take OTC cold medication. Should resolve in 5–7 days.",
  },
  {
    triggers: ["wheezing", "shortness of breath"],
    condition: "Possible Asthma Attack",
    urgency: "high",
    advice: "Use your inhaler immediately if available. If no relief, seek emergency care.",
  },
  {
    triggers: ["cough", "blood"],
    condition: "Possible Tuberculosis or Lung Condition",
    urgency: "high",
    advice: "Coughing blood is a serious symptom. Seek immediate medical attention.",
  },

  // ── Cardiac ──────────────────────────────────────────────
  {
    triggers: ["chest pain"],
    condition: "Possible Cardiac Issue",
    urgency: "high",
    advice: "Chest pain can indicate a heart attack. Call emergency services or go to the nearest hospital immediately.",
  },
  {
    triggers: ["chest pain", "left arm pain"],
    condition: "Possible Heart Attack",
    urgency: "high",
    advice: "These are classic heart attack symptoms. Call emergency services NOW.",
  },
  {
    triggers: ["chest pain", "sweating", "dizziness"],
    condition: "Possible Heart Attack or Angina",
    urgency: "high",
    advice: "This combination of symptoms is a medical emergency. Seek immediate care.",
  },
  {
    triggers: ["palpitations", "irregular heartbeat"],
    condition: "Possible Arrhythmia",
    urgency: "high",
    advice: "Heart rhythm issues need prompt evaluation. Visit a doctor today.",
  },

  // ── Neurological ─────────────────────────────────────────
  {
    triggers: ["headache", "nausea"],
    condition: "Possible Migraine",
    urgency: "medium",
    advice: "Rest in a quiet, dark room. Take prescribed migraine medication if available. Consult a doctor if this is recurring.",
  },
  {
    triggers: ["severe headache", "stiff neck", "fever"],
    condition: "Possible Meningitis",
    urgency: "high",
    advice: "Severe headache with stiff neck and fever can indicate meningitis — a medical emergency. Seek immediate care.",
  },
  {
    triggers: ["headache", "blurred vision"],
    condition: "Possible Hypertension or Eye Strain",
    urgency: "medium",
    advice: "Headache with vision changes can indicate high blood pressure. Get your BP checked today.",
  },
  {
    triggers: ["dizziness", "loss of balance"],
    condition: "Possible Vertigo or Inner Ear Issue",
    urgency: "medium",
    advice: "Avoid sudden movements. Consult a doctor if dizziness persists or is recurrent.",
  },
  {
    triggers: ["sudden numbness", "facial drooping", "slurred speech"],
    condition: "Possible Stroke",
    urgency: "high",
    advice: "These are stroke warning signs (FAST). Call emergency services immediately — time is critical.",
  },
  {
    triggers: ["seizure"],
    condition: "Possible Epilepsy or Seizure Disorder",
    urgency: "high",
    advice: "If currently seizing, ensure safety and call emergency services. First-time seizures require immediate evaluation.",
  },

  // ── Gastrointestinal ─────────────────────────────────────
  {
    triggers: ["stomach pain", "vomiting"],
    condition: "Possible Food Poisoning or Gastritis",
    urgency: "medium",
    advice: "Stay hydrated with ORS solution. Avoid solid foods for a few hours. Consult a doctor if vomiting is persistent.",
  },
  {
    triggers: ["stomach pain", "vomiting", "diarrhea"],
    condition: "Possible Gastroenteritis",
    urgency: "medium",
    advice: "Risk of dehydration is high. Drink ORS regularly. Seek medical care if symptoms exceed 48 hours.",
  },
  {
    triggers: ["severe stomach pain", "bloating"],
    condition: "Possible Appendicitis or Bowel Obstruction",
    urgency: "high",
    advice: "Severe abdominal pain with bloating requires urgent evaluation to rule out appendicitis.",
  },
  {
    triggers: ["nausea", "vomiting", "yellow skin"],
    condition: "Possible Jaundice or Hepatitis",
    urgency: "high",
    advice: "Yellowing of skin or eyes is a serious sign. Seek medical attention today.",
  },
  {
    triggers: ["diarrhea", "blood in stool"],
    condition: "Possible Dysentery or GI Bleeding",
    urgency: "high",
    advice: "Blood in stool requires prompt medical evaluation. Visit a doctor immediately.",
  },
  {
    triggers: ["heartburn", "acid reflux"],
    condition: "Possible GERD (Acid Reflux)",
    urgency: "low",
    advice: "Avoid spicy, oily, and acidic foods. Take antacids if available. Consult a doctor if it is frequent.",
  },

  // ── Infectious / Fever-based ─────────────────────────────
  {
    triggers: ["fever", "body ache", "fatigue"],
    condition: "Possible Viral Fever or Dengue",
    urgency: "medium",
    advice: "Rest and hydrate well. Monitor platelet count if in a dengue-endemic area. Consult a doctor if fever exceeds 3 days.",
  },
  {
    triggers: ["fever", "rash"],
    condition: "Possible Viral Infection or Allergic Reaction",
    urgency: "medium",
    advice: "Fever with rash has several causes. Consult a doctor for proper diagnosis.",
  },
  {
    triggers: ["high fever", "chills", "sweating"],
    condition: "Possible Malaria or Typhoid",
    urgency: "high",
    advice: "Cyclic fever with chills in tropical areas may indicate malaria. Get tested immediately.",
  },
  {
    triggers: ["fever", "joint pain"],
    condition: "Possible Chikungunya or Dengue",
    urgency: "medium",
    advice: "Joint pain with fever is common in mosquito-borne illnesses. Consult a doctor for blood tests.",
  },

  // ── Urinary / Renal ──────────────────────────────────────
  {
    triggers: ["burning urination", "frequent urination"],
    condition: "Possible Urinary Tract Infection (UTI)",
    urgency: "medium",
    advice: "Drink plenty of water. Consult a doctor for antibiotic treatment to prevent spread to kidneys.",
  },
  {
    triggers: ["back pain", "fever", "painful urination"],
    condition: "Possible Kidney Infection (Pyelonephritis)",
    urgency: "high",
    advice: "Kidney infections can become severe quickly. Seek medical attention today.",
  },

  // ── Dermatological ───────────────────────────────────────
  {
    triggers: ["itching", "rash", "swelling"],
    condition: "Possible Allergic Reaction",
    urgency: "medium",
    advice: "Take an antihistamine if available. If swelling affects throat or breathing, seek emergency care immediately.",
  },
  {
    triggers: ["rash", "blisters"],
    condition: "Possible Chickenpox or Herpes Zoster",
    urgency: "medium",
    advice: "Avoid contact with others. Consult a doctor for antiviral treatment.",
  },

  // ── Mental Health ─────────────────────────────────────────
  {
    triggers: ["anxiety", "panic", "racing heart"],
    condition: "Possible Anxiety or Panic Attack",
    urgency: "medium",
    advice: "Practice slow, deep breathing. If this is recurring, consult a doctor about anxiety management.",
  },
  {
    triggers: ["depression", "sadness", "hopelessness"],
    condition: "Possible Depression",
    urgency: "medium",
    advice: "Please speak to a trusted person or mental health professional. You are not alone — help is available.",
  },

  // ── Musculoskeletal ───────────────────────────────────────
  {
    triggers: ["joint pain", "swelling", "stiffness"],
    condition: "Possible Arthritis or Gout",
    urgency: "low",
    advice: "Apply ice to swollen joints. Avoid high-purine foods. Consult a doctor for proper diagnosis.",
  },
  {
    triggers: ["back pain"],
    condition: "Possible Muscle Strain or Disc Issue",
    urgency: "low",
    advice: "Rest and apply heat. Avoid lifting heavy objects. Consult a doctor if pain is severe or radiates to legs.",
  },

  // ── Eye / ENT ─────────────────────────────────────────────
  {
    triggers: ["eye pain", "red eyes", "discharge"],
    condition: "Possible Conjunctivitis (Pink Eye)",
    urgency: "low",
    advice: "Avoid touching eyes. Use clean cloth to wipe discharge. Consult a doctor for eye drops.",
  },
  {
    triggers: ["ear pain", "hearing loss"],
    condition: "Possible Ear Infection",
    urgency: "medium",
    advice: "Avoid inserting objects into the ear. Consult a doctor for antibiotic ear drops.",
  },
  {
    triggers: ["sore throat", "difficulty swallowing"],
    condition: "Possible Tonsillitis or Strep Throat",
    urgency: "medium",
    advice: "Gargle with warm salt water. Consult a doctor if symptoms persist beyond 3 days.",
  },

  // ── Diabetes / Metabolic ─────────────────────────────────
  {
    triggers: ["excessive thirst", "frequent urination", "fatigue"],
    condition: "Possible Diabetes",
    urgency: "medium",
    advice: "These are classic diabetes symptoms. Consult a doctor for blood sugar testing.",
  },
  {
    triggers: ["sweating", "trembling", "confusion"],
    condition: "Possible Hypoglycemia (Low Blood Sugar)",
    urgency: "high",
    advice: "Consume sugar immediately (juice, candy, glucose). Seek medical attention if symptoms do not resolve quickly.",
  },
];

// ─── Urgency priority map ─────────────────────────────────
const URGENCY_PRIORITY = { low: 1, medium: 2, high: 3 };

// ─── Recommendation map ───────────────────────────────────
const URGENCY_TO_RECOMMENDATION = {
  low: "Mild condition – monitor symptoms",
  medium: "Consult a doctor",
  high: "Seek immediate medical attention",
};

// ─── Core analysis function ───────────────────────────────
/**
 * analyzeSymptoms()
 *
 * Takes an array of symptom strings entered by the patient,
 * normalises them to lowercase, and checks each rule.
 * A rule matches when ALL of its trigger keywords appear
 * as substrings within any of the patient's symptom strings.
 *
 * Returns:
 *   possibleConditions — unique list of matched condition names
 *   recommendation     — text shown to the patient
 *   urgencyLevel       — "low" | "medium" | "high"
 *   adviceMessage      — the most urgent specific advice
 */
const analyzeSymptoms = (symptomsInput) => {
  // Normalise input once
  const normalised = symptomsInput.map((s) => s.toLowerCase().trim());

  const matchedConditions = [];
  let highestUrgency = "low";
  let highestAdvice = "No specific conditions identified. General self-care is recommended.";

  for (const rule of SYMPTOM_RULES) {
    // Check if ALL trigger keywords for this rule appear in the patient's input
    const allTriggersMatched = rule.triggers.every((trigger) =>
      normalised.some((symptom) => symptom.includes(trigger))
    );

    if (allTriggersMatched) {
      matchedConditions.push(rule.condition);

      // Upgrade urgency if this rule is more severe
      if (URGENCY_PRIORITY[rule.urgency] > URGENCY_PRIORITY[highestUrgency]) {
        highestUrgency = rule.urgency;
        highestAdvice = rule.advice;
      }
    }
  }

  // If nothing matched, recommend a general doctor consultation
  if (matchedConditions.length === 0) {
    return {
      possibleConditions: ["Condition not identified from provided symptoms"],
      recommendation: "Consult a doctor",
      urgencyLevel: "medium",
      adviceMessage:
        "Your symptoms could not be matched to a known condition in our system. Please consult a doctor for a proper diagnosis.",
    };
  }

  return {
    possibleConditions: [...new Set(matchedConditions)], // deduplicate
    recommendation: URGENCY_TO_RECOMMENDATION[highestUrgency],
    urgencyLevel: highestUrgency,
    adviceMessage: highestAdvice,
  };
};

// ============================================================
// SECTION 2 — API CONTROLLERS
// ============================================================

// ─────────────────────────────────────────────────────────────
// @route   POST /api/symptoms/check
// @desc    Analyse patient symptoms and save result
// @access  Private — patients only
// ─────────────────────────────────────────────────────────────
const checkSymptoms = async (req, res) => {
  try {
    // 1. Only patients can use the symptom checker
    if (req.user.role !== "patient") {
      return res.status(403).json({
        message: "Access denied. Only patients can use the symptom checker.",
      });
    }

    const { symptoms } = req.body;

    // 2. Validate input
    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({
        message: "Please provide a non-empty array of symptoms.",
        example: { symptoms: ["fever", "cough", "headache"] },
      });
    }

    // Sanitise: remove empty strings and trim whitespace
    const cleanedSymptoms = symptoms
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (cleanedSymptoms.length === 0) {
      return res.status(400).json({ message: "Symptoms cannot be blank strings." });
    }

    // 3. Run the rule-based analysis engine
    const { possibleConditions, recommendation, urgencyLevel, adviceMessage } =
      analyzeSymptoms(cleanedSymptoms);

    // 4. Persist the result for the patient's history
    const result = await SymptomCheck.create({
      patientId: req.user._id,
      symptoms: cleanedSymptoms,
      possibleConditions,
      recommendation,
      urgencyLevel,
      adviceMessage,
    });

    res.status(201).json({
      message: "Symptom analysis complete.",
      result,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    console.error("checkSymptoms error:", error);
    res.status(500).json({ message: "Server error during symptom analysis." });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   GET /api/symptoms/history/:patientId
// @desc    Get a patient's symptom check history
// @access  Private — the patient themselves OR a doctor
// ─────────────────────────────────────────────────────────────
const getSymptomHistory = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Patients can only view their own history; doctors can view any
    const isOwnHistory = req.user._id.toString() === patientId;
    const isDoctor = req.user.role === "doctor";

    if (!isOwnHistory && !isDoctor) {
      return res.status(403).json({
        message: "Access denied. You can only view your own symptom history.",
      });
    }

    // Return most recent checks first
    const history = await SymptomCheck.find({ patientId })
      .sort({ createdAt: -1 })
      .populate("patientId", "name email");

    res.status(200).json({
      count: history.length,
      history,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid patient ID format." });
    }
    console.error("getSymptomHistory error:", error);
    res.status(500).json({ message: "Server error while fetching symptom history." });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   GET /api/symptoms/:checkId
// @desc    Get a single symptom check result by ID
// @access  Private — the patient themselves OR a doctor
// ─────────────────────────────────────────────────────────────
const getSymptomCheckById = async (req, res) => {
  try {
    const check = await SymptomCheck.findById(req.params.checkId).populate(
      "patientId",
      "name email"
    );

    if (!check) {
      return res.status(404).json({ message: "Symptom check record not found." });
    }

    const isOwner = check.patientId._id.toString() === req.user._id.toString();
    const isDoctor = req.user.role === "doctor";

    if (!isOwner && !isDoctor) {
      return res.status(403).json({ message: "Access denied." });
    }

    res.status(200).json({ result: check });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid check ID format." });
    }
    console.error("getSymptomCheckById error:", error);
    res.status(500).json({ message: "Server error while fetching record." });
  }
};

module.exports = { checkSymptoms, getSymptomHistory, getSymptomCheckById };