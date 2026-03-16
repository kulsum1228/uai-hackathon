// ============================================================
// pages/DoctorDashboard.jsx — Doctor's main dashboard
// Shows pending consultations and active/completed history
// ============================================================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { consultationAPI } from "../services/api";
import ConsultationCard from "../components/ConsultationCard";

const FONT = `@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap');`;

const CSS = `
  .dd-page {
    min-height: calc(100vh - 58px);
    background: #f0f4f9;
    font-family: 'DM Sans', sans-serif;
    padding: 32px 24px 48px;
  }
  .dd-inner { max-width: 900px; margin: 0 auto; }

  .dd-greeting {
    font-family: 'DM Serif Display', serif;
    font-size: 26px; color: #0f2a4a; margin: 0 0 4px;
  }
  .dd-subtitle { font-size: 13px; color: #6a7a8a; margin: 0 0 28px; }

  /* Stats */
  .dd-stats {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 12px; margin-bottom: 32px;
  }
  .dd-stat {
    background: #fff; border: 1px solid #d0dce8;
    border-radius: 10px; padding: 16px 18px;
    display: flex; align-items: center; gap: 12px;
  }
  .dd-stat-icon {
    width: 40px; height: 40px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; flex-shrink: 0;
  }
  .dd-stat-label { font-size: 11px; color: #6a7a8a; margin-bottom: 2px; }
  .dd-stat-value { font-size: 18px; font-weight: 700; color: #0f2a4a; }

  /* Section */
  .dd-section-label {
    font-size: 11px; font-weight: 600; letter-spacing: 1.5px;
    text-transform: uppercase; color: #6a7a8a; margin: 0 0 14px;
    display: flex; align-items: center; gap: 8px;
  }
  .dd-badge {
    background: #1a5276; color: #fff; border-radius: 10px;
    padding: 1px 8px; font-size: 10px; font-weight: 700;
  }
  .dd-badge-green {
    background: #1a6e3c; color: #fff; border-radius: 10px;
    padding: 1px 8px; font-size: 10px; font-weight: 700;
  }

  /* Empty state */
  .dd-empty {
    background: #fff; border: 1px dashed #c0d0e0; border-radius: 12px;
    padding: 40px 24px; text-align: center; color: #6a7a8a;
    margin-bottom: 24px;
  }
  .dd-empty-icon { font-size: 32px; margin-bottom: 10px; }
  .dd-empty-title { font-size: 14px; font-weight: 500; color: #3a5a7a; margin-bottom: 4px; }
  .dd-empty-desc { font-size: 12px; }

  /* Loading */
  .dd-loading { text-align: center; padding: 40px; color: #6a7a8a; font-size: 14px; }

  /* Error */
  .dd-error {
    background: #fff5f5; border: 1px solid #fca5a5; border-radius: 8px;
    padding: 12px 16px; font-size: 13px; color: #b91c1c; margin-bottom: 16px;
  }

  .dd-grid { display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; }

  @media (max-width: 600px) {
    .dd-stats { grid-template-columns: 1fr; }
  }
`;

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("telehealth_user") || "{}");

  const [pending, setPending]     = useState([]);
  const [active, setActive]       = useState([]);
  const [completed, setCompleted] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  // ── Fetch all consultations for this doctor ──────────────
  const fetchConsultations = async () => {
  try {
    setLoading(true);

    // Fetch pending (unassigned) consultations
    const pendingRes = await consultationAPI.getPending();
    setPending(pendingRes.data.consultations || []);

    // Fetch doctor's own consultations separately — don't show error if empty
    try {
      const myRes = await consultationAPI.getByDoctor(user._id);
      const all   = myRes.data.consultations || [];
      setActive(all.filter((c) => c.status === "accepted"));
      setCompleted(all.filter((c) => c.status === "completed"));
    } catch {
      // Doctor has no consultations yet — this is fine
      setActive([]);
      setCompleted([]);
    }

  } catch (err) {
    setError("Failed to load pending requests. Please refresh.");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => { fetchConsultations(); }, []);

  // ── Accept a consultation ────────────────────────────────
  const handleAccept = async (consultationId) => {
    try {
      await consultationAPI.accept(consultationId);
      // Move from pending to active locally for instant feedback
      const accepted = pending.find((c) => c._id === consultationId);
      if (accepted) {
        setPending((p) => p.filter((c) => c._id !== consultationId));
        setActive((p) => [...p, { ...accepted, status: "accepted", doctorId: user }]);
      }
      // Navigate to consultation room
      navigate(`/consultation/${consultationId}`);
    } catch {
      setError("Failed to accept consultation. Please try again.");
    }
  };

  // ── Reject / ignore a consultation ──────────────────────
  const handleReject = (consultationId) => {
    setPending((p) => p.filter((c) => c._id !== consultationId));
  };

  const stats = [
    { icon: "⏳", bg: "#e8f0fb", label: "Pending Requests", value: pending.length },
    { icon: "💬", bg: "#e8f5ee", label: "Active Consultations", value: active.length },
    { icon: "✅", bg: "#f0f8e8", label: "Completed Today", value: completed.length },
  ];

  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";

  return (
    <>
      <style>{FONT}{CSS}</style>
      <div className="dd-page">
        <div className="dd-inner">

          <h1 className="dd-greeting">{greeting}, Dr. {user.name?.split(" ").slice(-1)[0] || "Doctor"} 👨‍⚕️</h1>
          <p className="dd-subtitle">
            {now.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>

          {/* Stats */}
          <div className="dd-stats">
            {stats.map((s) => (
              <div className="dd-stat" key={s.label}>
                <div className="dd-stat-icon" style={{ background: s.bg }}>{s.icon}</div>
                <div>
                  <p className="dd-stat-label">{s.label}</p>
                  <p className="dd-stat-value">{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {error && <div className="dd-error">⚠️ {error}</div>}

          {loading ? (
            <div className="dd-loading">Loading consultations…</div>
          ) : (
            <>
              {/* Pending requests */}
              <p className="dd-section-label">
                Pending Requests
                {pending.length > 0 && <span className="dd-badge">{pending.length}</span>}
              </p>
              {pending.length === 0 ? (
                <div className="dd-empty">
                  <div className="dd-empty-icon">📭</div>
                  <p className="dd-empty-title">No pending requests</p>
                  <p className="dd-empty-desc">New consultation requests from patients will appear here.</p>
                </div>
              ) : (
                <div className="dd-grid">
                  {pending.map((c) => (
                    <ConsultationCard
                      key={c._id}
                      consultation={c}
                      onAccept={() => handleAccept(c._id)}
                      onReject={() => handleReject(c._id)}
                      showActions
                    />
                  ))}
                </div>
              )}

              {/* Active consultations */}
              {active.length > 0 && (
                <>
                  <p className="dd-section-label">
                    Active Consultations
                    <span className="dd-badge-green">{active.length}</span>
                  </p>
                  <div className="dd-grid">
                    {active.map((c) => (
                      <ConsultationCard
                        key={c._id}
                        consultation={c}
                        onOpen={() => navigate(`/consultation/${c._id}`)}
                        showActions={false}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Completed */}
              {completed.length > 0 && (
                <>
                  <p className="dd-section-label">Completed</p>
                  <div className="dd-grid">
                    {completed.map((c) => (
                      <ConsultationCard
                        key={c._id}
                        consultation={c}
                        showActions={false}
                        muted
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}

        </div>
      </div>
    </>
  );
};

export default DoctorDashboard;