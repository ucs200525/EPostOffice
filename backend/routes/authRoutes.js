const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const winston = require("winston");

const router = express.Router();

// User model (a simple structure, you'd replace it with an actual DB model)
const users = []; // This is just for demonstration purposes.

const secret = process.env.JWT_SECRET || "323gfasewrtwyrwhcasdrtyhbgerweyrtyrtgfbgry5trgtr6urffbjtuyriurtgfbhryy5434545yhswreytrbdfrteh";

// Set up winston logging
const logger = winston.createLogger({
  level: "info",
  transports: [
    new winston.transports.Console({ format: winston.format.simple() }),
    new winston.transports.File({ filename: "auth.log", level: "info" }),
  ],
});

// User Registration Route (Create)
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = users.find((user) => user.username === username);
    if (existingUser) {
      logger.warn(`Registration failed for ${username}: User already exists`);
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { username, password: hashedPassword };
    users.push(newUser);
    logger.info(`User ${username} registered successfully`);
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    res.status(500).json({ message: "Server error" });
  }
});

// User Login Route (Read)
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = users.find((user) => user.username === username);
    if (!user) {
      logger.warn(`Login failed for ${username}: User not found`);
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn(`Login failed for ${username}: Incorrect password`);
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ username }, secret, { expiresIn: "1h" });
    logger.info(`User ${username} logged in successfully`);
    res.status(200).json({ token });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    res.status(500).json({ message: "Server error" });
  }
});

// User Logout Route (Update) - We can simulate it by just invalidating the token
router.post("/logout", (req, res) => {
  // In real-world scenarios, you would blacklist the JWT token
  res.status(200).json({ message: "Logged out successfully" });
  logger.info("User logged out");
});

// Password Reset Route (Update)
router.post("/reset-password", async (req, res) => {
  try {
    const { username, oldPassword, newPassword } = req.body;
    const user = users.find((user) => user.username === username);
    if (!user) {
      logger.warn(`Password reset failed for ${username}: User not found`);
      return res.status(400).json({ message: "User not found" });
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      logger.warn(`Password reset failed for ${username}: Incorrect old password`);
      return res.status(400).json({ message: "Incorrect old password" });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    logger.info(`Password reset successfully for ${username}`);
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    logger.error(`Password reset error: ${error.message}`);
    res.status(500).json({ message: "Server error" });
  }
});

// Check Auth Status Route (Read)
router.get("/status", (req, res) => {
  // Check token status (in a real app, you'd verify the token)
  res.status(200).json({ message: "User is authenticated" });
  logger.info("User authentication status checked");
});

module.exports = router;
