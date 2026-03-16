// ============================================================
// server.js — Telehealth Backend Entry Point
// Modules: Auth, Health Records, Consultations,
//          Symptom Checker, Medicine, Rural Accessibility
// ============================================================

const express     = require("express");
const cors        = require("cors");
const dotenv      = require("dotenv");
const path        = require("path");
const http        = require("http");
const { Server }  = require("socket.io");
const compression = require("compression");

const connectDB          = require("./config/db");
const initSocketHandlers = require("./socket/socketHandler");

// ─── Load environment variables ───────────────────────────
dotenv.config({ path: path.resolve(__dirname, ".env") });

// ─── Connect to MongoDB ───────────────────────────────────
connectDB();

const app = express();

// ─── HTTP server (shared with Socket.io) ──────────────────
const httpServer = http.createServer(app);

// ─── Socket.io setup ──────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
initSocketHandlers(io);

// ─── Express Middleware ────────────────────────────────────

// Gzip compress all responses — reduces payload size ~70%
// Especially important for rural users on slow connections
app.use(compression());

// Parse incoming JSON bodies
app.use(express.json());

// CORS — allow React frontend to communicate with this server
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Make Socket.io instance available inside REST controllers
// Usage: req.io.to(roomId).emit("event", data)
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ─── API Routes ────────────────────────────────────────────

// Module 1 — Authentication & Role-Based Access
app.use("/api/auth", require("./routes/authRoutes"));

// Module 2 — Patient Health Records
app.use("/api/records", require("./routes/healthRecordRoutes"));

// Module 3 — Telemedicine Consultation System
app.use("/api/consultations", require("./routes/consultationRoutes"));

// Module 4 — AI Symptom Checker
app.use("/api/symptoms", require("./routes/symptomRoutes"));

// Module 5 — Medicine Availability System
app.use("/api/medicines", require("./routes/medicineRoutes"));

// Module 6 — Rural Accessibility
// Handles: GET /api/emergency/info
//          GET /api/rural/medicines/search
//          GET /api/rural/health-check
app.use("/api", require("./routes/ruralRoutes"));

// ─── Root health check ─────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "Telehealth API is running ✅" });
});

// ─── 404 handler — catch unknown routes ───────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found.` });
});

// ─── Global error handler ─────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).json({ message: "Internal server error" });
});

// ─── Start server ──────────────────────────────────────────
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 Socket.io ready on port ${PORT}`);
  console.log(`📦 Modules: Auth | Records | Consultations | Symptoms | Medicines | Rural`);
});