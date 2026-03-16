// ============================================================
// components/ConsultationRequest.jsx — Request a doctor consultation
// ============================================================

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { consultationAPI } from "../services/api";

const FONT = `@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap');`;

const CSS = `
  .cr-page {
    min-height: calc(100vh - 65px);
    background: #f4f7f4;
    font-family: 'DM Sans', sans-serif;
    padding: 32px 24px 48px;
  }
  .cr-inner { max-width: 600px; margin: 0 auto; }

  .cr-back {
    background: none; border: none; color: #2d7a4f; font-size: 13px;
    font-family: 'DM Sans', sans-serif; cursor: pointer; padding: 0;
    margin-bottom: 14px; display: flex; align-items: center; gap: 4px;
  }
  .cr-back:hover { text-decoration: underline; }
  .cr-title {
    font-family: 'DM Serif Display', serif;
    font-size: 24px; color: #1a3a2a; margin: 0 0 4px;
  }
  .cr-subtitle { font-size: 13px; color: #7a9a8a; margin: 0 0 28px; }

  .cr-card {
    background: #fff; border: 1px solid #d8e8d8;
    border-radius: 12px; padding: 26px; margin-bottom: 16px;
  }
  .cr-section-label {
    font-size: 11px; font-weight: 600; letter-spacing: 1.2px;
    text-transform: uppercase; color: #7a9a8a; margin-bottom: 16px;
  }
  .cr-label { font-size: 12px; font-weight: 500; color: #4a6a5a; margin-bottom: 6px; display: block; }
  .cr-textarea {
    width: 100%; border: 1px solid #ccdacc; border-radius: 7px;
    padding: 12px; font-size: 14px; font-family: 'DM Sans', sans-serif;
    color: #1a3a2a; background: #f8faf8; outline: none;
    resize: vertical; min-height: 110px; box-sizing: border-box;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .cr-textarea:focus {
    border-color: #2d7a4f;
    box-shadow: 0 0 0 3px rgba(45,122,79,0.1);
    background: #fff;
  }

  /* Consultation type selector */
  .cr-types { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .cr-type {
    border: 1.5px solid #ccdacc; border-radius: 10px;
    padding: 14px 10px; cursor: pointer; text-align: center;
    transition: all 0.15s; background: #f8faf8;
  }
  .cr-type:hover { border-color: #2d7a4f; background: #e8f5ee; }
  .cr-type.selected { border-color: #2d7a4f; background: #e8f5ee; }
  .cr-type-icon { font-size: 22px; margin-bottom: 6px; }
  .cr-type-label { font-size: 13px; font-weight: 500; color: #1a3a2a; margin-bottom: 2px; }
  .cr-type-desc { font-size: 11px; color: #7a9a8a; }
  .cr-type.selected .cr-type-label { color: #2d7a4f; }

  .cr-submit-btn {
    width: 100%; background: #2d7a4f; color: #fff; border: none;
    border-radius: 7px; padding: 13px; font-size: 15px; font-weight: 500;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
    transition: background 0.15s;
  }
  .cr-submit-btn:hover:not(:disabled) { background: #1f5c39; }
  .cr-submit-btn:disabled { background: #a0bfaa; cursor: not-allowed; }

  /* Success state */
  .cr-success {
    background: #f0fff4; border: 1px solid #9ae6b4;
    border-radius: 12px; padding: 32px 24px; text-align: center;
    animation: fadeUp 0.35s ease;
  }
  .cr-success-icon { font-size: 40px; margin-bottom: 12px; }
  .cr-success-title {
    font-family: 'DM Serif Display', serif;
    font-size: 20px; color: #1a4731; margin-bottom: 6px;
  }
  .cr-success-desc { font-size: 13px; color: #4a7a5a; line-height: 1.6; margin-bottom: 20px; }
  .cr-success-detail {
    background: #fff; border: 1px solid #d8e8d8; border-radius: 8px;
    padding: 14px; text-align: left; margin-bottom: 20px; font-size: 13px;
    color: #4a6a5a; line-height: 1.7;
  }
  .cr-dashboard-btn {
    background: #2d7a4f; color: #fff; border: none; border-radius: 7px;
    padding: 11px 24px; font-size: 14px; font-weight: 500;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
  }

  .cr-alert-error {
    background: #fff5f5; border: 1px solid #fca5a5; border-radius: 8px;
    padding: 11px 14px; font-size: 13px; color: #b91c1c;
    margin-bottom: 14px;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 500px) { .cr-types { grid-template-columns: 1fr; } }
`;

const TYPES = [
  { value: "chat", icon: "💬", label: "Text Chat", desc: "Low data, works on 2G" },
  { value: "audio", icon: "📞", label: "Audio Call", desc: "Voice consultation" },
  { value: "video", icon: "🎥", label: "Video Call", desc: "Face-to-face session" },
];

const ConsultationRequest = () => {
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState("");
  const [type, setType] = useState("chat");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  const handleSubmit = async () => {
    if (!symptoms.trim()) {
      setError("Please describe your symptoms before submitting.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await consultationAPI.request({
        symptoms: symptoms.trim(),
        consultationType: type,
      });
      setSuccess(res.data.consultation);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <>
      <style>{FONT}{CSS}</style>
      <div className="cr-page">
        <div className="cr-inner">
          <div className="cr-success">
            <div className="cr-success-icon">✅</div>
            <h2 className="cr-success-title">Consultation Requested!</h2>
            <p className="cr-success-desc">
              Your request has been submitted. A doctor will accept and connect with you shortly.
            </p>
            <div className="cr-success-detail">
              <strong>Type:</strong> {TYPES.find((t) => t.value === success.consultationType)?.label}<br />
              <strong>Status:</strong> Pending — waiting for a doctor<br />
              <strong>Symptoms:</strong> {success.symptoms}
            </div>
            <button className="cr-dashboard-btn" onClick={() => navigate("/patient-dashboard")}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{FONT}{CSS}</style>
      <div className="cr-page">
        <div className="cr-inner">

          <button className="cr-back" onClick={() => navigate("/patient-dashboard")}>
            ← Back to Dashboard
          </button>
          <h1 className="cr-title">Request a Consultation</h1>
          <p className="cr-subtitle">Connect with a doctor via text, audio, or video</p>

          {error && <div className="cr-alert-error">⚠️ {error}</div>}

          {/* Symptoms */}
          <div className="cr-card">
            <p className="cr-section-label">Describe Your Symptoms</p>
            <label className="cr-label">What are you experiencing?</label>
            <textarea
              className="cr-textarea"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g. I have had a fever of 101°F for 2 days along with a severe headache and body aches…"
            />
          </div>

          {/* Consultation type */}
          <div className="cr-card">
            <p className="cr-section-label">Consultation Type</p>
            <div className="cr-types">
              {TYPES.map((t) => (
                <div
                  key={t.value}
                  className={`cr-type${type === t.value ? " selected" : ""}`}
                  onClick={() => setType(t.value)}
                >
                  <div className="cr-type-icon">{t.icon}</div>
                  <p className="cr-type-label">{t.label}</p>
                  <p className="cr-type-desc">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            className="cr-submit-btn"
            onClick={handleSubmit}
            disabled={loading || !symptoms.trim()}
          >
            {loading ? "Submitting request…" : "Submit Consultation Request"}
          </button>

        </div>
      </div>
    </>
  );
};

export default ConsultationRequest;