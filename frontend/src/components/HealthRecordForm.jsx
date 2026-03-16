// ============================================================
// components/HealthRecordForm.jsx — View and update health record
// ============================================================

import { useState, useEffect } from "react";
import { recordsAPI } from "../services/api";

const FONT = `@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap');`;

const CSS = `
  .hrf-page {
    min-height: calc(100vh - 65px);
    background: #f4f7f4;
    font-family: 'DM Sans', sans-serif;
    padding: 32px 24px 48px;
  }
  .hrf-inner { max-width: 680px; margin: 0 auto; }

  .hrf-header { margin-bottom: 28px; }
  .hrf-back {
    background: none; border: none; color: #2d7a4f; font-size: 13px;
    font-family: 'DM Sans', sans-serif; cursor: pointer; padding: 0;
    margin-bottom: 14px; display: flex; align-items: center; gap: 4px;
  }
  .hrf-back:hover { text-decoration: underline; }
  .hrf-title {
    font-family: 'DM Serif Display', serif;
    font-size: 24px; color: #1a3a2a; margin: 0 0 4px;
  }
  .hrf-subtitle { font-size: 13px; color: #7a9a8a; margin: 0; }

  .hrf-card {
    background: #fff; border: 1px solid #d8e8d8;
    border-radius: 12px; padding: 28px; margin-bottom: 16px;
  }
  .hrf-section-label {
    font-size: 11px; font-weight: 600; letter-spacing: 1.2px;
    text-transform: uppercase; color: #7a9a8a; margin-bottom: 18px;
    padding-bottom: 10px; border-bottom: 1px solid #e8f0e8;
  }
  .hrf-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
  }
  .hrf-grid-full { grid-column: 1 / -1; }

  .hrf-field { display: flex; flex-direction: column; gap: 5px; }
  .hrf-label { font-size: 12px; font-weight: 500; color: #4a6a5a; letter-spacing: 0.3px; }
  .hrf-input {
    border: 1px solid #ccdacc; border-radius: 7px; padding: 10px 12px;
    font-size: 14px; font-family: 'DM Sans', sans-serif; color: #1a3a2a;
    background: #f8faf8; outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .hrf-input:focus {
    border-color: #2d7a4f;
    box-shadow: 0 0 0 3px rgba(45,122,79,0.1);
    background: #fff;
  }
  .hrf-select {
    border: 1px solid #ccdacc; border-radius: 7px; padding: 10px 12px;
    font-size: 14px; font-family: 'DM Sans', sans-serif; color: #1a3a2a;
    background: #f8faf8; outline: none; cursor: pointer;
    transition: border-color 0.15s;
  }
  .hrf-select:focus { border-color: #2d7a4f; box-shadow: 0 0 0 3px rgba(45,122,79,0.1); }
  .hrf-textarea {
    border: 1px solid #ccdacc; border-radius: 7px; padding: 10px 12px;
    font-size: 14px; font-family: 'DM Sans', sans-serif; color: #1a3a2a;
    background: #f8faf8; outline: none; resize: vertical; min-height: 90px;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .hrf-textarea:focus {
    border-color: #2d7a4f;
    box-shadow: 0 0 0 3px rgba(45,122,79,0.1);
    background: #fff;
  }

  .hrf-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
  .hrf-tag {
    background: #e8f5ee; color: #1a5c35; border: 1px solid #b0d8bc;
    border-radius: 20px; padding: 3px 10px; font-size: 12px;
    display: flex; align-items: center; gap: 5px;
  }
  .hrf-tag-remove {
    background: none; border: none; cursor: pointer;
    color: #5a8a6a; font-size: 13px; padding: 0; line-height: 1;
  }
  .hrf-tag-input-row { display: flex; gap: 8px; margin-top: 6px; }
  .hrf-tag-input {
    flex: 1; border: 1px solid #ccdacc; border-radius: 7px;
    padding: 8px 10px; font-size: 13px; font-family: 'DM Sans', sans-serif;
    background: #f8faf8; outline: none;
  }
  .hrf-tag-input:focus { border-color: #2d7a4f; }
  .hrf-tag-add-btn {
    background: #e8f5ee; color: #2d7a4f; border: 1px solid #b0d8bc;
    border-radius: 7px; padding: 8px 12px; font-size: 13px;
    cursor: pointer; font-family: 'DM Sans', sans-serif; font-weight: 500;
  }

  .hrf-actions { display: flex; gap: 10px; margin-top: 8px; }
  .hrf-save-btn {
    background: #2d7a4f; color: #fff; border: none; border-radius: 7px;
    padding: 11px 28px; font-size: 14px; font-weight: 500;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
    transition: background 0.15s;
  }
  .hrf-save-btn:hover:not(:disabled) { background: #1f5c39; }
  .hrf-save-btn:disabled { background: #a0bfaa; cursor: not-allowed; }

  .hrf-alert {
    border-radius: 8px; padding: 11px 14px; font-size: 13px;
    margin-bottom: 16px; display: flex; align-items: center; gap: 8px;
  }
  .hrf-alert-success { background: #f0fff4; border: 1px solid #9ae6b4; color: #276749; }
  .hrf-alert-error { background: #fff5f5; border: 1px solid #fca5a5; color: #b91c1c; }

  .hrf-loading {
    text-align: center; color: #7a9a8a; padding: 40px;
    font-size: 14px;
  }

  @media (max-width: 600px) {
    .hrf-grid { grid-template-columns: 1fr; }
  }
`;

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "unknown"];

const HealthRecordForm = ({ onBack }) => {
  const user = JSON.parse(localStorage.getItem("telehealth_user") || "{}");

  const [form, setForm] = useState({
    age: "", gender: "", bloodGroup: "unknown",
    height: "", weight: "", medicalHistory: "",
  });
  const [allergies, setAllergies] = useState([]);
  const [chronicDiseases, setChronicDiseases] = useState([]);
  const [currentMedications, setCurrentMedications] = useState([]);

  const [allergyInput, setAllergyInput] = useState("");
  const [diseaseInput, setDiseaseInput] = useState("");
  const [medInput, setMedInput] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const [recordId, setRecordId] = useState(null);

  // ── Fetch existing record on mount ──────────────────────
  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const res = await recordsAPI.getByPatient(user._id);
        const r = res.data.record;
        if (r) {
          setRecordId(r._id);
          setForm({
            age: r.age || "",
            gender: r.gender || "",
            bloodGroup: r.bloodGroup || "unknown",
            height: r.height || "",
            weight: r.weight || "",
            medicalHistory: r.medicalHistory || "",
          });
          setAllergies(r.allergies || []);
          setChronicDiseases(r.chronicDiseases || []);
          setCurrentMedications(r.currentMedications || []);
        }
      } catch {
        // No record yet — form stays empty for creation
      } finally {
        setLoading(false);
      }
    };
    fetchRecord();
  }, []);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const addTag = (list, setList, input, setInput) => {
    const val = input.trim();
    if (val && !list.includes(val)) setList((p) => [...p, val]);
    setInput("");
  };

  const removeTag = (list, setList, item) =>
    setList((p) => p.filter((x) => x !== item));

  // ── Save (create or update) ──────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    setAlert(null);
    const payload = { ...form, allergies, chronicDiseases, currentMedications };

    try {
      if (recordId) {
        await recordsAPI.update(recordId, payload);
      } else {
        const res = await recordsAPI.create(payload);
        setRecordId(res.data.record._id);
      }
      setAlert({ type: "success", msg: "Health record saved successfully ✓" });
    } catch (err) {
      setAlert({ type: "error", msg: err.response?.data?.message || "Failed to save record." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <>
      <style>{FONT}{CSS}</style>
      <div className="hrf-page"><div className="hrf-loading">Loading your health record…</div></div>
    </>
  );

  const TagInput = ({ list, setList, input, setInput, placeholder }) => (
    <>
      <div className="hrf-tags">
        {list.map((item) => (
          <span className="hrf-tag" key={item}>
            {item}
            <button className="hrf-tag-remove" onClick={() => removeTag(list, setList, item)}>✕</button>
          </span>
        ))}
      </div>
      <div className="hrf-tag-input-row">
        <input
          className="hrf-tag-input"
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag(list, setList, input, setInput))}
        />
        <button className="hrf-tag-add-btn" onClick={() => addTag(list, setList, input, setInput)}>
          + Add
        </button>
      </div>
    </>
  );

  return (
    <>
      <style>{FONT}{CSS}</style>
      <div className="hrf-page">
        <div className="hrf-inner">

          <div className="hrf-header">
            <button className="hrf-back" onClick={onBack}>← Back to Dashboard</button>
            <h1 className="hrf-title">My Health Record</h1>
            <p className="hrf-subtitle">
              {recordId ? "Update your medical information" : "Create your health profile"}
            </p>
          </div>

          {alert && (
            <div className={`hrf-alert hrf-alert-${alert.type}`}>
              {alert.type === "success" ? "✓" : "⚠️"} {alert.msg}
            </div>
          )}

          {/* Basic Info */}
          <div className="hrf-card">
            <p className="hrf-section-label">Basic Information</p>
            <div className="hrf-grid">
              <div className="hrf-field">
                <label className="hrf-label">Age</label>
                <input className="hrf-input" type="number" name="age" value={form.age} onChange={handleChange} placeholder="e.g. 28" min="0" max="120" />
              </div>
              <div className="hrf-field">
                <label className="hrf-label">Gender</label>
                <select className="hrf-select" name="gender" value={form.gender} onChange={handleChange}>
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
              <div className="hrf-field">
                <label className="hrf-label">Blood Group</label>
                <select className="hrf-select" name="bloodGroup" value={form.bloodGroup} onChange={handleChange}>
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
              <div className="hrf-field">
                <label className="hrf-label">Height (cm)</label>
                <input className="hrf-input" type="number" name="height" value={form.height} onChange={handleChange} placeholder="e.g. 165" />
              </div>
              <div className="hrf-field">
                <label className="hrf-label">Weight (kg)</label>
                <input className="hrf-input" type="number" name="weight" value={form.weight} onChange={handleChange} placeholder="e.g. 60" />
              </div>
            </div>
          </div>

          {/* Medical Details */}
          <div className="hrf-card">
            <p className="hrf-section-label">Medical Details</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

              <div className="hrf-field">
                <label className="hrf-label">Allergies</label>
                <TagInput list={allergies} setList={setAllergies} input={allergyInput} setInput={setAllergyInput} placeholder="Type allergy and press Enter" />
              </div>

              <div className="hrf-field">
                <label className="hrf-label">Chronic Diseases</label>
                <TagInput list={chronicDiseases} setList={setChronicDiseases} input={diseaseInput} setInput={setDiseaseInput} placeholder="e.g. Diabetes, Asthma" />
              </div>

              <div className="hrf-field">
                <label className="hrf-label">Current Medications</label>
                <TagInput list={currentMedications} setList={setCurrentMedications} input={medInput} setInput={setMedInput} placeholder="e.g. Metformin 500mg" />
              </div>

              <div className="hrf-field">
                <label className="hrf-label">Medical History</label>
                <textarea
                  className="hrf-textarea"
                  name="medicalHistory"
                  value={form.medicalHistory}
                  onChange={handleChange}
                  placeholder="Past surgeries, hospitalisations, family history, etc."
                />
              </div>
            </div>
          </div>

          <div className="hrf-actions">
            <button className="hrf-save-btn" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : recordId ? "Update Record" : "Create Record"}
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default HealthRecordForm;