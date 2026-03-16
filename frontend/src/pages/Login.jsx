// ============================================================
// pages/Login.jsx — Login page
// ============================================================

import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authAPI } from "../services/api";

// Role → dashboard path
const ROLE_PATHS = {
  patient: "/patient-dashboard",
  doctor: "/doctor-dashboard",
  pharmacy: "/pharmacy-dashboard",
};

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // If user was redirected here from a protected page, go back there after login
  const from = location.state?.from?.pathname || null;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(""); // Clear error when user starts typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Basic client-side validation
    if (!formData.email || !formData.password) {
      setError("Please fill in both fields.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await authAPI.login(formData);
      const { token, user } = res.data;

      // Persist token and user info for the session
      localStorage.setItem("telehealth_token", token);
      localStorage.setItem("telehealth_user", JSON.stringify(user));

      // Navigate to the originally requested page, or the role's default dashboard
      navigate(from || ROLE_PATHS[user.role] || "/", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500&display=swap');

        .auth-page {
          min-height: calc(100vh - 65px);
          background: #f4f7f4;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          font-family: 'DM Sans', sans-serif;
        }
        .auth-card {
          background: #fff;
          border: 1px solid #d8e8d8;
          border-radius: 12px;
          padding: 40px 36px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 4px 24px rgba(0,60,0,0.07);
          animation: fadeUp 0.35s ease;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .auth-logo {
          font-family: 'DM Serif Display', serif;
          font-size: 22px;
          color: #1a4731;
          text-align: center;
          margin-bottom: 6px;
        }
        .auth-logo span { color: #2d7a4f; }
        .auth-subtitle {
          text-align: center;
          font-size: 13px;
          color: #7a9a8a;
          margin-bottom: 28px;
        }
        .auth-heading {
          font-size: 18px;
          font-weight: 500;
          color: #1a2e1a;
          margin-bottom: 20px;
          padding-bottom: 14px;
          border-bottom: 1px solid #e8f0e8;
        }
        .field-group {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-bottom: 20px;
        }
        .field-label {
          font-size: 12px;
          font-weight: 500;
          color: #4a6a5a;
          margin-bottom: 5px;
          letter-spacing: 0.3px;
        }
        .field-input {
          width: 100%;
          border: 1px solid #ccdacc;
          border-radius: 7px;
          padding: 10px 12px;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          color: #1a2e1a;
          background: #f8faf8;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          box-sizing: border-box;
        }
        .field-input:focus {
          border-color: #2d7a4f;
          box-shadow: 0 0 0 3px rgba(45,122,79,0.1);
          background: #fff;
        }
        .error-box {
          background: #fff5f5;
          border: 1px solid #fca5a5;
          border-radius: 7px;
          padding: 10px 12px;
          font-size: 13px;
          color: #b91c1c;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 7px;
        }
        .submit-btn {
          width: 100%;
          background: #2d7a4f;
          color: #fff;
          border: none;
          border-radius: 7px;
          padding: 11px;
          font-size: 14px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: background 0.15s;
          position: relative;
        }
        .submit-btn:hover:not(:disabled) { background: #1f5c39; }
        .submit-btn:disabled { background: #a0bfaa; cursor: not-allowed; }
        .auth-footer {
          text-align: center;
          font-size: 13px;
          color: #7a9a8a;
          margin-top: 18px;
          padding-top: 16px;
          border-top: 1px solid #e8f0e8;
        }
        .auth-footer a {
          color: #2d7a4f;
          text-decoration: none;
          font-weight: 500;
        }
        .auth-footer a:hover { text-decoration: underline; }
        .spinner {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          margin-right: 7px;
          vertical-align: middle;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="auth-page">
        <div className="auth-card">
          <p className="auth-logo">Tele<span>Health</span></p>
          <p className="auth-subtitle">Rural Healthcare Platform</p>

          <p className="auth-heading">Sign in to your account</p>

          {error && (
            <div className="error-box">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="field-group">
              <div>
                <p className="field-label">Email Address</p>
                <input
                  className="field-input"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>
              <div>
                <p className="field-label">Password</p>
                <input
                  className="field-input"
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <button className="submit-btn" type="submit" disabled={isLoading}>
              {isLoading && <span className="spinner" />}
              {isLoading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div className="auth-footer">
            Don't have an account?{" "}
            <Link to="/register">Create one</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;