const express = require("express");
const router = express.Router();
const db = require("../../server"); // Reusing the database connection from server.js
const logger = require("../logger"); // Importing the logger

/**
 * @route   GET /api/staff
 * @desc    Get all staff members
 * @access  Admin
 */
router.get("/", (req, res) => {
  const query = "SELECT * FROM staff";
  db.query(query, (err, results) => {
    if (err) {
      logger.error(`Error fetching staff members: ${err.message}`);
      return res.status(500).json({ message: "Database query failed" });
    }
    logger.info("Successfully fetched staff members.");
    res.status(200).json(results);
  });
});

/**
 * @route   POST /api/staff
 * @desc    Add a new staff member
 * @access  Admin
 */
router.post("/", (req, res) => {
  const { name, email, phone, role } = req.body;
  const query = "INSERT INTO staff (name, email, phone, role) VALUES (?, ?, ?, ?)";
  db.query(query, [name, email, phone, role], (err, results) => {
    if (err) {
      logger.error(`Error adding staff member: ${err.message}`);
      return res.status(500).json({ message: "Database insertion failed" });
    }
    logger.info(`Staff member added successfully with ID: ${results.insertId}`);
    res.status(201).json({ message: "Staff member added successfully", id: results.insertId });
  });
});

/**
 * @route   GET /api/staff/:id
 * @desc    Get staff member details by ID
 * @access  Admin
 */
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM staff WHERE id = ?";
  db.query(query, [id], (err, results) => {
    if (err) {
      logger.error(`Error fetching staff member by ID: ${err.message}`);
      return res.status(500).json({ message: "Database query failed" });
    }
    if (results.length === 0) {
      logger.warn(`Staff member with ID ${id} not found.`);
      return res.status(404).json({ message: "Staff member not found" });
    }
    logger.info(`Successfully fetched staff member with ID: ${id}`);
    res.status(200).json(results[0]);
  });
});

/**
 * @route   PUT /api/staff/:id
 * @desc    Update staff member details by ID
 * @access  Admin
 */
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name, email, phone, role } = req.body;
  const query = "UPDATE staff SET name = ?, email = ?, phone = ?, role = ? WHERE id = ?";
  db.query(query, [name, email, phone, role, id], (err, results) => {
    if (err) {
      logger.error(`Error updating staff member with ID ${id}: ${err.message}`);
      return res.status(500).json({ message: "Database update failed" });
    }
    if (results.affectedRows === 0) {
      logger.warn(`Staff member with ID ${id} not found for update.`);
      return res.status(404).json({ message: "Staff member not found" });
    }
    logger.info(`Successfully updated staff member with ID ${id}`);
    res.status(200).json({ message: "Staff member updated successfully" });
  });
});

/**
 * @route   DELETE /api/staff/:id
 * @desc    Delete staff member by ID
 * @access  Admin
 */
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM staff WHERE id = ?";
  db.query(query, [id], (err, results) => {
    if (err) {
      logger.error(`Error deleting staff member with ID ${id}: ${err.message}`);
      return res.status(500).json({ message: "Database deletion failed" });
    }
    if (results.affectedRows === 0) {
      logger.warn(`Staff member with ID ${id} not found for deletion.`);
      return res.status(404).json({ message: "Staff member not found" });
    }
    logger.info(`Successfully deleted staff member with ID ${id}`);
    res.status(200).json({ message: "Staff member deleted successfully" });
  });
});

module.exports = router;
