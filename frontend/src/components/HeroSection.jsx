// ============================================================
// components/HeroSection.jsx
// ============================================================

import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

        .hero {
          min-height: 100vh;
          background: #0a1a0f;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          padding: 100px 24px 80px;
        }
        .hero::before {
          content: '';
          position: absolute;
          width: 700px; height: 700px; border-radius: 50%;
          background: radial-gradient(circle, rgba(45,122,79,0.22) 0%, transparent 65%);
          top: -200px; right: -150px; pointer-events: none;
        }
        .hero::after {
          content: '';
          position: absolute;
          width: 500px; height: 500px; border-radius: 50%;
          background: radial-gradient(circle, rgba(74,180,100,0.12) 0%, transparent 70%);
          bottom: -100px; left: -100px; pointer-events: none;
        }
        .hero-dots {
          position: absolute; inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px);
          background-size: 32px 32px;
          pointer-events: none;
        }
        .hero-inner {
          position: relative; z-index: 2;
          max-width: 800px; text-align: center;
        }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(45,122,79,0.18);
          border: 1px solid rgba(126,203,158,0.28);
          color: #7ecb9e;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px; font-weight: 600;
          letter-spacing: 2px; text-transform: uppercase;
          padding: 6px 16px; border-radius: 20px;
          margin-bottom: 36px;
          animation: lp-fadeUp 0.7s ease both;
        }
        .hero-badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #4ab464;
          animation: lp-pulse 2s ease-in-out infinite;
        }
        .hero-title {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(38px, 6vw, 70px);
          line-height: 1.08; color: #f0ede6;
          margin: 0 0 8px;
          letter-spacing: -2px;
          animation: lp-fadeUp 0.7s 0.1s ease both;
        }
        .hero-title-em {
          font-style: italic; color: #7ecb9e; display: block;
        }
        .hero-subtitle {
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(16px, 2vw, 19px);
          color: rgba(240,237,230,0.52);
          line-height: 1.75; max-width: 520px;
          margin: 22px auto 48px;
          animation: lp-fadeUp 0.7s 0.2s ease both;
        }
        .hero-btns {
          display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;
          animation: lp-fadeUp 0.7s 0.3s ease both;
        }
        .hero-btn-p {
          background: #2d7a4f; color: #f0ede6; border: none;
          border-radius: 8px; padding: 14px 40px;
          font-size: 15px; font-weight: 500;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          transition: all 0.2s;
        }
        .hero-btn-p:hover {
          background: #3a9462; transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(45,122,79,0.4);
        }
        .hero-btn-s {
          background: transparent; color: #f0ede6;
          border: 1px solid rgba(240,237,230,0.22);
          border-radius: 8px; padding: 14px 40px;
          font-size: 15px; font-weight: 400;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          transition: all 0.2s;
        }
        .hero-btn-s:hover {
          border-color: rgba(126,203,158,0.5);
          color: #7ecb9e; transform: translateY(-2px);
        }
        .hero-stats {
          display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;
          margin-top: 60px;
          animation: lp-fadeUp 0.7s 0.45s ease both;
        }
        .hero-stat {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px; padding: 14px 22px; text-align: center;
        }
        .hero-stat-n {
          font-family: 'DM Serif Display', serif;
          font-size: 24px; color: #7ecb9e; display: block;
        }
        .hero-stat-l {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px; color: rgba(240,237,230,0.4);
          display: block; margin-top: 2px;
        }
        .hero-scroll-cue {
          position: absolute; bottom: 30px; left: 50%;
          transform: translateX(-50%);
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          cursor: pointer; animation: lp-fadeUp 0.7s 0.8s ease both;
        }
        .hero-scroll-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 10px; letter-spacing: 2px; text-transform: uppercase;
          color: rgba(240,237,230,0.25);
        }
        .hero-scroll-bar {
          width: 1px; height: 40px;
          background: linear-gradient(to bottom, rgba(126,203,158,0.6), transparent);
          animation: lp-scrollbar 2s ease-in-out infinite;
        }
        @keyframes lp-fadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes lp-pulse {
          0%, 100% { opacity: 1; } 50% { opacity: 0.4; }
        }
        @keyframes lp-scrollbar {
          0%, 100% { opacity: 0.4; } 50% { opacity: 1; }
        }
        @media (max-width: 600px) {
          .hero-btns { flex-direction: column; align-items: center; }
          .hero-btn-p, .hero-btn-s { width: 100%; max-width: 280px; text-align: center; }
          .hero-stats { gap: 8px; }
        }
      `}</style>

      <section className="hero" id="home">
        <div className="hero-dots" />
        <div className="hero-inner">

          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Rural Healthcare Platform
          </div>

          <h1 className="hero-title">
            AI-Powered Telehealth
            <span className="hero-title-em">for Rural Communities</span>
          </h1>

          <p className="hero-subtitle">
            Connect patients, doctors, and pharmacies through one digital
            healthcare platform — designed for areas where access matters most.
          </p>

          <div className="hero-btns">
            <button className="hero-btn-p" onClick={() => navigate("/login")}>
              Login
            </button>
            <button className="hero-btn-s" onClick={() => navigate("/register")}>
              Register Free
            </button>
          </div>

          <div className="hero-stats">
            {[
              { n: "3",   l: "User Roles" },
              { n: "6",   l: "Core Modules" },
              { n: "35+", l: "Symptom Rules" },
              { n: "24/7", l: "Availability" },
            ].map((s) => (
              <div className="hero-stat" key={s.l}>
                <span className="hero-stat-n">{s.n}</span>
                <span className="hero-stat-l">{s.l}</span>
              </div>
            ))}
          </div>
        </div>

        <div
          className="hero-scroll-cue"
          onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
        >
          <span className="hero-scroll-label">Scroll</span>
          <div className="hero-scroll-bar" />
        </div>
      </section>
    </>
  );
};

export default HeroSection;