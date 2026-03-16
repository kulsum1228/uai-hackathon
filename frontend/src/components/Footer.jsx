// ============================================================
// components/Footer.jsx
// ============================================================

import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();
  const year     = new Date().getFullYear();

  return (
    <>
      <style>{`
        .footer {
          background: #060e08;
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: 56px 24px 32px;
          font-family: 'DM Sans', sans-serif;
        }
        .footer-inner {
          max-width: 1060px; margin: 0 auto;
        }

        /* Top: brand + links */
        .footer-top {
          display: flex; align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap; gap: 32px;
          margin-bottom: 40px;
          padding-bottom: 40px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .footer-brand {}
        .footer-logo {
          font-family: 'DM Serif Display', serif;
          font-size: 22px; color: #7ecb9e;
          margin-bottom: 10px;
        }
        .footer-logo span { color: #f0ede6; }
        .footer-tagline {
          font-size: 13px; color: rgba(240,237,230,0.35);
          line-height: 1.6; max-width: 240px;
        }

        /* Nav columns */
        .footer-nav {
          display: flex; gap: 48px; flex-wrap: wrap;
        }
        .footer-nav-group {}
        .footer-nav-title {
          font-size: 11px; font-weight: 600; letter-spacing: 1.5px;
          text-transform: uppercase; color: rgba(240,237,230,0.35);
          margin-bottom: 14px;
        }
        .footer-nav-links {
          display: flex; flex-direction: column; gap: 10px;
        }
        .footer-nav-link {
          font-size: 14px; color: rgba(240,237,230,0.6);
          background: none; border: none; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          text-align: left; padding: 0;
          transition: color 0.15s;
        }
        .footer-nav-link:hover { color: #7ecb9e; }

        /* Bottom: copyright */
        .footer-bottom {
          display: flex; align-items: center;
          justify-content: space-between; flex-wrap: wrap; gap: 12px;
        }
        .footer-copy {
          font-size: 13px; color: rgba(240,237,230,0.25);
        }
        .footer-copy-accent { color: rgba(126,203,158,0.5); }

        .footer-badge {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 11px; color: rgba(240,237,230,0.25);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px; padding: 4px 12px;
        }
        .footer-badge-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: #4ab464;
        }

        @media (max-width: 600px) {
          .footer-top { flex-direction: column; }
          .footer-bottom { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <footer className="footer">
        <div className="footer-inner">

          <div className="footer-top">
            {/* Brand */}
            <div className="footer-brand">
              <p className="footer-logo">Tele<span>Health</span></p>
              <p className="footer-tagline">
                AI-powered healthcare for rural communities. Connecting patients,
                doctors, and pharmacies digitally.
              </p>
            </div>

            {/* Nav links */}
            <div className="footer-nav">
              <div className="footer-nav-group">
                <p className="footer-nav-title">Platform</p>
                <div className="footer-nav-links">
                  <button className="footer-nav-link"
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                    Home
                  </button>
                  <button className="footer-nav-link"
                    onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}>
                    Features
                  </button>
                  <button className="footer-nav-link"
                    onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>
                    How It Works
                  </button>
                </div>
              </div>

              <div className="footer-nav-group">
                <p className="footer-nav-title">Account</p>
                <div className="footer-nav-links">
                  <button className="footer-nav-link" onClick={() => navigate("/login")}>
                    Login
                  </button>
                  <button className="footer-nav-link" onClick={() => navigate("/register")}>
                    Register
                  </button>
                  <button className="footer-nav-link" onClick={() => navigate("/emergency")}>
                    Emergency Help
                  </button>
                </div>
              </div>

              <div className="footer-nav-group">
                <p className="footer-nav-title">Roles</p>
                <div className="footer-nav-links">
                  <span className="footer-nav-link" style={{ cursor: "default" }}>🩺 Patient</span>
                  <span className="footer-nav-link" style={{ cursor: "default" }}>👨‍⚕️ Doctor</span>
                  <span className="footer-nav-link" style={{ cursor: "default" }}>💊 Pharmacy</span>
                </div>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="footer-copy">
              © {year} <span className="footer-copy-accent">TeleHealth</span>.
              Built for rural communities. All rights reserved.
            </p>
            <div className="footer-badge">
              <span className="footer-badge-dot" />
              All systems operational
            </div>
          </div>

        </div>
      </footer>
    </>
  );
};

export default Footer;