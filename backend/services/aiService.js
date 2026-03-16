// ============================================================
// services/aiService.js — Groq AI symptom analysis (FREE)
// Groq runs Llama 3 at extremely fast speeds with no cost
// Get free API key: https://console.groq.com
// ============================================================

const Groq = require("groq-sdk");

// Initialise Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ─── System prompt ────────────────────────────────────────
const SYSTEM_PROMPT = `You are a medical symptom checker assistant for a rural healthcare platform.

Given a list of symptoms, analyze them and respond with ONLY a valid JSON object.
No explanations, no markdown, no code fences — just raw JSON.

Use this exact format:
{
  "conditions": ["condition1", "condition2", "condition3"],
  "urgency": "Low",
  "advice": "Practical health advice in 1-2 sentences.",
  "disclaimer": "This is not a medical diagnosis. Please consult a doctor."
}

Rules:
- "urgency" must be exactly one of: "Low", "Medium", or "High"
- "conditions" must be an array of 2-4 possible conditions
- High urgency = chest pain, difficulty breathing, stroke signs, severe symptoms
- Medium urgency = symptoms needing a doctor soon
- Low urgency = mild symptoms manageable at home
- Always recommend consulting a doctor
- Keep advice simple and accessible for rural patients with limited healthcare access`;

// ─────────────────────────────────────────────────────────────
// analyzeSymptoms()
// Sends symptoms to Groq (Llama 3) and returns structured insights
//
// @param {string|string[]} symptoms
// @returns {{ conditions, urgency, advice, disclaimer }}
// ─────────────────────────────────────────────────────────────
const analyzeSymptoms = async (symptoms) => {
  // Normalise — accept array or comma-separated string
  const symptomsText = Array.isArray(symptoms)
    ? symptoms.join(", ")
    : String(symptoms).trim();

  if (!symptomsText) {
    throw new Error("No symptoms provided.");
  }

  // Call Groq API with Llama 3.3 70B — fast and accurate
  const completion = await groq.chat.completions.create({
    model:       "llama-3.3-70b-versatile",
    temperature: 0.3,   // Low = consistent structured output
    max_tokens:  500,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user",   content: `Patient symptoms: ${symptomsText}` },
    ],
  });

  const rawText = completion.choices[0]?.message?.content?.trim();

  if (!rawText) {
    throw new Error("Empty response from Groq.");
  }

  // Strip any accidental markdown fences
  const cleaned = rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  // Parse JSON
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    console.error("Groq response was not valid JSON:", rawText);
    // Safe fallback
    return {
      conditions: ["Unable to determine — please describe symptoms more clearly"],
      urgency:    "Medium",
      advice:     "Our AI could not process these symptoms. Please consult a doctor.",
      disclaimer: "This is not a medical diagnosis. Please consult a doctor.",
    };
  }

  // Validate and normalise
  return {
    conditions: Array.isArray(parsed.conditions) && parsed.conditions.length > 0
      ? parsed.conditions
      : ["Unknown condition"],
    urgency: ["Low", "Medium", "High"].includes(parsed.urgency)
      ? parsed.urgency
      : "Medium",
    advice:     parsed.advice     || "Please consult a doctor for proper evaluation.",
    disclaimer: parsed.disclaimer || "This is not a medical diagnosis. Please consult a doctor.",
  };
};

module.exports = { analyzeSymptoms };