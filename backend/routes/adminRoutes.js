const express = require("express");
const router = express.Router();
const db = require("../server"); // Reusing the database connection from server.js
const logger = require("../logger"); // Import the logger

/**
 * @route   GET /api/admin
 * @desc    Get all admins
 * @access  Admin
 */
router.get("/", (req, res) => {
  const query = "SELECT * FROM admin";
  db.query(query, (err, results) => {
    if (err) {
      logger.error(`Error fetching admins: ${err.message}`);
      return res.status(500).json({ message: "Database query failed" });
    }
    logger.info("Fetched all admins successfully");
    res.status(200).json(results);
  });
});

/**
 * @route   POST /api/admin
 * @desc    Add a new admin
 * @access  Admin
 */
router.post("/", (req, res) => {
  const { name, email, password, phone, role } = req.body;
  const query = "INSERT INTO admin (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)";
  db.query(query, [name, email, password, phone, role], (err, results) => {
    if (err) {
      logger.error(`Error adding admin: ${err.message}`);
      return res.status(500).json({ message: "Database insertion failed" });
    }
    logger.info(`Admin added successfully: ID ${results.insertId}`);
    res.status(201).json({ message: "Admin added successfully", id: results.insertId });
  });
});

/**
 * @route   GET /api/admin/:id
 * @desc    Get admin details by ID
 * @access  Admin
 */
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM admin WHERE id = ?";
  db.query(query, [id], (err, results) => {
    if (err) {
      logger.error(`Error fetching admin by ID: ${err.message}`);
      return res.status(500).json({ message: "Database query failed" });
    }
    if (results.length === 0) {
      logger.warn(`Admin not found for ID: ${id}`);
      return res.status(404).json({ message: "Admin not found" });
    }
    logger.info(`Fetched admin details for ID: ${id}`);
    res.status(200).json(results[0]);
  });
});

/**
 * @route   PUT /api/admin/:id
 * @desc    Update admin details by ID
 * @access  Admin
 */
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name, email, password, phone, role } = req.body;
  const query = "UPDATE admin SET name = ?, email = ?, password = ?, phone = ?, role = ? WHERE id = ?";
  db.query(query, [name, email, password, phone, role, id], (err, results) => {
    if (err) {
      logger.error(`Error updating admin: ${err.message}`);
      return res.status(500).json({ message: "Database update failed" });
    }
    if (results.affectedRows === 0) {
      logger.warn(`Admin not found for ID: ${id}`);
      return res.status(404).json({ message: "Admin not found" });
    }
    logger.info(`Admin updated successfully for ID: ${id}`);
    res.status(200).json({ message: "Admin updated successfully" });
  });
});

/**
 * @route   DELETE /api/admin/:id
 * @desc    Delete admin by ID
 * @access  Admin
 */
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM admin WHERE id = ?";
  db.query(query, [id], (err, results) => {
    if (err) {
      logger.error(`Error deleting admin: ${err.message}`);
      return res.status(500).json({ message: "Database deletion failed" });
    }
    if (results.affectedRows === 0) {
      logger.warn(`Admin not found for ID: ${id}`);
      return res.status(404).json({ message: "Admin not found" });
    }
    logger.info(`Admin deleted successfully for ID: ${id}`);
    res.status(200).json({ message: "Admin deleted successfully" });
  });
});

module.exports = router;
