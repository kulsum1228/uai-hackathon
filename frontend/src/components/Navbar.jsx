// ============================================================
// components/Navbar.jsx — Responsive navigation bar
// Shows different links based on auth state and user role
// ============================================================

import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

// Role → dashboard path mapping
const DASHBOARD_PATHS = {
  patient: "/patient-dashboard",
  doctor: "/doctor-dashboard",
  pharmacy: "/pharmacy-dashboard",
};

const ROLE_LABELS = {
  patient: "🩺 Patient",
  doctor: "👨‍⚕️ Doctor",
  pharmacy: "💊 Pharmacy",
};

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Read auth state from localStorage
  const token = localStorage.getItem("telehealth_token");
  const userRaw = localStorage.getItem("telehealth_user");
  const user = userRaw ? JSON.parse(userRaw) : null;
  const isLoggedIn = !!token && !!user;

  const dashboardPath = isLoggedIn ? DASHBOARD_PATHS[user.role] : "/login";

  // ── Logout ────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("telehealth_token");
    localStorage.removeItem("telehealth_user");
    setMenuOpen(false);
    navigate("/login");
  };

  // Active link helper
  const isActive = (path) => location.pathname === path;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500&display=swap');

        .nav-root {
          position: fixed;
          top: 0;
          z-index: 100;
          background: #0f2419;
          width: 100%;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          font-family: 'DM Sans', sans-serif;
        }
        .nav-inner {
          max-width: 100%;
          margin: 0 auto;
          padding: 0 20px;
          height: 58px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .nav-brand {
          font-family: 'DM Serif Display', serif;
          font-size: 20px;
          color: #7ecb9e;
          text-decoration: none;
          letter-spacing: 0.3px;
        }
        .nav-brand span { color: #ffffff; }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 4px;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .nav-links a, .nav-btn-ghost {
          font-size: 13px;
          font-weight: 400;
          color: rgba(255,255,255,0.65);
          text-decoration: none;
          padding: 6px 12px;
          border-radius: 6px;
          transition: all 0.15s;
          border: none;
          background: none;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
        }
        .nav-links a:hover, .nav-btn-ghost:hover {
          color: #fff;
          background: rgba(255,255,255,0.07);
        }
        .nav-links a.active {
          color: #7ecb9e;
          background: rgba(126,203,158,0.12);
        }
        .nav-btn-primary {
          font-size: 13px;
          font-weight: 500;
          background: #2d7a4f;
          color: #fff;
          border: none;
          border-radius: 6px;
          padding: 7px 16px;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          text-decoration: none;
          transition: background 0.15s;
        }
        .nav-btn-primary:hover { background: #1f5c39; }
        .nav-btn-logout {
          font-size: 13px;
          background: rgba(220,60,60,0.15);
          color: #ff8a8a;
          border: 1px solid rgba(220,60,60,0.2);
          border-radius: 6px;
          padding: 6px 12px;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.15s;
        }
        .nav-btn-logout:hover {
          background: rgba(220,60,60,0.25);
          color: #ffaaaa;
        }
        .nav-role-badge {
          font-size: 11px;
          background: rgba(126,203,158,0.15);
          color: #7ecb9e;
          border: 1px solid rgba(126,203,158,0.25);
          border-radius: 12px;
          padding: 3px 10px;
          white-space: nowrap;
        }
        .nav-divider {
          width: 1px;
          height: 18px;
          background: rgba(255,255,255,0.12);
          margin: 0 4px;
        }
        /* Mobile */
        .nav-hamburger {
          display: none;
          flex-direction: column;
          gap: 4px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
        }
        .nav-hamburger span {
          display: block;
          width: 20px;
          height: 2px;
          background: rgba(255,255,255,0.7);
          border-radius: 2px;
          transition: all 0.2s;
        }
        .nav-mobile-menu {
          display: none;
          flex-direction: column;
          background: #0f2419;
          border-top: 1px solid rgba(255,255,255,0.08);
          padding: 10px 20px 16px;
          gap: 6px;
        }
        .nav-mobile-menu a, .nav-mobile-menu button {
          font-size: 14px;
          color: rgba(255,255,255,0.75);
          text-decoration: none;
          padding: 8px 0;
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          text-align: left;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        @media (max-width: 640px) {
          .nav-desktop { display: none !important; }
          .nav-hamburger { display: flex; }
          .nav-mobile-menu { display: ${menuOpen ? "flex" : "none"}; }
        }
      `}</style>

      <nav className="nav-root">
        <div className="nav-inner">
          {/* Brand */}
          <Link to={isLoggedIn ? dashboardPath : "/"} className="nav-brand">
            Tele<span>Health</span>
          </Link>

          {/* Desktop nav */}
          <ul className="nav-links nav-desktop">
            {!isLoggedIn ? (
              <>
                <li><Link to="/login" className={isActive("/login") ? "active" : ""}>Login</Link></li>
                <li><Link to="/register" className={`nav-btn-primary ${isActive("/register") ? "active" : ""}`}>Register</Link></li>
              </>
            ) : (
              <>
                <li><span className="nav-role-badge">{ROLE_LABELS[user.role]}</span></li>
                <li><div className="nav-divider" /></li>
                <li>
                  <Link
                    to={dashboardPath}
                    className={isActive(dashboardPath) ? "active" : ""}
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <button className="nav-btn-logout" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>

          {/* Mobile hamburger */}
          <button
            className="nav-hamburger"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>

        {/* Mobile dropdown */}
        <div className="nav-mobile-menu">
          {!isLoggedIn ? (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}>Register</Link>
            </>
          ) : (
            <>
              <span style={{ color: "#7ecb9e", fontSize: "12px" }}>{ROLE_LABELS[user.role]}</span>
              <Link to={dashboardPath} onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <button onClick={handleLogout} style={{ color: "#ff8a8a" }}>Logout</button>
            </>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;