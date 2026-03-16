// ============================================================
// pages/ConsultationRoom.jsx — Updated with real WebRTC calls
// ============================================================

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { consultationAPI, recordsAPI } from "../services/api";
import PatientInfo from "../components/PatientInfo";
import ChatBox     from "../components/ChatBox";
import VideoCall   from "../components/VideoCall";

const FONT = `@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap');`;

const CSS = `
  .cr-page {
    min-height: calc(100vh - 58px);
    background: #f0f4f9;
    font-family: 'DM Sans', sans-serif;
    padding: 20px 16px 32px;
  }
  .cr-inner { max-width: 1100px; margin: 0 auto; }

  .cr-topbar {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 20px; flex-wrap: wrap; gap: 10px;
  }
  .cr-back {
    background: none; border: none; color: #1a5276; font-size: 13px;
    font-family: 'DM Sans', sans-serif; cursor: pointer; padding: 0;
    display: flex; align-items: center; gap: 4px;
  }
  .cr-back:hover { text-decoration: underline; }
  .cr-title-row { display: flex; align-items: center; gap: 10px; }
  .cr-title { font-family: 'DM Serif Display', serif; font-size: 20px; color: #0f2a4a; margin: 0; }
  .cr-status-badge { font-size: 11px; font-weight: 600; border-radius: 20px; padding: 3px 12px; }
  .cr-status-accepted  { background: #dcfce7; color: #15803d; }
  .cr-status-pending   { background: #fef9c3; color: #a16207; }
  .cr-status-completed { background: #e0e7ff; color: #3730a3; }

  .cr-actions { display: flex; gap: 8px; }
  .cr-btn-complete {
    background: #1a5276; color: #fff; border: none; border-radius: 7px;
    padding: 8px 16px; font-size: 13px; font-weight: 500;
    font-family: 'DM Sans', sans-serif; cursor: pointer; transition: background 0.15s;
  }
  .cr-btn-complete:hover { background: #134a70; }
  .cr-btn-prescribe {
    background: #e8f5ee; color: #1a5c39; border: 1px solid #b0d8bc;
    border-radius: 7px; padding: 8px 16px; font-size: 13px; font-weight: 500;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
  }

  .cr-layout {
    display: grid; grid-template-columns: 300px 1fr;
    gap: 16px; height: calc(100vh - 180px); min-height: 500px;
  }
  .cr-left  { display: flex; flex-direction: column; gap: 12px; overflow-y: auto; }
  .cr-right { display: flex; flex-direction: column; gap: 0; min-height: 0; }

  .cr-symptoms-card {
    background: #fff; border: 1px solid #d0dce8; border-radius: 12px; padding: 16px;
  }
  .cr-symptoms-label {
    font-size: 10px; font-weight: 600; letter-spacing: 1px;
    text-transform: uppercase; color: #6a7a8a; margin-bottom: 6px;
  }
  .cr-symptoms-text { font-size: 13px; color: #2a3a4a; line-height: 1.6; }

  /* Prescription modal */
  .cr-modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.4);
    display: flex; align-items: center; justify-content: center; z-index: 200; padding: 20px;
  }
  .cr-modal {
    background: #fff; border-radius: 12px; padding: 24px;
    width: 100%; max-width: 480px; animation: fadeUp 0.25s ease;
  }
  .cr-modal-title { font-family: 'DM Serif Display', serif; font-size: 18px; color: #0f2a4a; margin-bottom: 14px; }
  .cr-modal-textarea {
    width: 100%; border: 1px solid #c0d8e8; border-radius: 7px;
    padding: 10px 12px; font-size: 13px; font-family: 'DM Sans', sans-serif;
    color: #1a2a3a; background: #f4f7fa; outline: none;
    resize: vertical; min-height: 100px; box-sizing: border-box; margin-bottom: 14px;
  }
  .cr-modal-textarea:focus { border-color: #1a5276; box-shadow: 0 0 0 3px rgba(26,82,118,0.1); }
  .cr-modal-actions { display: flex; gap: 8px; justify-content: flex-end; }
  .cr-modal-cancel {
    background: none; border: 1px solid #d0dce8; border-radius: 7px;
    padding: 8px 16px; font-size: 13px; cursor: pointer;
    font-family: 'DM Sans', sans-serif; color: #4a6a8a;
  }
  .cr-modal-save {
    background: #1a5276; color: #fff; border: none; border-radius: 7px;
    padding: 8px 18px; font-size: 13px; font-weight: 500;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
  }

  .cr-loading { text-align: center; padding: 60px; color: #6a7a8a; font-size: 14px; }
  .cr-error {
    background: #fff5f5; border: 1px solid #fca5a5; border-radius: 8px;
    padding: 12px 16px; font-size: 13px; color: #b91c1c; margin-bottom: 14px;
  }

  @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @media (max-width: 768px) {
    .cr-layout { grid-template-columns: 1fr; height: auto; }
    .cr-left { max-height: 280px; }
  }
`;

const ConsultationRoom = () => {
  const { consultationId } = useParams();
  const navigate           = useNavigate();
  const user               = JSON.parse(localStorage.getItem("telehealth_user") || "{}");

  const [consultation, setConsultation]         = useState(null);
  const [healthRecord, setHealthRecord]         = useState(null);
  const [loading, setLoading]                   = useState(true);
  const [error, setError]                       = useState("");
  const [showPrescription, setShowPrescription] = useState(false);
  const [prescriptionText, setPrescriptionText] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await consultationAPI.getById(consultationId);
        const c   = res.data.consultation;
        setConsultation(c);

        const patientId = c.patientId?._id || c.patientId;
        if (patientId) {
          try {
            const hrRes = await recordsAPI.getByPatient(patientId);
            setHealthRecord(hrRes.data.record);
          } catch { /* no health record yet */ }
        }
      } catch {
        setError("Failed to load consultation.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [consultationId]);

  const handleComplete = async () => {
    try {
      await consultationAPI.complete(consultationId);
      setConsultation((p) => ({ ...p, status: "completed" }));
    } catch { setError("Failed to complete consultation."); }
  };

  const handleSavePrescription = async () => {
    if (!prescriptionText.trim()) return;
    try {
      await consultationAPI.addPrescription(consultationId, prescriptionText.trim());
      setConsultation((p) => ({ ...p, prescription: prescriptionText.trim() }));
      setShowPrescription(false);
    } catch { setError("Failed to save prescription."); }
  };

  if (loading) return (
    <><style>{FONT}{CSS}</style>
    <div className="cr-page"><div className="cr-loading">Loading consultation…</div></div></>
  );

  if (!consultation) return (
    <><style>{FONT}{CSS}</style>
    <div className="cr-page"><div className="cr-inner"><div className="cr-error">Consultation not found.</div></div></div></>
  );

  const { consultationType, status, symptoms, patientId } = consultation;
  const patient  = typeof patientId === "object" ? patientId : { name: "Patient" };
  const isDoctor = user.role === "doctor";

  // Determine the peer's name from the current user's perspective
  const peerName = isDoctor ? patient.name : (consultation.doctorId?.name || "Doctor");

  const statusCls = {
    accepted:  "cr-status-accepted",
    pending:   "cr-status-pending",
    completed: "cr-status-completed",
  }[status] || "cr-status-pending";

  return (
    <>
      <style>{FONT}{CSS}</style>
      <div className="cr-page">
        <div className="cr-inner">

          <div className="cr-topbar">
            <div>
              <button className="cr-back" onClick={() => navigate(isDoctor ? "/doctor-dashboard" : "/patient-dashboard")}>
                ← Back to Dashboard
              </button>
              <div className="cr-title-row" style={{ marginTop: "6px" }}>
                <h1 className="cr-title">Consultation with {peerName}</h1>
                <span className={`cr-status-badge ${statusCls}`}>{status}</span>
              </div>
            </div>
            {isDoctor && status === "accepted" && (
              <div className="cr-actions">
                <button className="cr-btn-prescribe" onClick={() => setShowPrescription(true)}>
                  + Add Prescription
                </button>
                <button className="cr-btn-complete" onClick={handleComplete}>
                  Mark Complete ✓
                </button>
              </div>
            )}
          </div>

          {error && <div className="cr-error">⚠️ {error}</div>}

          <div className="cr-layout">
            {/* Left: patient info */}
            <div className="cr-left">
              <PatientInfo patient={patient} healthRecord={healthRecord} loading={false} />
              <div className="cr-symptoms-card">
                <p className="cr-symptoms-label">Reported Symptoms</p>
                <p className="cr-symptoms-text">{symptoms || "Not described."}</p>
                {consultation.prescription && (
                  <>
                    <p className="cr-symptoms-label" style={{ marginTop: "12px" }}>Prescription</p>
                    <p className="cr-symptoms-text" style={{ color: "#1a5276" }}>💊 {consultation.prescription}</p>
                  </>
                )}
              </div>
            </div>

            {/* Right: chat / video / audio */}
            <div className="cr-right">
              {consultationType === "chat" && (
                <ChatBox
                  consultationId={consultationId}
                  currentUserId={user._id}
                  consultationStatus={status}
                />
              )}

              {(consultationType === "video" || consultationType === "audio") && (
                <VideoCall
                  consultationId={consultationId}
                  currentUser={user}
                  peerName={peerName}
                  callType={consultationType}
                  onCallEnd={() => navigate(isDoctor ? "/doctor-dashboard" : "/patient-dashboard")}
                />
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Prescription modal */}
      {showPrescription && (
        <div className="cr-modal-overlay" onClick={() => setShowPrescription(false)}>
          <div className="cr-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="cr-modal-title">Add Prescription</h2>
            <textarea
              className="cr-modal-textarea"
              placeholder="e.g. Paracetamol 500mg twice daily for 5 days."
              value={prescriptionText}
              onChange={(e) => setPrescriptionText(e.target.value)}
            />
            <div className="cr-modal-actions">
              <button className="cr-modal-cancel" onClick={() => setShowPrescription(false)}>Cancel</button>
              <button className="cr-modal-save" onClick={handleSavePrescription}>Save Prescription</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ConsultationRoom;