// ============================================================
// middleware/authMiddleware.js — JWT verification & role-based access
// ============================================================

const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ─────────────────────────────────────────────────────────────
// protect — Verifies the JWT and attaches the user to req.user
//
// Expected header format:
//   Authorization: Bearer <token>
// ─────────────────────────────────────────────────────────────
const protect = async (req, res, next) => {
  let token;

  // 1. Extract the token from the Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1]; // Get only the token part
  }

  // 2. If no token is present, deny access immediately
  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    // 3. Verify the token signature and expiry using our secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Fetch the user from the DB to ensure they still exist
    //    (handles cases where the account was deleted after token was issued)
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found. Token is invalid." });
    }

    // 5. Attach the user object to the request for downstream handlers
    req.user = user;
    next();
  } catch (error) {
    // Handle specific JWT errors with clear messages
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired. Please log in again." });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token. Please log in again." });
    }

    console.error("Auth middleware error:", error);
    res.status(500).json({ message: "Server error during token verification." });
  }
};

// ─────────────────────────────────────────────────────────────
// authorizeRoles — Restricts access to specific user roles
//
// Usage (always chain AFTER protect):
//   router.get("/route", protect, authorizeRoles("doctor"), handler)
//   router.get("/route", protect, authorizeRoles("doctor", "pharmacy"), handler)
// ─────────────────────────────────────────────────────────────
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // req.user is guaranteed to exist here because protect runs first
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access forbidden. Role '${req.user.role}' is not authorized for this resource.`,
      });
    }
    next();
  };
};

module.exports = { protect, authorizeRoles };