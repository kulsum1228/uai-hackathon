// ============================================================
// components/FeaturesSection.jsx
// ============================================================

import { useNavigate } from "react-router-dom";

const FEATURES = [
  {
    icon: "🔍",
    color: "#e8f5ee",
    accent: "#2d7a4f",
    title: "AI Symptom Checker",
    desc: "Enter your symptoms and receive instant AI-powered health insights with urgency levels and personalised advice — works offline too.",
    tag: "For Patients",
    tagColor: "#2d7a4f",
    tagBg: "#e8f5ee",
  },
  {
    icon: "💬",
    color: "#e8f0ff",
    accent: "#1a5276",
    title: "Online Doctor Consultation",
    desc: "Connect with doctors via text chat, audio, or video call. Request a consultation anytime and get professional medical guidance.",
    tag: "For Patients",
    tagColor: "#1a5276",
    tagBg: "#e8f0ff",
  },
  {
    icon: "💊",
    color: "#fff8e8",
    accent: "#a16207",
    title: "Medicine Availability",
    desc: "Search for medicines and instantly see which nearby pharmacies have them in stock, with prices and locations shown.",
    tag: "For Patients",
    tagColor: "#a16207",
    tagBg: "#fff8e8",
  },
  {
    icon: "🆘",
    color: "#fff0f0",
    accent: "#b91c1c",
    title: "Emergency Assistance",
    desc: "One-tap access to first aid instructions, emergency contact numbers, and offline guidance — even without internet.",
    tag: "Always On",
    tagColor: "#b91c1c",
    tagBg: "#fee2e2",
  },
];

const FeaturesSection = () => {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        .feat-section {
          background: #f4f7f4;
          padding: 96px 24px;
        }
        .feat-inner { max-width: 1060px; margin: 0 auto; }

        .feat-header { text-align: center; margin-bottom: 56px; }
        .feat-eyebrow {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px; font-weight: 600;
          letter-spacing: 2px; text-transform: uppercase;
          color: #2d7a4f; margin-bottom: 14px;
          display: block;
        }
        .feat-title {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(30px, 4vw, 44px);
          color: #0f2a1a; margin: 0 0 16px;
          letter-spacing: -1px; line-height: 1.15;
        }
        .feat-subtitle {
          font-family: 'DM Sans', sans-serif;
          font-size: 16px; color: #5a7a6a; line-height: 1.7;
          max-width: 480px; margin: 0 auto;
        }

        .feat-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .feat-card {
          background: #fff;
          border: 1px solid #d8e8d8;
          border-radius: 16px;
          padding: 32px 28px;
          transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
          display: flex; flex-direction: column; gap: 0;
        }
        .feat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0,60,20,0.1);
          border-color: #b8d8c8;
        }

        .feat-icon-wrap {
          width: 52px; height: 52px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 24px; margin-bottom: 18px; flex-shrink: 0;
        }
        .feat-card-tag {
          display: inline-block; font-family: 'DM Sans', sans-serif;
          font-size: 10px; font-weight: 600; letter-spacing: 1px;
          text-transform: uppercase; border-radius: 20px;
          padding: 2px 10px; margin-bottom: 10px;
        }
        .feat-card-title {
          font-family: 'DM Serif Display', serif;
          font-size: 20px; color: #0f2a1a; margin: 0 0 10px;
          line-height: 1.25;
        }
        .feat-card-desc {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; color: #5a7a6a; line-height: 1.7; margin: 0;
          flex: 1;
        }

        /* CTA strip below grid */
        .feat-cta {
          margin-top: 48px; text-align: center;
        }
        .feat-cta-text {
          font-family: 'DM Sans', sans-serif;
          font-size: 15px; color: #5a7a6a; margin-bottom: 18px;
        }
        .feat-cta-btn {
          background: #0f2a1a; color: #f0ede6; border: none;
          border-radius: 8px; padding: 13px 36px;
          font-size: 14px; font-weight: 500;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          transition: all 0.2s;
        }
        .feat-cta-btn:hover {
          background: #1a4731; transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(15,42,26,0.25);
        }

        @media (max-width: 640px) {
          .feat-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <section className="feat-section" id="features">
        <div className="feat-inner">

          <div className="feat-header">
            <span className="feat-eyebrow">What We Offer</span>
            <h2 className="feat-title">Everything you need,<br />right where you are</h2>
            <p className="feat-subtitle">
              A complete healthcare ecosystem built for patients, doctors,
              and pharmacies in rural and underserved communities.
            </p>
          </div>

          <div className="feat-grid">
            {FEATURES.map((f) => (
              <div className="feat-card" key={f.title}>
                <div className="feat-icon-wrap" style={{ background: f.color }}>
                  {f.icon}
                </div>
                <span
                  className="feat-card-tag"
                  style={{ background: f.tagBg, color: f.tagColor }}
                >
                  {f.tag}
                </span>
                <h3 className="feat-card-title">{f.title}</h3>
                <p className="feat-card-desc">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="feat-cta">
            <p className="feat-cta-text">Ready to get started? Join thousands of users today.</p>
            <button className="feat-cta-btn" onClick={() => navigate("/register")}>
              Create Your Account →
            </button>
          </div>

        </div>
      </section>
    </>
  );
};

export default FeaturesSection;