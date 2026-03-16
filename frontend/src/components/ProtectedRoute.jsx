// ============================================================
// components/ProtectedRoute.jsx
// Guards routes that require authentication and/or specific roles.
//
// Usage:
//   <ProtectedRoute>                          ← any logged-in user
//     <PatientDashboard />
//   </ProtectedRoute>
//
//   <ProtectedRoute allowedRoles={["doctor"]}>  ← doctor only
//     <DoctorDashboard />
//   </ProtectedRoute>
// ============================================================

import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();

  // Read auth state from localStorage
  const token = localStorage.getItem("telehealth_token");
  const userRaw = localStorage.getItem("telehealth_user");
  const user = userRaw ? JSON.parse(userRaw) : null;

  // 1. Not logged in → redirect to login, preserving the attempted URL
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Logged in but wrong role → redirect to their own dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const dashboardMap = {
      patient: "/patient-dashboard",
      doctor: "/doctor-dashboard",
      pharmacy: "/pharmacy-dashboard",
    };
    return <Navigate to={dashboardMap[user.role] || "/login"} replace />;
  }

  // 3. Authenticated and authorised → render the child component
  return children;
};

export default ProtectedRoute;