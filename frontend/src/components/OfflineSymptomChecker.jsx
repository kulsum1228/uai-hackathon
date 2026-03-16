// ============================================================
// OfflineSymptomChecker.jsx
// Works fully offline using locally bundled symptom rules.
// Falls back to the server API when online for richer analysis.
// ============================================================

import { useState, useEffect } from "react";

// ─── Bundled offline symptom rules ────────────────────────
// Mirror of the server-side rules — embedded so no network is needed
const OFFLINE_RULES = [
  { triggers: ["fever", "cough"], condition: "Possible Flu", urgency: "medium", advice: "Rest, stay hydrated. Consult a doctor if symptoms worsen after 3 days." },
  { triggers: ["fever", "cough", "breathing difficulty"], condition: "Possible Pneumonia / COVID-19", urgency: "high", advice: "Breathing difficulty with fever is serious. Seek medical attention immediately." },
  { triggers: ["cough", "cold", "sneezing"], condition: "Possible Common Cold", urgency: "low", advice: "Rest, warm fluids. Should resolve in 5–7 days." },
  { triggers: ["chest pain"], condition: "Possible Cardiac Issue", urgency: "high", advice: "Call emergency services or go to the nearest hospital immediately." },
  { triggers: ["headache", "nausea"], condition: "Possible Migraine", urgency: "medium", advice: "Rest in a quiet, dark room. Consult a doctor if recurring." },
  { triggers: ["severe headache", "stiff neck", "fever"], condition: "Possible Meningitis", urgency: "high", advice: "This is a medical emergency. Seek immediate care." },
  { triggers: ["stomach pain", "vomiting"], condition: "Possible Food Poisoning", urgency: "medium", advice: "Stay hydrated with ORS. Consult a doctor if vomiting persists." },
  { triggers: ["stomach pain", "vomiting", "diarrhea"], condition: "Possible Gastroenteritis", urgency: "medium", advice: "High risk of dehydration. Drink ORS frequently. Seek care if lasting 48+ hours." },
  { triggers: ["burning urination", "frequent urination"], condition: "Possible UTI", urgency: "medium", advice: "Drink plenty of water. Consult a doctor for antibiotics." },
  { triggers: ["fever", "body ache", "fatigue"], condition: "Possible Viral Fever / Dengue", urgency: "medium", advice: "Rest and hydrate. Get checked if fever lasts more than 3 days." },
  { triggers: ["high fever", "chills", "sweating"], condition: "Possible Malaria / Typhoid", urgency: "high", advice: "Cyclic fever with chills may indicate malaria. Get tested immediately." },
  { triggers: ["itching", "rash", "swelling"], condition: "Possible Allergic Reaction", urgency: "medium", advice: "Take antihistamine. If throat swells or breathing is affected, seek emergency care." },
  { triggers: ["dizziness", "loss of balance"], condition: "Possible Vertigo", urgency: "medium", advice: "Avoid sudden movements. Consult a doctor if recurring." },
  { triggers: ["excessive thirst", "frequent urination", "fatigue"], condition: "Possible Diabetes", urgency: "medium", advice: "Consult a doctor for blood sugar testing." },
  { triggers: ["sore throat", "difficulty swallowing"], condition: "Possible Tonsillitis", urgency: "medium", advice: "Gargle warm salt water. Consult doctor if lasting more than 3 days." },
  { triggers: ["back pain"], condition: "Possible Muscle Strain", urgency: "low", advice: "Rest, apply heat. Consult doctor if severe or radiates to legs." },
  { triggers: ["joint pain", "swelling", "stiffness"], condition: "Possible Arthritis", urgency: "low", advice: "Apply ice. Avoid high-purine foods. Consult a doctor." },
];

const URGENCY_PRIORITY = { low: 1, medium: 2, high: 3 };
const URGENCY_RECOMMENDATION = {
  low: "Mild condition – monitor symptoms",
  medium: "Consult a doctor",
  high: "Seek immediate medical attention",
};
const URGENCY_COLORS = {
  low: { bg: "#f0fff4", border: "#68d391", text: "#276749", badge: "#c6f6d5" },
  medium: { bg: "#fffbeb", border: "#f6ad55", text: "#744210", badge: "#feebc8" },
  high: { bg: "#fff5f5", border: "#fc8181", text: "#742a2a", badge: "#fed7d7" },
};

// Cache keys
const CACHE_HISTORY_KEY = "telehealth_symptom_history";
const CACHE_RULES_KEY = "telehealth_symptom_rules";

// ─── Offline analysis engine ──────────────────────────────
const analyzeOffline = (symptomsInput) => {
  const normalised = symptomsInput.map((s) => s.toLowerCase().trim());
  const matched = [];
  let highestUrgency = "low";
  let bestAdvice = "No specific condition identified. Please consult a doctor.";

  for (const rule of OFFLINE_RULES) {
    const allMatch = rule.triggers.every((trigger) =>
      normalised.some((s) => s.includes(trigger))
    );
    if (allMatch) {
      matched.push(rule.condition);
      if (URGENCY_PRIORITY[rule.urgency] > URGENCY_PRIORITY[highestUrgency]) {
        highestUrgency = rule.urgency;
        bestAdvice = rule.advice;
      }
    }
  }

  return {
    possibleConditions: matched.length > 0
      ? [...new Set(matched)]
      : ["Condition not identified from provided symptoms"],
    recommendation: URGENCY_RECOMMENDATION[highestUrgency],
    urgencyLevel: highestUrgency,
    adviceMessage: bestAdvice,
    source: "offline",
  };
};

// ─── Common symptom suggestions (for quick-add chips) ─────
const COMMON_SYMPTOMS = [
  "fever", "cough", "headache", "nausea", "fatigue",
  "diarrhea", "vomiting", "chest pain", "rash", "dizziness",
  "sore throat", "body ache", "cold", "sneezing", "back pain",
  "joint pain", "itching", "stomach pain", "breathing difficulty",
];

// ─── Styles ────────────────────────────────────────────────
const s = {
  page: { fontFamily: "'Georgia', serif", minHeight: "100vh", background: "#f7faf7", padding: "16px" },
  maxW: { maxWidth: "600px", margin: "0 auto" },
  heading: { fontSize: "20px", fontWeight: "bold", color: "#1a4731", margin: "0 0 4px 0" },
  subheading: { fontSize: "12px", color: "#6a8a7a", marginBottom: "16px" },
  offlinePill: (online) => ({
    display: "inline-flex", alignItems: "center", gap: "5px",
    background: online ? "#c6f6d5" : "#fed7d7",
    color: online ? "#276749" : "#742a2a",
    borderRadius: "12px", padding: "3px 10px", fontSize: "11px", marginBottom: "12px",
  }),
  dot: (online) => ({
    width: "6px", height: "6px", borderRadius: "50%",
    background: online ? "#38a169" : "#e53e3e",
  }),
  card: { background: "#fff", border: "1px solid #d4e8d4", borderRadius: "8px", padding: "14px", marginBottom: "12px" },
  label: { fontSize: "11px", fontWeight: "bold", color: "#4a7a5a", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" },
  inputRow: { display: "flex", gap: "8px" },
  input: {
    flex: 1, border: "1px solid #c8d8c8", borderRadius: "6px",
    padding: "8px 10px", fontSize: "13px", fontFamily: "'Georgia', serif",
    outline: "none", background: "#f8faf8",
  },
  addBtn: { background: "#276749", color: "#fff", border: "none", borderRadius: "6px", padding: "0 14px", fontSize: "13px", cursor: "pointer" },
  chips: { display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "8px" },
  chip: (active) => ({
    fontSize: "11px", padding: "3px 10px", borderRadius: "12px", cursor: "pointer",
    background: active ? "#276749" : "#e8f4e8",
    color: active ? "#fff" : "#2d5a3d",
    border: `1px solid ${active ? "#276749" : "#c8d8c8"}`,
    transition: "all 0.15s",
  }),
  analyzeBtn: (disabled) => ({
    width: "100%", background: disabled ? "#c8d8c8" : "#276749",
    color: "#fff", border: "none", borderRadius: "6px", padding: "11px",
    fontSize: "14px", cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "'Georgia', serif", marginTop: "4px",
  }),
  resultCard: (urgency) => ({
    background: URGENCY_COLORS[urgency].bg,
    border: `1px solid ${URGENCY_COLORS[urgency].border}`,
    borderRadius: "8px", padding: "14px", marginBottom: "12px",
  }),
  resultTitle: (urgency) => ({
    fontWeight: "bold", color: URGENCY_COLORS[urgency].text, fontSize: "15px", marginBottom: "4px",
  }),
  badge: (urgency) => ({
    display: "inline-block", background: URGENCY_COLORS[urgency].badge,
    color: URGENCY_COLORS[urgency].text, fontSize: "10px", padding: "2px 8px",
    borderRadius: "10px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.5px",
  }),
  conditionsList: { margin: "8px 0", paddingLeft: "16px", fontSize: "13px" },
  adviceBox: { marginTop: "8px", fontSize: "12px", lineHeight: "1.6", color: "#444" },
  sourcePill: (offline) => ({
    fontSize: "10px", display: "inline-block", marginTop: "6px",
    background: offline ? "#ebf4ff" : "#e8f4e8",
    color: offline ? "#2b6cb0" : "#276749",
    padding: "2px 8px", borderRadius: "10px",
  }),
  historyItem: {
    padding: "10px", borderBottom: "1px solid #e8f0e8", fontSize: "12px", color: "#4a5a4a",
  },
  historyDate: { color: "#8a9e8a", fontSize: "10px", marginBottom: "2px" },
};

// ============================================================
// Component
// ============================================================
const OfflineSymptomChecker = () => {
  const [inputValue, setInputValue] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // ── Connectivity ────────────────────────────────────────
  useEffect(() => {
    const up = () => setIsOnline(true);
    const down = () => setIsOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => { window.removeEventListener("online", up); window.removeEventListener("offline", down); };
  }, []);

  // ── Load history from localStorage ──────────────────────
  useEffect(() => {
    const cached = localStorage.getItem(CACHE_HISTORY_KEY);
    if (cached) {
      try { setHistory(JSON.parse(cached)); } catch { /* ignore */ }
    }
  }, []);

  const addSymptomFromInput = () => {
    const s = inputValue.trim().toLowerCase();
    if (s && !selectedSymptoms.includes(s)) {
      setSelectedSymptoms((prev) => [...prev, s]);
    }
    setInputValue("");
  };

  const toggleCommonSymptom = (symptom) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const removeSymptom = (symptom) => {
    setSelectedSymptoms((prev) => prev.filter((s) => s !== symptom));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); addSymptomFromInput(); }
  };

  // ─── Main analysis handler ────────────────────────────────
  const handleAnalyze = async () => {
    if (selectedSymptoms.length === 0) return;
    setIsLoading(true);
    setResult(null);

    let analysisResult;

    if (isOnline) {
      // Try server-side analysis for richer results
      try {
        const token = localStorage.getItem("telehealth_token");
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/symptoms/check`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ symptoms: selectedSymptoms }),
          }
        );
        if (res.ok) {
          const data = await res.json();
          analysisResult = { ...data.result, source: "online" };
        } else {
          // Server error — fall back to offline engine
          analysisResult = analyzeOffline(selectedSymptoms);
        }
      } catch {
        // Network error — fall back to offline engine
        analysisResult = analyzeOffline(selectedSymptoms);
      }
    } else {
      // No internet — use bundled rules
      analysisResult = analyzeOffline(selectedSymptoms);
    }

    setResult(analysisResult);

    // Save to local history (keep last 10)
    const entry = {
      symptoms: selectedSymptoms,
      recommendation: analysisResult.recommendation,
      urgencyLevel: analysisResult.urgencyLevel,
      date: new Date().toISOString(),
    };
    const updatedHistory = [entry, ...history].slice(0, 10);
    setHistory(updatedHistory);
    localStorage.setItem(CACHE_HISTORY_KEY, JSON.stringify(updatedHistory));

    setIsLoading(false);
  };

  const handleReset = () => {
    setSelectedSymptoms([]);
    setResult(null);
    setInputValue("");
  };

  return (
    <div style={s.page}>
      <div style={s.maxW}>
        <h1 style={s.heading}>🔍 Symptom Checker</h1>
        <p style={s.subheading}>Works without internet — results based on local medical rules</p>

        {/* Connectivity status */}
        <div style={s.offlinePill(isOnline)}>
          <span style={s.dot(isOnline)} />
          {isOnline ? "Online — using server analysis" : "Offline — using local rules"}
        </div>

        {/* Symptom input card */}
        <div style={s.card}>
          <p style={s.label}>Enter Your Symptoms</p>
          <div style={s.inputRow}>
            <input
              style={s.input}
              placeholder="Type a symptom (e.g. fever)…"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button style={s.addBtn} onClick={addSymptomFromInput}>Add</button>
          </div>

          {/* Selected symptom chips */}
          {selectedSymptoms.length > 0 && (
            <div style={{ ...s.chips, marginTop: "10px" }}>
              {selectedSymptoms.map((sym) => (
                <span
                  key={sym}
                  style={{ ...s.chip(true), paddingRight: "6px" }}
                  onClick={() => removeSymptom(sym)}
                >
                  {sym} ✕
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Common symptom quick-select */}
        <div style={s.card}>
          <p style={s.label}>Quick Select Common Symptoms</p>
          <div style={s.chips}>
            {COMMON_SYMPTOMS.map((sym) => (
              <span
                key={sym}
                style={s.chip(selectedSymptoms.includes(sym))}
                onClick={() => toggleCommonSymptom(sym)}
              >
                {sym}
              </span>
            ))}
          </div>
        </div>

        {/* Analyze button */}
        <button
          style={s.analyzeBtn(selectedSymptoms.length === 0 || isLoading)}
          onClick={handleAnalyze}
          disabled={selectedSymptoms.length === 0 || isLoading}
        >
          {isLoading ? "Analysing…" : `Analyse ${selectedSymptoms.length > 0 ? `(${selectedSymptoms.length} symptoms)` : ""}`}
        </button>

        {/* Result */}
        {result && (
          <div style={{ marginTop: "16px" }}>
            <div style={s.resultCard(result.urgencyLevel)}>
              <p style={s.resultTitle(result.urgencyLevel)}>
                {result.urgencyLevel === "high" ? "🚨" : result.urgencyLevel === "medium" ? "⚠️" : "ℹ️"} {result.recommendation}
              </p>
              <span style={s.badge(result.urgencyLevel)}>{result.urgencyLevel} urgency</span>

              <p style={{ fontSize: "12px", color: "#666", marginTop: "8px", marginBottom: "4px" }}>Possible Conditions:</p>
              <ul style={s.conditionsList}>
                {result.possibleConditions.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>

              <div style={s.adviceBox}>💡 {result.adviceMessage}</div>
              <span style={s.sourcePill(result.source === "offline")}>
                {result.source === "offline" ? "📵 Offline analysis" : "🌐 Server analysis"}
              </span>
            </div>

            <button
              style={{ ...s.analyzeBtn(false), background: "#4a7a5a", marginTop: "0" }}
              onClick={handleReset}
            >
              Check New Symptoms
            </button>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div style={{ ...s.card, marginTop: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={s.label}>Past Checks ({history.length})</p>
              <button
                style={{ background: "none", border: "none", fontSize: "12px", color: "#276749", cursor: "pointer" }}
                onClick={() => setShowHistory((v) => !v)}
              >
                {showHistory ? "Hide" : "Show"}
              </button>
            </div>
            {showHistory && history.map((h, i) => (
              <div key={i} style={s.historyItem}>
                <p style={s.historyDate}>{new Date(h.date).toLocaleString()}</p>
                <p><strong>Symptoms:</strong> {h.symptoms.join(", ")}</p>
                <p><strong>Result:</strong> {h.recommendation}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OfflineSymptomChecker;