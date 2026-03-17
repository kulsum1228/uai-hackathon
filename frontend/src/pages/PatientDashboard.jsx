// ============================================================
// pages/PatientDashboard.jsx — Patient home dashboard
// ============================================================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { consultationAPI } from "../services/api";

const FONT = `@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap');`;

const CSS = `
  .pd-page {
    min-height: calc(100vh - 58px);
    background: #f4f7f4;
    font-family: 'DM Sans', sans-serif;
    padding: 32px 24px 48px;
  }
  .pd-inner { max-width: 860px; margin: 0 auto; }

  .pd-greeting {
    font-family: 'DM Serif Display', serif;
    font-size: 28px; color: #1a3a2a; margin: 0 0 4px;
  }
  .pd-date { font-size: 13px; color: #7a9a8a; margin: 0 0 32px; }

  .pd-stats {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 12px; margin-bottom: 32px;
  }
  .pd-stat {
    background: #fff; border: 1px solid #d8e8d8;
    border-radius: 10px; padding: 16px 18px;
    display: flex; align-items: center; gap: 12px;
  }
  .pd-stat-icon {
    width: 40px; height: 40px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; flex-shrink: 0;
  }
  .pd-stat-label { font-size: 11px; color: #7a9a8a; margin-bottom: 2px; }
  .pd-stat-value { font-size: 15px; font-weight: 600; color: #1a3a2a; }

  .pd-section-title {
    font-size: 11px; font-weight: 600; letter-spacing: 1.5px;
    text-transform: uppercase; color: #7a9a8a; margin: 0 0 14px;
  }

  /* Active consultation alert */
  .pd-active-consult {
    background: #fff;
    border: 2px solid #2d7a4f;
    border-radius: 12px;
    padding: 18px 20px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    animation: pulse-border 2s ease-in-out infinite;
  }
  @keyframes pulse-border {
    0%, 100% { border-color: #2d7a4f; box-shadow: 0 0 0 0 rgba(45,122,79,0.2); }
    50%       { border-color: #3a9462; box-shadow: 0 0 0 6px rgba(45,122,79,0); }
  }
  .pd-active-left { display: flex; align-items: center; gap: 12px; }
  .pd-active-dot {
    width: 10px; height: 10px; border-radius: 50%;
    background: #22c55e; flex-shrink: 0;
    animation: blink 1.5s ease-in-out infinite;
  }
  @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
  .pd-active-title { font-size: 14px; font-weight: 600; color: #1a3a2a; }
  .pd-active-sub   { font-size: 12px; color: #7a9a8a; margin-top: 2px; }
  .pd-join-btn {
    background: #2d7a4f; color: #fff; border: none;
    border-radius: 8px; padding: 10px 24px;
    font-size: 14px; font-weight: 600;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
    transition: all 0.2s; white-space: nowrap;
  }
  .pd-join-btn:hover {
    background: #1f5c39; transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(45,122,79,0.3);
  }

  /* Nav cards */
  .pd-grid {
    display: grid; grid-template-columns: repeat(2, 1fr);
    gap: 14px; margin-bottom: 16px;
  }
  .pd-card {
    background: #fff; border: 1px solid #d8e8d8; border-radius: 12px;
    padding: 22px 20px; cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
    display: flex; align-items: flex-start; gap: 14px;
  }
  .pd-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,60,30,0.09);
    border-color: #b0d0b8;
  }
  .pd-card-icon {
    width: 44px; height: 44px; border-radius: 11px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; flex-shrink: 0;
  }
  .pd-card-title { font-size: 14px; font-weight: 600; color: #1a3a2a; margin-bottom: 4px; }
  .pd-card-desc  { font-size: 12px; color: #7a9a8a; line-height: 1.5; }
  .pd-card-arrow { margin-left: auto; font-size: 18px; color: #b0c8b8; align-self: center; flex-shrink: 0; }

  .pd-emergency {
    background: linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%);
    border: none; border-radius: 12px; padding: 20px 24px;
    cursor: pointer; display: flex; align-items: center; gap: 16px;
    transition: opacity 0.15s, transform 0.15s; width: 100%; text-align: left;
  }
  .pd-emergency:hover { opacity: 0.93; transform: translateY(-1px); }
  .pd-emergency-icon { font-size: 28px; }
  .pd-emergency-title { font-size: 15px; font-weight: 600; color: #fff; margin-bottom: 2px; }
  .pd-emergency-desc  { font-size: 12px; color: rgba(255,255,255,0.75); }
  .pd-emergency-arrow { margin-left: auto; color: rgba(255,255,255,0.5); font-size: 20px; }

  @media (max-width: 600px) {
    .pd-grid  { grid-template-columns: 1fr; }
    .pd-stats { grid-template-columns: 1fr; }
    .pd-greeting { font-size: 22px; }
    .pd-active-consult { flex-direction: column; align-items: flex-start; }
    .pd-join-btn { width: 100%; text-align: center; }
  }
`;

const PatientDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("telehealth_user") || "{}");

  const [activeConsultations, setActiveConsultations] = useState([]);

  // ── Fetch active (accepted) consultations on mount ──────
  // useEffect(() => {
  //   const fetchConsultations = async () => {
  //     try {
  //       const res = await consultationAPI.getByPatient(user._id);
  //       const all = res.data.consultations || [];
  //       // Show only accepted consultations — these are ready to join
  //       setActiveConsultations(all.filter((c) => c.status === "accepted"));
  //     } catch {
  //       // Silent fail — dashboard still works without this
  //     }
  //   };
  //   if (user._id) fetchConsultations();
  // }, []);

  useEffect(() => {
  const fetchConsultations = async () => {
    try {
      const res = await consultationAPI.getByPatient(user._id);
      const all = res.data.consultations || [];
      setActiveConsultations(
        all.filter((c) => c.status === "accepted")
      );
    } catch (err) {
      console.log("Error fetching consultations");
    }
  };

  if (user._id) {
    fetchConsultations();

    // ⏱️ Poll every 5 seconds
    const interval = setInterval(fetchConsultations, 5000);

    // 🧹 Cleanup
    return () => clearInterval(interval);
  }
}, [user._id]);
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const stats = [
    { icon: "🩺", bg: "#e8f5ee", label: "Role",     value: "Patient" },
    { icon: "📍", bg: "#e8f0ff", label: "Location", value: user.village || "Not set" },
    { icon: "📞", bg: "#fff5e8", label: "Phone",    value: user.phone   || "Not set" },
  ];

  const cards = [
    { icon: "📋", bg: "#e8f5ee", title: "My Health Record",  desc: "View and update your medical profile, allergies, and history",    path: "/health-record" },
    { icon: "🔍", bg: "#e8f0ff", title: "Symptom Checker",   desc: "Describe symptoms and get instant AI-powered health guidance",    path: "/symptom-checker" },
    { icon: "💬", bg: "#fff0f8", title: "Consult a Doctor",  desc: "Request a text, audio, or video consultation",                    path: "/consultation-request" },
    { icon: "💊", bg: "#fff8e8", title: "Find Medicines",    desc: "Search pharmacy stock near you by medicine name",                  path: "/medicine-search" },
  ];

  return (
    <>
      <style>{FONT}{CSS}</style>
      <div className="pd-page">
        <div className="pd-inner">

          <h1 className="pd-greeting">{greeting}, {user.name?.split(" ")[0] || "there"} 👋</h1>
          <p className="pd-date">{dateStr}</p>

          {/* Stats */}
          <div className="pd-stats">
            {stats.map((s) => (
              <div className="pd-stat" key={s.label}>
                <div className="pd-stat-icon" style={{ background: s.bg }}>{s.icon}</div>
                <div>
                  <p className="pd-stat-label">{s.label}</p>
                  <p className="pd-stat-value">{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Active consultation alert — shown when doctor accepted ── */}
          {activeConsultations.map((c) => (
            <div className="pd-active-consult" key={c._id}>
              <div className="pd-active-left">
                <span className="pd-active-dot" />
                <div>
                  <p className="pd-active-title">
                    Dr. {c.doctorId?.name || "Your Doctor"} is ready
                  </p>
                  <p className="pd-active-sub">
                    {c.consultationType === "video" ? "🎥 Video" :
                     c.consultationType === "audio" ? "📞 Audio" : "💬 Text"} consultation accepted — join now
                  </p>
                </div>
              </div>
              <button
                className="pd-join-btn"
                onClick={() => navigate(`/consultation/${c._id}`)}
              >
                Join Consultation →
              </button>
            </div>
          ))}

          {/* Nav cards */}
          <p className="pd-section-title">Quick Actions</p>
          <div className="pd-grid">
            {cards.map((c) => (
              <div className="pd-card" key={c.title} onClick={() => navigate(c.path)}>
                <div className="pd-card-icon" style={{ background: c.bg }}>{c.icon}</div>
                <div>
                  <p className="pd-card-title">{c.title}</p>
                  <p className="pd-card-desc">{c.desc}</p>
                </div>
                <span className="pd-card-arrow">›</span>
              </div>
            ))}
          </div>

          {/* Emergency */}
          <button className="pd-emergency" onClick={() => navigate("/emergency")}>
            <span className="pd-emergency-icon">🆘</span>
            <div>
              <p className="pd-emergency-title">Emergency Help</p>
              <p className="pd-emergency-desc">First aid instructions, emergency numbers — works offline</p>
            </div>
            <span className="pd-emergency-arrow">›</span>
          </button>

        </div>
      </div>
    </>
  );
};

export default PatientDashboard;