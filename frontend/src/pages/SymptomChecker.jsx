// ============================================================
// pages/SymptomChecker.jsx — AI-powered symptom checker page
// Uses Google Gemini via backend API
// ============================================================

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { symptomsAPI } from "../services/api";

const FONT = `@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap');`;

const CSS = `
  .sc-page {
    min-height: calc(100vh - 65px);
    background: #f4f7f4;
    font-family: 'DM Sans', sans-serif;
    padding: 32px 24px 48px;
  }
  .sc-inner { max-width: 680px; margin: 0 auto; }

  .sc-back {
    background: none; border: none; color: #2d7a4f; font-size: 13px;
    font-family: 'DM Sans', sans-serif; cursor: pointer; padding: 0;
    margin-bottom: 14px; display: flex; align-items: center; gap: 4px;
  }
  .sc-back:hover { text-decoration: underline; }
  .sc-title {
    font-family: 'DM Serif Display', serif;
    font-size: 24px; color: #1a3a2a; margin: 0 0 4px;
  }
  .sc-subtitle { font-size: 13px; color: #7a9a8a; margin: 0 0 28px; }

  .sc-card {
    background: #fff; border: 1px solid #d8e8d8;
    border-radius: 12px; padding: 24px; margin-bottom: 16px;
  }
  .sc-section-label {
    font-size: 11px; font-weight: 600; letter-spacing: 1.2px;
    text-transform: uppercase; color: #7a9a8a; margin-bottom: 14px;
  }

  .sc-chips { display: flex; flex-wrap: wrap; gap: 8px; }
  .sc-chip {
    padding: 6px 14px; border-radius: 20px; font-size: 12px;
    cursor: pointer; transition: all 0.15s; border: 1px solid #ccdacc;
    background: #f4f7f4; color: #4a6a5a; font-family: 'DM Sans', sans-serif;
  }
  .sc-chip:hover { border-color: #2d7a4f; background: #e8f5ee; color: #1a4731; }
  .sc-chip.active { background: #2d7a4f; color: #fff; border-color: #2d7a4f; }

  .sc-input-row { display: flex; gap: 8px; margin-top: 14px; }
  .sc-input {
    flex: 1; border: 1px solid #ccdacc; border-radius: 7px;
    padding: 10px 12px; font-size: 14px; font-family: 'DM Sans', sans-serif;
    color: #1a3a2a; background: #f8faf8; outline: none;
  }
  .sc-input:focus { border-color: #2d7a4f; box-shadow: 0 0 0 3px rgba(45,122,79,0.1); }
  .sc-add-btn {
    background: #e8f5ee; color: #2d7a4f; border: 1px solid #b0d8bc;
    border-radius: 7px; padding: 10px 14px; font-size: 13px; font-weight: 500;
    cursor: pointer; font-family: 'DM Sans', sans-serif;
  }

  .sc-selected { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
  .sc-selected-tag {
    background: #e8f5ee; color: #1a5c35; border: 1px solid #b0d8bc;
    border-radius: 20px; padding: 4px 12px; font-size: 12px;
    display: flex; align-items: center; gap: 6px;
  }
  .sc-tag-remove {
    background: none; border: none; cursor: pointer;
    color: #5a8a6a; font-size: 13px; padding: 0; line-height: 1;
  }

  .sc-submit-btn {
    width: 100%; background: #2d7a4f; color: #fff; border: none;
    border-radius: 7px; padding: 13px; font-size: 15px; font-weight: 500;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
    transition: background 0.15s; margin-top: 4px;
  }
  .sc-submit-btn:hover:not(:disabled) { background: #1f5c39; }
  .sc-submit-btn:disabled { background: #a0bfaa; cursor: not-allowed; }

  /* Result card */
  .sc-result {
    border-radius: 12px; padding: 22px 24px; margin-top: 16px;
    animation: fadeUp 0.3s ease;
  }
  .sc-result-high   { background: #fff5f5; border: 1px solid #fca5a5; }
  .sc-result-medium { background: #fffbeb; border: 1px solid #fcd34d; }
  .sc-result-low    { background: #f0fff4; border: 1px solid #9ae6b4; }

  .sc-result-header { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 14px; }
  .sc-result-badge {
    padding: 4px 12px; border-radius: 20px; font-size: 11px;
    font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;
  }
  .sc-badge-high   { background: #fca5a5; color: #7f1d1d; }
  .sc-badge-medium { background: #fcd34d; color: #78350f; }
  .sc-badge-low    { background: #9ae6b4; color: #14532d; }

  .sc-recommendation {
    font-size: 16px; font-weight: 600; color: #1a2e1a; margin-bottom: 4px;
  }
  .sc-conditions-label { font-size: 12px; color: #7a9a8a; margin-bottom: 6px; }
  .sc-conditions { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
  .sc-condition {
    background: rgba(255,255,255,0.7); border: 1px solid rgba(0,0,0,0.1);
    border-radius: 6px; padding: 4px 10px; font-size: 12px; color: #2a3a2a;
  }
  .sc-advice {
    font-size: 13px; color: #4a5a4a; line-height: 1.6;
    background: rgba(255,255,255,0.5); border-radius: 8px;
    padding: 10px 12px;
  }
  .sc-disclaimer {
    font-size: 11px; color: #888; margin-top: 10px; font-style: italic;
  }
  .sc-consult-btn {
    margin-top: 14px; background: #2d7a4f; color: #fff; border: none;
    border-radius: 7px; padding: 10px 20px; font-size: 13px; font-weight: 500;
    font-family: 'DM Sans', sans-serif; cursor: pointer; display: block;
  }
  .sc-consult-btn:hover { background: #1f5c39; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

const COMMON_SYMPTOMS = [
  "fever", "cough", "headache", "nausea", "fatigue", "diarrhea",
  "vomiting", "chest pain", "rash", "dizziness", "sore throat",
  "body ache", "cold", "stomach pain", "breathing difficulty",
  "joint pain", "back pain", "sneezing", "itching",
];

// CSS class maps — keyed by lowercase urgency string
const urgencyClass = { high: "sc-result-high", medium: "sc-result-medium", low: "sc-result-low" };
const badgeClass   = { high: "sc-badge-high",   medium: "sc-badge-medium",  low: "sc-badge-low"  };
const urgencyIcon  = { high: "🚨",              medium: "⚠️",               low: "ℹ️"            };

const SymptomChecker = () => {
  const navigate = useNavigate();
  const [selected, setSelected]       = useState([]);
  const [customInput, setCustomInput] = useState("");
  const [result, setResult]           = useState(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");

  const toggleChip = (s) =>
    setSelected((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s]);

  const addCustom = () => {
    const val = customInput.trim().toLowerCase();
    if (val && !selected.includes(val)) setSelected((p) => [...p, val]);
    setCustomInput("");
  };

  const handleSubmit = async () => {
    if (selected.length === 0) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await symptomsAPI.check(selected);
      // Gemini AI returns: { conditions, urgency, advice, disclaimer, recommendation, urgencyLevel }
      setResult(res.data.result);
    } catch (err) {
      setError(err.response?.data?.message || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Normalise urgency to lowercase for CSS class lookups
  const urgencyKey = result?.urgency?.toLowerCase();

  return (
    <>
      <style>{FONT}{CSS}</style>
      <div className="sc-page">
        <div className="sc-inner">

          <button className="sc-back" onClick={() => navigate("/patient-dashboard")}>
            ← Back to Dashboard
          </button>
          <h1 className="sc-title">Symptom Checker</h1>
          <p className="sc-subtitle">
            Select or type your symptoms to receive AI-powered health guidance
          </p>

          {/* Quick-select chips */}
          <div className="sc-card">
            <p className="sc-section-label">Common Symptoms — tap to select</p>
            <div className="sc-chips">
              {COMMON_SYMPTOMS.map((s) => (
                <button
                  key={s}
                  className={`sc-chip${selected.includes(s) ? " active" : ""}`}
                  onClick={() => toggleChip(s)}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Custom symptom input */}
            <div className="sc-input-row">
              <input
                className="sc-input"
                placeholder="Type another symptom…"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustom())}
              />
              <button className="sc-add-btn" onClick={addCustom}>+ Add</button>
            </div>
          </div>

          {/* Selected symptoms list */}
          {selected.length > 0 && (
            <div className="sc-card">
              <p className="sc-section-label">Your symptoms ({selected.length})</p>
              <div className="sc-selected">
                {selected.map((s) => (
                  <span className="sc-selected-tag" key={s}>
                    {s}
                    <button className="sc-tag-remove" onClick={() => toggleChip(s)}>✕</button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div style={{
              background: "#fff5f5", border: "1px solid #fca5a5",
              borderRadius: "8px", padding: "11px 14px",
              fontSize: "13px", color: "#b91c1c", marginBottom: "12px",
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Analyse button */}
          <button
            className="sc-submit-btn"
            onClick={handleSubmit}
            disabled={selected.length === 0 || loading}
          >
            {loading
              ? "Analysing symptoms…"
              : `Analyse${selected.length > 0 ? ` (${selected.length} symptoms)` : ""}`}
          </button>

          {/* ── AI Result from Gemini ──────────────────────── */}
          {result && (
            <div className={`sc-result ${urgencyClass[urgencyKey]}`}>

              {/* Urgency header */}
              <div className="sc-result-header">
                <span style={{ fontSize: "24px" }}>{urgencyIcon[urgencyKey]}</span>
                <div>
                  <p className="sc-recommendation">{result.recommendation}</p>
                  <span className={`sc-result-badge ${badgeClass[urgencyKey]}`}>
                    {result.urgency} urgency
                  </span>
                </div>
              </div>

              {/* Possible conditions returned by Gemini */}
              <p className="sc-conditions-label">Possible conditions identified:</p>
              <div className="sc-conditions">
                {(result.conditions || []).map((c, i) => (
                  <span className="sc-condition" key={i}>{c}</span>
                ))}
              </div>

              {/* Health advice from Gemini */}
              <div className="sc-advice">💡 {result.advice}</div>

              {/* Medical disclaimer from Gemini */}
              {result.disclaimer && (
                <p className="sc-disclaimer">⚕️ {result.disclaimer}</p>
              )}

              {/* Show consultation CTA for medium and high urgency */}
              {result.urgency !== "Low" && (
                <button
                  className="sc-consult-btn"
                  onClick={() => navigate("/consultation-request")}
                >
                  Request a Doctor Consultation →
                </button>
              )}

            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default SymptomChecker;