// ============================================================
// controllers/healthRecordController.js — CRUD for health records
// ============================================================

const HealthRecord = require("../models/HealthRecord");
const User = require("../models/User");

// ─────────────────────────────────────────────────────────────
// @route   POST /api/records
// @desc    Create a new health record for the logged-in patient
// @access  Private — patients only
// ─────────────────────────────────────────────────────────────
const createHealthRecord = async (req, res) => {
  try {
    // 1. Only patients are allowed to create health records
    if (req.user.role !== "patient") {
      return res.status(403).json({
        message: "Access denied. Only patients can create health records.",
      });
    }

    // 2. Prevent a patient from creating a second record
    const existing = await HealthRecord.findOne({ patientId: req.user._id });
    if (existing) {
      return res.status(409).json({
        message:
          "Health record already exists. Use PUT /api/records/:recordId to update it.",
      });
    }

    // 3. Destructure only the fields we expect from the request body
    const {
      age,
      gender,
      bloodGroup,
      height,
      weight,
      allergies,
      chronicDiseases,
      currentMedications,
      medicalHistory,
    } = req.body;

    // 4. Create the record, linking it to the authenticated patient
    const record = await HealthRecord.create({
      patientId: req.user._id,
      age,
      gender,
      bloodGroup,
      height,
      weight,
      allergies: allergies || [],
      chronicDiseases: chronicDiseases || [],
      currentMedications: currentMedications || [],
      medicalHistory: medicalHistory || "",
    });

    res.status(201).json({
      message: "Health record created successfully",
      record,
    });
  } catch (error) {
    // Mongoose validation errors (e.g. invalid blood group enum)
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    console.error("createHealthRecord error:", error);
    res.status(500).json({ message: "Server error while creating health record" });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   GET /api/records/:patientId
// @desc    Fetch a patient's health record by their User ID
// @access  Private — the patient themselves OR any doctor
// ─────────────────────────────────────────────────────────────
const getHealthRecord = async (req, res) => {
  try {
    const { patientId } = req.params;

    // 1. Role-based access check:
    //    - A patient can only fetch their own record
    //    - A doctor can fetch any patient's record
    const isDoctor = req.user.role === "doctor";
    const isOwnRecord = req.user._id.toString() === patientId;

    if (!isDoctor && !isOwnRecord) {
      return res.status(403).json({
        message: "Access denied. You can only view your own health record.",
      });
    }

    // 2. Verify the target patient actually exists in the User collection
    const patientExists = await User.findById(patientId);
    if (!patientExists) {
      return res.status(404).json({ message: "Patient not found." });
    }

    // 3. Populate patient name and email alongside the health data
    const record = await HealthRecord.findOne({ patientId }).populate(
      "patientId",
      "name email phone village"
    );

    if (!record) {
      return res.status(404).json({
        message: "No health record found for this patient.",
      });
    }

    res.status(200).json({ record });
  } catch (error) {
    // Handle invalid MongoDB ObjectId format
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid patient ID format." });
    }
    console.error("getHealthRecord error:", error);
    res.status(500).json({ message: "Server error while fetching health record" });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   PUT /api/records/:recordId
// @desc    Update a health record by its MongoDB _id
// @access  Private — only the patient who owns the record
// ─────────────────────────────────────────────────────────────
const updateHealthRecord = async (req, res) => {
  try {
    const { recordId } = req.params;

    // 1. Find the record first so we can check ownership
    const record = await HealthRecord.findById(recordId);
    if (!record) {
      return res.status(404).json({ message: "Health record not found." });
    }

    // 2. Only the patient who owns the record may update it
    if (record.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Access denied. You can only update your own health record.",
      });
    }

    // 3. Whitelist the fields that are allowed to be updated
    //    (prevents accidental overwrite of patientId or timestamps)
    const allowedUpdates = [
      "age",
      "gender",
      "bloodGroup",
      "height",
      "weight",
      "allergies",
      "chronicDiseases",
      "currentMedications",
      "medicalHistory",
    ];

    const updates = {};
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // 4. Apply the updates; { new: true } returns the updated document
    const updatedRecord = await HealthRecord.findByIdAndUpdate(
      recordId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Health record updated successfully",
      record: updatedRecord,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid record ID format." });
    }
    console.error("updateHealthRecord error:", error);
    res.status(500).json({ message: "Server error while updating health record" });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   DELETE /api/records/:recordId
// @desc    Delete a health record permanently
// @access  Private — only the patient who owns the record
// ─────────────────────────────────────────────────────────────
const deleteHealthRecord = async (req, res) => {
  try {
    const { recordId } = req.params;

    // 1. Find the record to verify it exists and check ownership
    const record = await HealthRecord.findById(recordId);
    if (!record) {
      return res.status(404).json({ message: "Health record not found." });
    }

    // 2. Only the owning patient may delete their record
    if (record.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Access denied. You can only delete your own health record.",
      });
    }

    await HealthRecord.findByIdAndDelete(recordId);

    res.status(200).json({ message: "Health record deleted successfully." });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid record ID format." });
    }
    console.error("deleteHealthRecord error:", error);
    res.status(500).json({ message: "Server error while deleting health record" });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   GET /api/records
// @desc    Get all patient records (doctors only — for dashboard/consultation)
// @access  Private — doctors only
// ─────────────────────────────────────────────────────────────
const getAllRecords = async (req, res) => {
  try {
    // Only doctors should have a bird's-eye view of all records
    if (req.user.role !== "doctor") {
      return res.status(403).json({
        message: "Access denied. Only doctors can view all health records.",
      });
    }

    // Populate patient info alongside each record
    const records = await HealthRecord.find().populate(
      "patientId",
      "name email phone village"
    );

    res.status(200).json({
      count: records.length,
      records,
    });
  } catch (error) {
    console.error("getAllRecords error:", error);
    res.status(500).json({ message: "Server error while fetching all records" });
  }
};

module.exports = {
  createHealthRecord,
  getHealthRecord,
  updateHealthRecord,
  deleteHealthRecord,
  getAllRecords,
};