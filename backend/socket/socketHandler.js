// ============================================================
// socket/socketHandler.js — Socket.io real-time messaging logic
// ============================================================

const jwt = require("jsonwebtoken");
const Consultation = require("../models/Consultation");

/**
 * Initialises all Socket.io event handlers.
 * Called once from server.js with the `io` instance.
 *
 * @param {import("socket.io").Server} io
 */
const initSocketHandlers = (io) => {

  // ─── Middleware: authenticate every socket connection ────
  // Clients must send their JWT when connecting:
  //   const socket = io("http://localhost:5000", {
  //     auth: { token: "Bearer eyJ..." }
  //   });
  io.use((socket, next) => {
    try {
      const authHeader = socket.handshake.auth?.token;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new Error("Authentication error: No token provided."));
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach decoded user payload to socket for use in event handlers
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error("Authentication error: Invalid or expired token."));
    }
  });

  // ─── Connection handler ───────────────────────────────────
  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id} | User: ${socket.user.id}`);

    // ── Event: join_consultation ────────────────────────────
    // Client emits this to join the room for a specific consultation.
    // Only the patient and assigned doctor should join.
    //
    // Client usage:
    //   socket.emit("join_consultation", { consultationId: "abc123" });
    socket.on("join_consultation", async ({ consultationId }) => {
      try {
        const consultation = await Consultation.findById(consultationId);

        if (!consultation) {
          return socket.emit("error", { message: "Consultation not found." });
        }

        // Verify the connecting user is a participant
        const isPatient =
          consultation.patientId.toString() === socket.user.id;
        const isAssignedDoctor =
          consultation.doctorId &&
          consultation.doctorId.toString() === socket.user.id;

        if (!isPatient && !isAssignedDoctor) {
          return socket.emit("error", {
            message: "You are not part of this consultation.",
          });
        }

        // Join the Socket.io room named after the consultationId
        socket.join(consultationId);
        console.log(`👤 User ${socket.user.id} joined room: ${consultationId}`);

        // Notify the user that they successfully joined
        socket.emit("joined_consultation", {
          message: `Joined consultation room: ${consultationId}`,
          consultationId,
        });

        // Notify the other participant that someone joined
        socket.to(consultationId).emit("user_joined", {
          userId: socket.user.id,
          message: "The other participant has joined.",
        });
      } catch (err) {
        console.error("join_consultation error:", err);
        socket.emit("error", { message: "Failed to join consultation room." });
      }
    });

    // ── Event: send_message ─────────────────────────────────
    // Client emits this to send a chat message.
    // The message is saved to MongoDB and broadcast to the room.
    //
    // Client usage:
    //   socket.emit("send_message", {
    //     consultationId: "abc123",
    //     messageText: "Hello doctor"
    //   });
    socket.on("send_message", async ({ consultationId, messageText }) => {
      try {
        // Validate inputs
        if (!consultationId || !messageText?.trim()) {
          return socket.emit("error", {
            message: "consultationId and messageText are required.",
          });
        }

        const consultation = await Consultation.findById(consultationId);
        if (!consultation) {
          return socket.emit("error", { message: "Consultation not found." });
        }

        // Only accepted consultations can have messages
        if (consultation.status !== "accepted") {
          return socket.emit("error", {
            message: "Messages can only be sent in an accepted consultation.",
          });
        }

        // Verify sender is a participant
        const isPatient =
          consultation.patientId.toString() === socket.user.id;
        const isAssignedDoctor =
          consultation.doctorId &&
          consultation.doctorId.toString() === socket.user.id;

        if (!isPatient && !isAssignedDoctor) {
          return socket.emit("error", {
            message: "You are not part of this consultation.",
          });
        }

        // Build and persist the message
        const newMessage = {
          senderId: socket.user.id,
          messageText: messageText.trim(),
          timestamp: new Date(),
        };

        consultation.messages.push(newMessage);
        await consultation.save();

        // Get the saved message (with its generated _id)
        const savedMessage =
          consultation.messages[consultation.messages.length - 1];

        // Broadcast to everyone in the room (including the sender)
        // Client listens for this event to render the message in the UI
        io.to(consultationId).emit("receive_message", {
          consultationId,
          message: {
            _id: savedMessage._id,
            senderId: socket.user.id,
            messageText: savedMessage.messageText,
            timestamp: savedMessage.timestamp,
          },
        });
      } catch (err) {
        console.error("send_message error:", err);
        socket.emit("error", { message: "Failed to send message." });
      }
    });

    // ── Event: typing_indicator ─────────────────────────────
    // Notifies the other participant that someone is typing.
    // No DB write needed — purely real-time.
    socket.on("typing", ({ consultationId }) => {
      socket.to(consultationId).emit("user_typing", {
        userId: socket.user.id,
      });
    });

    socket.on("stop_typing", ({ consultationId }) => {
      socket.to(consultationId).emit("user_stop_typing", {
        userId: socket.user.id,
      });
    });

    // ── Event: leave_consultation ───────────────────────────
    socket.on("leave_consultation", ({ consultationId }) => {
      socket.leave(consultationId);
      socket.to(consultationId).emit("user_left", {
        userId: socket.user.id,
        message: "The other participant has left the room.",
      });
      console.log(`👋 User ${socket.user.id} left room: ${consultationId}`);
    });

    // ── Event: disconnect ───────────────────────────────────
    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = initSocketHandlers;