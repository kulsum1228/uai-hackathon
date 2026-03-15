// ============================================================
// server.js — Main entry point for the Telehealth backend
// ============================================================

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");

// Load environment variables from .env file
dotenv.config({ path: require("path").resolve(__dirname, ".env") });

// Connect to MongoDB
connectDB();

const app = express();

// ─── Middleware ────────────────────────────────────────────
// Parse incoming JSON request bodies
app.use(express.json());

// Enable CORS so the React frontend can communicate with this server
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

// ─── Routes ────────────────────────────────────────────────
// Mount auth routes under /api/auth
app.use("/api/auth", authRoutes);

// ─── Health Check ──────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "Telehealth API is running ✅" });
});

// ─── Global Error Handler ──────────────────────────────────
// Catches any unhandled errors passed via next(err)
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).json({ message: "Internal server error" });
});

// ─── Start Server ──────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});