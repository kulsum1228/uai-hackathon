// ============================================================
// pages/Home.jsx — Landing page
// Assembles all landing page sections
// ============================================================

import HeroSection     from "../components/HeroSection";
import FeaturesSection from "../components/FeaturesSection";
import HowItWorks      from "../components/HowItWorks";
import Footer          from "../components/Footer";
import { useNavigate } from "react-router-dom";

// ── CTA Section (between HowItWorks and Footer) ──────────
const CTASection = () => {
  const navigate = useNavigate();
  return (
    <>
      <style>{`
        .cta-section {
          background: #f4f7f4;
          padding: 80px 24px;
          text-align: center;
        }
        .cta-inner { max-width: 600px; margin: 0 auto; }
        .cta-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px; font-weight: 600;
          letter-spacing: 2px; text-transform: uppercase;
          color: #2d7a4f; margin-bottom: 18px; display: block;
        }
        .cta-title {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(28px, 4vw, 40px);
          color: #0f2a1a; margin: 0 0 16px;
          line-height: 1.2; letter-spacing: -1px;
        }
        .cta-desc {
          font-family: 'DM Sans', sans-serif;
          font-size: 16px; color: #5a7a6a;
          line-height: 1.7; margin: 0 0 36px;
        }
        .cta-btns {
          display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;
        }
        .cta-btn-p {
          background: #0f2a1a; color: #f0ede6; border: none;
          border-radius: 8px; padding: 14px 36px;
          font-size: 15px; font-weight: 500;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          transition: all 0.2s;
        }
        .cta-btn-p:hover {
          background: #1a4731; transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(15,42,26,0.25);
        }
        .cta-btn-s {
          background: transparent; color: #2d7a4f;
          border: 1px solid #b8d8c8; border-radius: 8px;
          padding: 14px 36px; font-size: 15px;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          transition: all 0.2s;
        }
        .cta-btn-s:hover {
          background: #e8f5ee; border-color: #2d7a4f;
        }
        @media (max-width: 500px) {
          .cta-btns { flex-direction: column; align-items: center; }
          .cta-btn-p, .cta-btn-s { width: 100%; max-width: 280px; }
        }
      `}</style>
      <section className="cta-section" id="cta">
        <div className="cta-inner">
          <span className="cta-label">Get Started Today</span>
          <h2 className="cta-title">
            Start using Telehealth and improve healthcare accessibility
          </h2>
          <p className="cta-desc">
            Join patients, doctors, and pharmacies already using the platform
            to bring quality healthcare to rural communities.
          </p>
          <div className="cta-btns">
            <button className="cta-btn-p" onClick={() => navigate("/register")}>
              Register Now
            </button>
            <button className="cta-btn-s" onClick={() => navigate("/login")}>
              Login
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

// ── Main Home page ────────────────────────────────────────
const Home = () => {
  return (
    <div style={{ margin: 0, padding: 0 }}>
      <HeroSection />
      <FeaturesSection />
      <HowItWorks />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Home;