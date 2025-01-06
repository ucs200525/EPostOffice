const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const pool = require("../config/database"); // Corrected pool reference
const logger = require("../logger"); // Import the logger

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"; // Secret key for JWT

// @route   POST /api/auth/register
// @desc    Register a new admin
// @access  Public
router.post("/register", async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  // Validate input
  if (!name || !email || !password || !phone || !role) {
    logger.warn("Missing required fields in registration.");
    return res.status(400).json({ message: "Please provide all fields" });
  }

  try {
    // Check if email already exists
    const [results] = await pool.execute("SELECT * FROM users WHERE email = ?", [email]);
    if (results.length > 0) {
      logger.warn(`Email already registered: ${email}`);
      return res.status(400).json({ message: "Email is already registered" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new admin into the database
    const [insertResults] = await pool.execute("INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)", 
      [name, email, hashedPassword, phone, role]);

    logger.info(`Admin registered successfully: ID ${insertResults.insertId}`);
    res.status(201).json({ message: "Admin registered successfully", id: insertResults.insertId });
  } catch (err) {
    logger.error(`Error during registration: ${err.message}`);
    res.status(500).json({ message: "Error registering admin" });
  }
});

// @route   POST /api/auth/login
// @desc    Login an admin
// @access  Public
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    logger.warn("Missing required fields in login.");
    return res.status(400).json({ message: "Please provide email and password" });
  }

  try {
    // Check if admin exists
    const [results] = await pool.execute("SELECT * FROM users WHERE email = ?", [email]);
    if (results.length === 0) {
      logger.warn(`Admin not found for email: ${email}`);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const admin = results[0];

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      logger.warn(`Invalid login attempt for email: ${email}`);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: admin.id, role: admin.role }, JWT_SECRET, { expiresIn: "1h" });

    logger.info(`Admin logged in successfully: ${email}`);
    res.status(200).json({ message: "Login successful", token ,admin});
  } catch (err) {
    logger.error(`Error during login: ${err.message}`);
    res.status(500).json({ message: "Database error" });
  }
});

// @route   GET /api/auth/protected
// @desc    Protected route (Admin only)
// @access  Private
router.get("/protected", verifyToken, (req, res) => {
  res.status(200).json({ message: "This is a protected route", user: req.user });
});

// Middleware to verify JWT token
async function verifyToken(req, res, next) {
  const token = req.header("Authorization");

  if (!token) {
    logger.warn("No token provided for protected route.");
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token.split(" ")[1], JWT_SECRET); // Extract token after "Bearer"
    req.user = decoded; // Attach user data to the request object
    next();
  } catch (err) {
    logger.error(`Token verification failed: ${err.message}`);
    res.status(400).json({ message: "Invalid token" });
  }
}

module.exports = router;
