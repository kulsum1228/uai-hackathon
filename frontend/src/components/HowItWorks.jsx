// ============================================================
// components/HowItWorks.jsx
// ============================================================

import { useNavigate } from "react-router-dom";

const STEPS = [
  {
    num: "01",
    icon: "👤",
    title: "Register & Sign In",
    desc: "Create your account as a patient, doctor, or pharmacy in under a minute. Your role determines your personalised dashboard and features.",
    detail: ["Choose your role", "Set up your profile", "Access your dashboard"],
  },
  {
    num: "02",
    icon: "🔍",
    title: "Check Symptoms or Consult",
    desc: "Patients can run an AI symptom check instantly, or submit a consultation request to connect with an available doctor via text, audio, or video.",
    detail: ["AI symptom analysis", "Request a doctor", "Choose chat / audio / video"],
  },
  {
    num: "03",
    icon: "✅",
    title: "Get Care & Find Medicines",
    desc: "Your doctor reviews your health record, provides consultation, and adds a prescription. Then find the nearest pharmacy that has your medicines in stock.",
    detail: ["Doctor consultation", "Prescription added", "Find medicine nearby"],
  },
];

const HowItWorks = () => {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        .hiw-section {
          background: #0a1a0f;
          padding: 96px 24px;
          position: relative;
          overflow: hidden;
        }
        .hiw-section::before {
          content: '';
          position: absolute; inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }
        .hiw-glow {
          position: absolute;
          width: 600px; height: 600px; border-radius: 50%;
          background: radial-gradient(circle, rgba(45,122,79,0.15) 0%, transparent 65%);
          top: 50%; left: 50%; transform: translate(-50%, -50%);
          pointer-events: none;
        }
        .hiw-inner {
          max-width: 1060px; margin: 0 auto; position: relative; z-index: 2;
        }
        .hiw-header { text-align: center; margin-bottom: 64px; }
        .hiw-eyebrow {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px; font-weight: 600;
          letter-spacing: 2px; text-transform: uppercase;
          color: #7ecb9e; margin-bottom: 14px; display: block;
        }
        .hiw-title {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(30px, 4vw, 44px);
          color: #f0ede6; margin: 0 0 16px;
          letter-spacing: -1px; line-height: 1.15;
        }
        .hiw-subtitle {
          font-family: 'DM Sans', sans-serif;
          font-size: 16px; color: rgba(240,237,230,0.5);
          max-width: 440px; margin: 0 auto; line-height: 1.7;
        }

        /* Steps */
        .hiw-steps {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 2px; position: relative;
        }

        /* Connecting line between steps */
        .hiw-steps::before {
          content: '';
          position: absolute;
          top: 48px; left: calc(16.67% + 28px); right: calc(16.67% + 28px);
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(126,203,158,0.4), transparent);
          pointer-events: none;
        }

        .hiw-step {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 32px 28px;
          display: flex; flex-direction: column;
          transition: border-color 0.2s, background 0.2s;
        }
        .hiw-step:hover {
          border-color: rgba(126,203,158,0.25);
          background: rgba(45,122,79,0.06);
        }

        .hiw-step-top {
          display: flex; align-items: center;
          justify-content: space-between; margin-bottom: 22px;
        }
        .hiw-step-icon {
          width: 52px; height: 52px; border-radius: 14px;
          background: rgba(45,122,79,0.2);
          border: 1px solid rgba(126,203,158,0.2);
          display: flex; align-items: center;
          justify-content: center; font-size: 22px;
        }
        .hiw-step-num {
          font-family: 'DM Serif Display', serif;
          font-size: 42px; color: rgba(126,203,158,0.15);
          line-height: 1; letter-spacing: -2px;
        }
        .hiw-step-title {
          font-family: 'DM Serif Display', serif;
          font-size: 20px; color: #f0ede6; margin: 0 0 12px;
          line-height: 1.25;
        }
        .hiw-step-desc {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; color: rgba(240,237,230,0.5);
          line-height: 1.7; margin: 0 0 20px; flex: 1;
        }
        .hiw-step-details {
          display: flex; flex-direction: column; gap: 6px;
        }
        .hiw-step-detail {
          display: flex; align-items: center; gap: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px; color: rgba(126,203,158,0.8);
        }
        .hiw-step-detail::before {
          content: '→'; color: rgba(126,203,158,0.5); font-size: 11px;
        }

        /* Bottom CTA */
        .hiw-bottom {
          margin-top: 56px; text-align: center;
          display: flex; flex-direction: column; align-items: center; gap: 16px;
        }
        .hiw-bottom-text {
          font-family: 'DM Sans', sans-serif;
          font-size: 15px; color: rgba(240,237,230,0.45);
        }
        .hiw-bottom-btns {
          display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;
        }
        .hiw-btn-p {
          background: #2d7a4f; color: #f0ede6; border: none;
          border-radius: 8px; padding: 13px 32px;
          font-size: 14px; font-weight: 500;
          font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.2s;
        }
        .hiw-btn-p:hover { background: #3a9462; transform: translateY(-2px); }
        .hiw-btn-s {
          background: transparent; color: rgba(240,237,230,0.7);
          border: 1px solid rgba(240,237,230,0.2);
          border-radius: 8px; padding: 13px 32px;
          font-size: 14px; font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: all 0.2s;
        }
        .hiw-btn-s:hover {
          border-color: rgba(126,203,158,0.4); color: #7ecb9e;
        }

        @media (max-width: 768px) {
          .hiw-steps { grid-template-columns: 1fr; }
          .hiw-steps::before { display: none; }
        }
      `}</style>

      <section className="hiw-section" id="how-it-works">
        <div className="hiw-glow" />
        <div className="hiw-inner">

          <div className="hiw-header">
            <span className="hiw-eyebrow">How It Works</span>
            <h2 className="hiw-title">Three steps to better healthcare</h2>
            <p className="hiw-subtitle">
              Simple, fast, and accessible. Get the care you need in minutes.
            </p>
          </div>

          <div className="hiw-steps">
            {STEPS.map((step) => (
              <div className="hiw-step" key={step.num}>
                <div className="hiw-step-top">
                  <div className="hiw-step-icon">{step.icon}</div>
                  <span className="hiw-step-num">{step.num}</span>
                </div>
                <h3 className="hiw-step-title">{step.title}</h3>
                <p className="hiw-step-desc">{step.desc}</p>
                <div className="hiw-step-details">
                  {step.detail.map((d) => (
                    <span className="hiw-step-detail" key={d}>{d}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="hiw-bottom">
            <p className="hiw-bottom-text">It takes less than 2 minutes to get started</p>
            <div className="hiw-bottom-btns">
              <button className="hiw-btn-p" onClick={() => navigate("/register")}>
                Get Started Free
              </button>
              <button className="hiw-btn-s" onClick={() => navigate("/login")}>
                Already have an account?
              </button>
            </div>
          </div>

        </div>
      </section>
    </>
  );
};

export default HowItWorks;