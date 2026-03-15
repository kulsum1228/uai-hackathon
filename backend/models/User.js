// ============================================================
// models/User.js — Mongoose schema for the User collection
// ============================================================

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  // Full name of the user
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },

  // Email must be unique across all users
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
  },

  // Password is stored as a bcrypt hash — never plain text
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"],
  },

  // Optional contact number
  phone: {
    type: String,
    trim: true,
    default: "",
  },

  // Optional geographic field (useful for rural/telehealth context)
  village: {
    type: String,
    trim: true,
    default: "",
  },

  // Role determines what the user can access in the application
  role: {
    type: String,
    enum: {
      values: ["patient", "doctor", "pharmacy"],
      message: "Role must be patient, doctor, or pharmacy",
    },
    default: "patient",
  },

  // Automatically set when the document is created
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ─── Pre-save Hook ─────────────────────────────────────────
// Hash the password before saving to the database.
// Only runs if the password field was modified (prevents re-hashing on other updates).
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    // Salt rounds = 10 is the recommended balance of security vs. performance
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ─── Instance Method ───────────────────────────────────────
// Compares a plain-text password with the stored hash during login
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);