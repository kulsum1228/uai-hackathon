// ============================================================
// controllers/authController.js — Business logic for auth routes
// ============================================================

const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ─── Helper: Generate JWT ──────────────────────────────────
/**
 * Creates a signed JWT token containing the user's id and role.
 * Token expires in 7 days by default (configurable via .env).
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

// ─── Helper: Safe User Object ─────────────────────────────
/**
 * Returns a plain user object with the password field removed.
 * This is what gets sent back in API responses.
 */
const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  village: user.village,
  role: user.role,
  createdAt: user.createdAt,
});

// ─────────────────────────────────────────────────────────────
// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
// ─────────────────────────────────────────────────────────────
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, village, role } = req.body;

    // 1. Validate required fields
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    // 2. Check if a user with this email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "An account with this email already exists" });
    }

    // 3. Create the new user document
    //    Password hashing is handled automatically by the pre-save hook in User.js
    const user = await User.create({
      name,
      email,
      password,
      phone: phone || "",
      village: village || "",
      role: role || "patient",
    });

    // 4. Generate a JWT for the newly registered user
    const token = generateToken(user);

    // 5. Return the token and sanitized user info
    res.status(201).json({
      message: "Account created successfully",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    // Handle Mongoose validation errors (e.g., invalid role, missing required fields)
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }

    console.error("Register error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   POST /api/auth/login
// @desc    Login an existing user and return a JWT
// @access  Public
// ─────────────────────────────────────────────────────────────
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate that both fields are provided
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // 2. Look up the user by email
    //    Note: select("+password") is not needed here because password is not
    //    excluded by default in this schema, but it's good practice to be explicit.
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Use a generic message to avoid revealing whether the email exists
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 3. Compare the provided password against the stored hash
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 4. Generate a JWT token
    const token = generateToken(user);

    // 5. Return the token and user data
    res.status(200).json({
      message: "Login successful",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   GET /api/auth/me
// @desc    Get the currently authenticated user's profile
// @access  Private (requires valid JWT)
// ─────────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    // req.user is attached by the authMiddleware
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user: sanitizeUser(user) });
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({ message: "Server error fetching profile" });
  }
};

module.exports = { registerUser, loginUser, getMe };