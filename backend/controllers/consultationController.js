// ============================================================
// controllers/consultationController.js — Consultation business logic
// ============================================================

const Consultation = require("../models/Consultation");
const User = require("../models/User");

// ─── Helper: populate patient and doctor fields ────────────
// Reused across multiple controller functions
const populateConsultation = (query) =>
  query
    .populate("patientId", "name email phone")
    .populate("doctorId", "name email phone")
    .populate("messages.senderId", "name role");

// ─────────────────────────────────────────────────────────────
// @route   POST /api/consultations/request
// @desc    Patient requests a new consultation
// @access  Private — patients only
// ─────────────────────────────────────────────────────────────
const requestConsultation = async (req, res) => {
  try {
    // 1. Only patients can request consultations
    if (req.user.role !== "patient") {
      return res.status(403).json({
        message: "Access denied. Only patients can request consultations.",
      });
    }

    const { symptoms, consultationType, doctorId } = req.body;

    // 2. Validate required fields
    if (!symptoms || !consultationType) {
      return res.status(400).json({
        message: "Symptoms and consultation type are required.",
      });
    }

    // 3. If a specific doctor is requested, verify they exist and are a doctor
    if (doctorId) {
      const doctor = await User.findById(doctorId);
      if (!doctor || doctor.role !== "doctor") {
        return res.status(404).json({ message: "Requested doctor not found." });
      }
    }

    // 4. Create the consultation with status "pending"
    const consultation = await Consultation.create({
      patientId: req.user._id,
      doctorId: doctorId || null,
      symptoms,
      consultationType,
      status: "pending",
    });

    // 5. Return the populated consultation
    const populated = await populateConsultation(
      Consultation.findById(consultation._id)
    );

    res.status(201).json({
      message: "Consultation request submitted successfully.",
      consultation: populated,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    console.error("requestConsultation error:", error);
    res.status(500).json({ message: "Server error while requesting consultation." });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   GET /api/consultations/patient/:patientId
// @desc    Get all consultations for a specific patient
// @access  Private — the patient themselves OR a doctor
// ─────────────────────────────────────────────────────────────
const getPatientConsultations = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Only the patient themselves or a doctor can view patient consultations
    const isOwnRecord = req.user._id.toString() === patientId;
    const isDoctor = req.user.role === "doctor";

    if (!isOwnRecord && !isDoctor) {
      return res.status(403).json({
        message: "Access denied. You can only view your own consultations.",
      });
    }

    const consultations = await populateConsultation(
      Consultation.find({ patientId }).sort({ createdAt: -1 })
    );

    res.status(200).json({
      count: consultations.length,
      consultations,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid patient ID format." });
    }
    console.error("getPatientConsultations error:", error);
    res.status(500).json({ message: "Server error while fetching consultations." });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   GET /api/consultations/doctor/:doctorId
// @desc    Get all consultations assigned to a specific doctor
// @access  Private — the doctor themselves only
// ─────────────────────────────────────────────────────────────
const getDoctorConsultations = async (req, res) => {
  try {
    const { doctorId } = req.params;

    // Doctors can only see their own assigned consultations
    if (req.user._id.toString() !== doctorId) {
      return res.status(403).json({
        message: "Access denied. You can only view your own consultations.",
      });
    }

    const consultations = await populateConsultation(
      Consultation.find({ doctorId }).sort({ createdAt: -1 })
    );

    res.status(200).json({
      count: consultations.length,
      consultations,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid doctor ID format." });
    }
    console.error("getDoctorConsultations error:", error);
    res.status(500).json({ message: "Server error while fetching consultations." });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   GET /api/consultations/pending
// @desc    Get all pending consultations (unassigned — for doctor dashboard)
// @access  Private — doctors only
// ─────────────────────────────────────────────────────────────
const getPendingConsultations = async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({
        message: "Access denied. Only doctors can view pending consultations.",
      });
    }

    const consultations = await populateConsultation(
      Consultation.find({ status: "pending" }).sort({ createdAt: 1 }) // oldest first
    );

    res.status(200).json({
      count: consultations.length,
      consultations,
    });
  } catch (error) {
    console.error("getPendingConsultations error:", error);
    res.status(500).json({ message: "Server error while fetching pending consultations." });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   PUT /api/consultations/accept/:consultationId
// @desc    Doctor accepts a pending consultation
// @access  Private — doctors only
// ─────────────────────────────────────────────────────────────
const acceptConsultation = async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({
        message: "Access denied. Only doctors can accept consultations.",
      });
    }

    const consultation = await Consultation.findById(req.params.consultationId);
    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found." });
    }

    // Can only accept a pending consultation
    if (consultation.status !== "pending") {
      return res.status(400).json({
        message: `Cannot accept a consultation with status '${consultation.status}'.`,
      });
    }

    // Assign the doctor and update status
    consultation.doctorId = req.user._id;
    consultation.status = "accepted";
    await consultation.save();

    const populated = await populateConsultation(
      Consultation.findById(consultation._id)
    );

    res.status(200).json({
      message: "Consultation accepted successfully.",
      consultation: populated,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid consultation ID format." });
    }
    console.error("acceptConsultation error:", error);
    res.status(500).json({ message: "Server error while accepting consultation." });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   PUT /api/consultations/complete/:consultationId
// @desc    Doctor marks consultation as completed
// @access  Private — the assigned doctor only
// ─────────────────────────────────────────────────────────────
const completeConsultation = async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.consultationId);
    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found." });
    }

    // Only the assigned doctor can complete it
    if (consultation.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Access denied. Only the assigned doctor can complete this consultation.",
      });
    }

    if (consultation.status !== "accepted") {
      return res.status(400).json({
        message: "Only an accepted consultation can be marked as completed.",
      });
    }

    consultation.status = "completed";
    await consultation.save();

    const populated = await populateConsultation(
      Consultation.findById(consultation._id)
    );

    res.status(200).json({
      message: "Consultation marked as completed.",
      consultation: populated,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid consultation ID format." });
    }
    console.error("completeConsultation error:", error);
    res.status(500).json({ message: "Server error while completing consultation." });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   PUT /api/consultations/prescription/:consultationId
// @desc    Doctor adds or updates prescription notes
// @access  Private — the assigned doctor only
// ─────────────────────────────────────────────────────────────
const addPrescription = async (req, res) => {
  try {
    const { prescription } = req.body;

    if (!prescription) {
      return res.status(400).json({ message: "Prescription text is required." });
    }

    const consultation = await Consultation.findById(req.params.consultationId);
    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found." });
    }

    // Only the assigned doctor can add a prescription
    if (
      !consultation.doctorId ||
      consultation.doctorId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Access denied. Only the assigned doctor can add a prescription.",
      });
    }

    consultation.prescription = prescription;
    await consultation.save();

    const populated = await populateConsultation(
      Consultation.findById(consultation._id)
    );

    res.status(200).json({
      message: "Prescription added successfully.",
      consultation: populated,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid consultation ID format." });
    }
    console.error("addPrescription error:", error);
    res.status(500).json({ message: "Server error while adding prescription." });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   POST /api/consultations/message/:consultationId
// @desc    Send a message via REST (fallback if Socket.io unavailable)
// @access  Private — patient or assigned doctor
// ─────────────────────────────────────────────────────────────
const sendMessage = async (req, res) => {
  try {
    const { messageText } = req.body;
    if (!messageText) {
      return res.status(400).json({ message: "Message text is required." });
    }

    const consultation = await Consultation.findById(req.params.consultationId);
    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found." });
    }

    // Only the patient or assigned doctor can send messages
    const isPatient =
      consultation.patientId.toString() === req.user._id.toString();
    const isAssignedDoctor =
      consultation.doctorId &&
      consultation.doctorId.toString() === req.user._id.toString();

    if (!isPatient && !isAssignedDoctor) {
      return res.status(403).json({
        message: "Access denied. You are not part of this consultation.",
      });
    }

    if (consultation.status !== "accepted") {
      return res.status(400).json({
        message: "Messages can only be sent in an accepted consultation.",
      });
    }

    // Push the new message into the messages array
    const newMessage = {
      senderId: req.user._id,
      messageText,
      timestamp: new Date(),
    };

    consultation.messages.push(newMessage);
    await consultation.save();

    res.status(201).json({
      message: "Message sent.",
      chatMessage: newMessage,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid consultation ID format." });
    }
    console.error("sendMessage error:", error);
    res.status(500).json({ message: "Server error while sending message." });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   GET /api/consultations/:consultationId
// @desc    Get a single consultation by ID (with full message history)
// @access  Private — patient or assigned doctor
// ─────────────────────────────────────────────────────────────
const getConsultationById = async (req, res) => {
  try {
    const consultation = await populateConsultation(
      Consultation.findById(req.params.consultationId)
    );

    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found." });
    }

    // Access check — only involved parties can view
    const isPatient =
      consultation.patientId._id.toString() === req.user._id.toString();
    const isDoctor = req.user.role === "doctor";

    if (!isPatient && !isDoctor) {
      return res.status(403).json({
        message: "Access denied.",
      });
    }

    res.status(200).json({ consultation });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid consultation ID format." });
    }
    console.error("getConsultationById error:", error);
    res.status(500).json({ message: "Server error while fetching consultation." });
  }
};

module.exports = {
  requestConsultation,
  getPatientConsultations,
  getDoctorConsultations,
  getPendingConsultations,
  acceptConsultation,
  completeConsultation,
  addPrescription,
  sendMessage,
  getConsultationById,
};