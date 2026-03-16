// ============================================================
// pages/Register.jsx — Registration page
// ============================================================

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";

const ROLES = [
  { value: "patient", label: "🩺 Patient — I want to consult doctors" },
  { value: "doctor", label: "👨‍⚕️ Doctor — I provide consultations" },
  { value: "pharmacy", label: "💊 Pharmacy — I manage medicine stock" },
];

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    village: "",
    role: "patient",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const validate = () => {
    if (!formData.name.trim()) return "Full name is required.";
    if (!formData.email.trim()) return "Email is required.";
    if (formData.password.length < 6) return "Password must be at least 6 characters.";
    if (formData.password !== formData.confirmPassword) return "Passwords do not match.";
    if (!formData.role) return "Please select a role.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    try {
      // Send all fields except confirmPassword to the backend
      const { confirmPassword, ...payload } = formData;
      await authAPI.register(payload);

      setSuccess("Account created! Redirecting to login…");
      setTimeout(() => navigate("/login"), 1800);
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
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
          min-height: 100vh;
          background: #f4f7f4;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 32px 20px;
          font-family: 'DM Sans', sans-serif;
        }
        .auth-card {
          background: #fff;
          border: 1px solid #d8e8d8;
          border-radius: 12px;
          padding: 36px 36px 32px;
          width: 100%;
          max-width: 460px;
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
          margin-bottom: 4px;
        }
        .auth-logo span { color: #2d7a4f; }
        .auth-subtitle {
          text-align: center;
          font-size: 13px;
          color: #7a9a8a;
          margin-bottom: 24px;
        }
        .auth-heading {
          font-size: 18px;
          font-weight: 500;
          color: #1a2e1a;
          margin-bottom: 20px;
          padding-bottom: 14px;
          border-bottom: 1px solid #e8f0e8;
        }
        .field-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 14px;
        }
        .field-full { grid-column: 1 / -1; }
        .field-label {
          font-size: 12px;
          font-weight: 500;
          color: #4a6a5a;
          margin-bottom: 5px;
          letter-spacing: 0.3px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .field-optional {
          font-size: 10px;
          color: #9ab0a0;
          font-weight: 400;
        }
        .field-input, .field-select {
          width: 100%;
          border: 1px solid #ccdacc;
          border-radius: 7px;
          padding: 10px 12px;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          color: #1a2e1a;
          background: #f8faf8;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          box-sizing: border-box;
        }
        .field-input:focus, .field-select:focus {
          border-color: #2d7a4f;
          box-shadow: 0 0 0 3px rgba(45,122,79,0.1);
          background: #fff;
        }
        .field-select { cursor: pointer; }
        .role-section {
          margin-bottom: 18px;
        }
        .role-cards {
          display: flex;
          flex-direction: column;
          gap: 7px;
          margin-top: 8px;
        }
        .role-card {
          display: flex;
          align-items: center;
          gap: 10px;
          border: 1px solid #ccdacc;
          border-radius: 7px;
          padding: 10px 12px;
          cursor: pointer;
          transition: all 0.15s;
          background: #f8faf8;
          font-size: 13px;
          color: #2a4a3a;
        }
        .role-card.selected {
          border-color: #2d7a4f;
          background: #f0fff6;
          color: #1a4731;
          font-weight: 500;
        }
        .role-card input[type="radio"] { accent-color: #2d7a4f; }
        .error-box {
          background: #fff5f5;
          border: 1px solid #fca5a5;
          border-radius: 7px;
          padding: 10px 12px;
          font-size: 13px;
          color: #b91c1c;
          margin-bottom: 14px;
          display: flex;
          align-items: flex-start;
          gap: 7px;
        }
        .success-box {
          background: #f0fff4;
          border: 1px solid #86efac;
          border-radius: 7px;
          padding: 10px 12px;
          font-size: 13px;
          color: #166534;
          margin-bottom: 14px;
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
          margin-top: 4px;
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
        .auth-footer a { color: #2d7a4f; text-decoration: none; font-weight: 500; }
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
        @media (max-width: 480px) {
          .field-grid { grid-template-columns: 1fr; }
          .auth-card { padding: 24px 20px; }
        }
      `}</style>

      <div className="auth-page">
        <div className="auth-card">
          <p className="auth-logo">Tele<span>Health</span></p>
          <p className="auth-subtitle">Rural Healthcare Platform</p>

          <p className="auth-heading">Create your account</p>

          {error && <div className="error-box"><span>⚠️</span>{error}</div>}
          {success && <div className="success-box"><span>✅</span>{success}</div>}

          <form onSubmit={handleSubmit}>
            {/* Name + Email */}
            <div className="field-grid">
              <div className="field-full">
                <p className="field-label">Full Name</p>
                <input className="field-input" type="text" name="name"
                  placeholder="Your full name" value={formData.name}
                  onChange={handleChange} required />
              </div>
              <div className="field-full">
                <p className="field-label">Email Address</p>
                <input className="field-input" type="email" name="email"
                  placeholder="you@example.com" value={formData.email}
                  onChange={handleChange} required />
              </div>
              <div>
                <p className="field-label">Password</p>
                <input className="field-input" type="password" name="password"
                  placeholder="Min. 6 characters" value={formData.password}
                  onChange={handleChange} required />
              </div>
              <div>
                <p className="field-label">Confirm Password</p>
                <input className="field-input" type="password" name="confirmPassword"
                  placeholder="Re-enter password" value={formData.confirmPassword}
                  onChange={handleChange} required />
              </div>
              <div>
                <p className="field-label">Phone <span className="field-optional">(optional)</span></p>
                <input className="field-input" type="tel" name="phone"
                  placeholder="10-digit number" value={formData.phone}
                  onChange={handleChange} />
              </div>
              <div>
                <p className="field-label">Village / Area <span className="field-optional">(optional)</span></p>
                <input className="field-input" type="text" name="village"
                  placeholder="e.g. Navi Mumbai" value={formData.village}
                  onChange={handleChange} />
              </div>
            </div>

            {/* Role selection */}
            <div className="role-section">
              <p className="field-label">I am registering as</p>
              <div className="role-cards">
                {ROLES.map((r) => (
                  <label
                    key={r.value}
                    className={`role-card ${formData.role === r.value ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={r.value}
                      checked={formData.role === r.value}
                      onChange={handleChange}
                    />
                    {r.label}
                  </label>
                ))}
              </div>
            </div>

            <button className="submit-btn" type="submit" disabled={isLoading}>
              {isLoading && <span className="spinner" />}
              {isLoading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;