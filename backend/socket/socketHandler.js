// ============================================================
// socket/socketHandler.js
// Real-time messaging + WebRTC signaling for video/audio calls
// ============================================================

const jwt          = require("jsonwebtoken");
const Consultation = require("../models/Consultation");

const initSocketHandlers = (io) => {

  // ── Auth middleware for every socket connection ───────────
  io.use((socket, next) => {
    try {
      const authHeader = socket.handshake.auth?.token;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new Error("Authentication error: No token provided."));
      }
      const token   = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user   = decoded;
      next();
    } catch (err) {
      next(new Error("Authentication error: Invalid or expired token."));
    }
  });

  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id} | User: ${socket.user.id}`);

    // ── join_consultation ─────────────────────────────────────
    socket.on("join_consultation", async ({ consultationId }) => {
      try {
        const consultation = await Consultation.findById(consultationId);
        if (!consultation) return socket.emit("error", { message: "Consultation not found." });

        const isPatient        = consultation.patientId.toString() === socket.user.id;
        const isAssignedDoctor = consultation.doctorId &&
          consultation.doctorId.toString() === socket.user.id;

        if (!isPatient && !isAssignedDoctor) {
          return socket.emit("error", { message: "You are not part of this consultation." });
        }

        socket.join(consultationId);
        socket.emit("joined_consultation", { consultationId });
        socket.to(consultationId).emit("user_joined", {
          userId: socket.user.id,
          role:   socket.user.role,
        });
      } catch (err) {
        socket.emit("error", { message: "Failed to join room." });
      }
    });

    // ── send_message ──────────────────────────────────────────
    socket.on("send_message", async ({ consultationId, messageText }) => {
      try {
        if (!consultationId || !messageText?.trim()) return;
        const consultation = await Consultation.findById(consultationId);
        if (!consultation || consultation.status !== "accepted") return;

        const isPatient        = consultation.patientId.toString() === socket.user.id;
        const isAssignedDoctor = consultation.doctorId &&
          consultation.doctorId.toString() === socket.user.id;
        if (!isPatient && !isAssignedDoctor) return;

        const newMessage = { senderId: socket.user.id, messageText: messageText.trim(), timestamp: new Date() };
        consultation.messages.push(newMessage);
        await consultation.save();

        const saved = consultation.messages[consultation.messages.length - 1];
        io.to(consultationId).emit("receive_message", {
          consultationId,
          message: { _id: saved._id, senderId: socket.user.id, messageText: saved.messageText, timestamp: saved.timestamp },
        });
      } catch (err) {
        console.error("send_message error:", err);
      }
    });

    // ── Typing indicators ─────────────────────────────────────
    socket.on("typing",      ({ consultationId }) =>
      socket.to(consultationId).emit("user_typing",      { userId: socket.user.id }));
    socket.on("stop_typing", ({ consultationId }) =>
      socket.to(consultationId).emit("user_stop_typing", { userId: socket.user.id }));

    // ================================================================
    // WebRTC SIGNALING — server just relays, never inspects SDP/ICE
    // ================================================================

    // Caller sends offer SDP → server relays to callee
    socket.on("webrtc_offer", ({ consultationId, offer }) => {
      socket.to(consultationId).emit("webrtc_offer", { offer, fromUserId: socket.user.id });
    });

    // Callee sends answer SDP → server relays to caller
    socket.on("webrtc_answer", ({ consultationId, answer }) => {
      socket.to(consultationId).emit("webrtc_answer", { answer, fromUserId: socket.user.id });
    });

    // Both sides continuously emit ICE candidates → relay to other side
    socket.on("webrtc_ice_candidate", ({ consultationId, candidate }) => {
      socket.to(consultationId).emit("webrtc_ice_candidate", { candidate, fromUserId: socket.user.id });
    });

    // Either side ends call
    socket.on("webrtc_end_call", ({ consultationId }) => {
      socket.to(consultationId).emit("webrtc_call_ended", { fromUserId: socket.user.id });
    });

    // Mic/video mute state changes
    socket.on("webrtc_toggle_mic",   ({ consultationId, muted    }) =>
      socket.to(consultationId).emit("webrtc_peer_mic_toggle",   { userId: socket.user.id, muted }));
    socket.on("webrtc_toggle_video", ({ consultationId, videoOff }) =>
      socket.to(consultationId).emit("webrtc_peer_video_toggle", { userId: socket.user.id, videoOff }));

    // ── Leave / disconnect ────────────────────────────────────
    socket.on("leave_consultation", ({ consultationId }) => {
      socket.to(consultationId).emit("webrtc_call_ended", { fromUserId: socket.user.id });
      socket.to(consultationId).emit("user_left",         { userId: socket.user.id });
      socket.leave(consultationId);
    });

    socket.on("disconnect", () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = initSocketHandlers;