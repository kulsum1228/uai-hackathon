// ============================================================
// App.jsx — Root component with all routes including landing page
// ============================================================

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

import Navbar         from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// ─── Eagerly loaded ───────────────────────────────────────
import Login    from "./pages/Login";
import Register from "./pages/Register";
import Home     from "./pages/Home";

// ─── Lazy loaded — Patient pages ─────────────────────────
const PatientDashboard    = lazy(() => import("./pages/PatientDashboard"));
const SymptomChecker      = lazy(() => import("./pages/SymptomChecker"));
const MedicineSearch      = lazy(() => import("./pages/MedicineSearch"));
const HealthRecordForm    = lazy(() => import("./components/HealthRecordForm"));
const ConsultationRequest = lazy(() => import("./components/ConsultationRequest"));

// ─── Lazy loaded — Doctor pages ───────────────────────────
const DoctorDashboard  = lazy(() => import("./pages/DoctorDashboard"));
const ConsultationRoom = lazy(() => import("./pages/ConsultationRoom"));

// ─── Lazy loaded — Pharmacy pages ────────────────────────
const PharmacyDashboard = lazy(() => import("./pages/PharmacyDashboard"));

// ─── Lazy loaded — Rural Accessibility ───────────────────
const EmergencyMode         = lazy(() => import("./components/EmergencyMode"));
const OfflineSymptomChecker = lazy(() => import("./components/OfflineSymptomChecker"));
const TextConsultation      = lazy(() => import("./components/TextConsultation"));

// ─── Loading spinner ──────────────────────────────────────
const PageLoader = () => (
  <div style={{
    minHeight: "60vh", display: "flex", alignItems: "center",
    justifyContent: "center", fontFamily: "'DM Sans', sans-serif",
    color: "#4a7a5a", fontSize: "14px", gap: "10px",
  }}>
    <span style={{
      display: "inline-block", width: "18px", height: "18px",
      border: "2px solid #c8e0d0", borderTopColor: "#2d7a4f",
      borderRadius: "50%", animation: "spin 0.7s linear infinite",
    }} />
    Loading…
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// ─── Auth redirect for logged-in users ───────────────────
// If user visits / and is already logged in → go to their dashboard
const HomeOrDashboard = () => {
  const token   = localStorage.getItem("telehealth_token");
  const userRaw = localStorage.getItem("telehealth_user");
  const user    = userRaw ? JSON.parse(userRaw) : null;

  if (token && user) {
    const paths = {
      patient:  "/patient-dashboard",
      doctor:   "/doctor-dashboard",
      pharmacy: "/pharmacy-dashboard",
    };
    return <Navigate to={paths[user.role] || "/login"} replace />;
  }

  // Not logged in → show landing page
  return <Home />;
};

// ─── 404 ─────────────────────────────────────────────────
const NotFound = () => (
  <div style={{
    textAlign: "center", padding: "80px 20px",
    fontFamily: "'DM Sans', sans-serif", color: "#4a6a5a",
  }}>
    <p style={{ fontSize: "56px", margin: "0 0 8px", fontFamily: "'DM Serif Display', serif" }}>404</p>
    <p style={{ fontSize: "16px", marginBottom: "20px" }}>Page not found.</p>
    <a href="/" style={{ color: "#2d7a4f", fontWeight: 500 }}>← Go home</a>
  </div>
);

// ============================================================
// App
// ============================================================
const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Suspense fallback={<PageLoader />}>
        <Routes>

          {/* ── Landing / Home ─────────────────────────────── */}
          {/* Shows landing page for guests, redirects to dashboard for logged-in users */}
          <Route path="/" element={<HomeOrDashboard />} />

          {/* ── Public routes ──────────────────────────────── */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Emergency — public, no login needed */}
          <Route path="/emergency" element={<EmergencyMode />} />

          {/* ── Patient routes ─────────────────────────────── */}
          <Route path="/patient-dashboard" element={
            <ProtectedRoute allowedRoles={["patient"]}>
              <PatientDashboard />
            </ProtectedRoute>
          } />
          <Route path="/health-record" element={
            <ProtectedRoute allowedRoles={["patient"]}>
              <HealthRecordForm onBack={() => window.history.back()} />
            </ProtectedRoute>
          } />
          <Route path="/symptom-checker" element={
            <ProtectedRoute allowedRoles={["patient"]}>
              <SymptomChecker />
            </ProtectedRoute>
          } />
          <Route path="/symptom-checker-offline" element={
            <ProtectedRoute allowedRoles={["patient"]}>
              <OfflineSymptomChecker />
            </ProtectedRoute>
          } />
          <Route path="/consultation-request" element={
            <ProtectedRoute allowedRoles={["patient"]}>
              <ConsultationRequest />
            </ProtectedRoute>
          } />
          <Route path="/medicine-search" element={
            <ProtectedRoute allowedRoles={["patient"]}>
              <MedicineSearch />
            </ProtectedRoute>
          } />

          {/* ── Doctor routes ──────────────────────────────── */}
          <Route path="/doctor-dashboard" element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <DoctorDashboard />
            </ProtectedRoute>
          } />

          {/* ── Shared — Consultation room ─────────────────── */}
          <Route path="/consultation/:consultationId" element={
            <ProtectedRoute allowedRoles={["doctor", "patient"]}>
              <ConsultationRoom />
            </ProtectedRoute>
          } />
          <Route path="/consultation/:consultationId/chat" element={
            <ProtectedRoute allowedRoles={["doctor", "patient"]}>
              <TextConsultation />
            </ProtectedRoute>
          } />

          {/* ── Pharmacy routes ────────────────────────────── */}
          <Route path="/pharmacy-dashboard" element={
            <ProtectedRoute allowedRoles={["pharmacy"]}>
              <PharmacyDashboard />
            </ProtectedRoute>
          } />

          {/* ── 404 ────────────────────────────────────────── */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;