const express = require("express");
const router = express.Router();
const db = require("../server"); // Assuming the database connection is exported in server.js
const logger = require("../logger"); // Import the existing logger

/**
 * @route   GET /api/customers
 * @desc    Get all customers
 * @access  Public
 */
router.get("/", (req, res) => {
  const query = "SELECT * FROM customers";
  db.query(query, (err, results) => {
    if (err) {
      logger.error(`Error fetching customers: ${err.message}`);
      return res.status(500).json({ message: "Database query failed" });
    }
    logger.info("Fetched all customers successfully");
    res.status(200).json(results);
  });
});

/**
 * @route   POST /api/customers
 * @desc    Add a new customer
 * @access  Public
 */
router.post("/", (req, res) => {
  const { name, email, phone } = req.body;
  const query = "INSERT INTO customers (name, email, phone) VALUES (?, ?, ?)";
  db.query(query, [name, email, phone], (err, results) => {
    if (err) {
      logger.error(`Error adding customer: ${err.message}`);
      return res.status(500).json({ message: "Database insertion failed" });
    }
    logger.info(`Customer added successfully with ID: ${results.insertId}`);
    res.status(201).json({ message: "Customer added successfully", id: results.insertId });
  });
});

/**
 * @route   GET /api/customers/:id
 * @desc    Get customer by ID
 * @access  Public
 */
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM customers WHERE id = ?";
  db.query(query, [id], (err, results) => {
    if (err) {
      logger.error(`Error fetching customer by ID: ${err.message}`);
      return res.status(500).json({ message: "Database query failed" });
    }
    if (results.length === 0) {
      logger.warn(`Customer with ID: ${id} not found`);
      return res.status(404).json({ message: "Customer not found" });
    }
    logger.info(`Fetched customer with ID: ${id}`);
    res.status(200).json(results[0]);
  });
});

/**
 * @route   PUT /api/customers/:id
 * @desc    Update a customer by ID
 * @access  Public
 */
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name, email, phone } = req.body;
  const query = "UPDATE customers SET name = ?, email = ?, phone = ? WHERE id = ?";
  db.query(query, [name, email, phone, id], (err, results) => {
    if (err) {
      logger.error(`Error updating customer: ${err.message}`);
      return res.status(500).json({ message: "Database update failed" });
    }
    if (results.affectedRows === 0) {
      logger.warn(`Customer with ID: ${id} not found`);
      return res.status(404).json({ message: "Customer not found" });
    }
    logger.info(`Customer with ID: ${id} updated successfully`);
    res.status(200).json({ message: "Customer updated successfully" });
  });
});

/**
 * @route   DELETE /api/customers/:id
 * @desc    Delete a customer by ID
 * @access  Public
 */
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM customers WHERE id = ?";
  db.query(query, [id], (err, results) => {
    if (err) {
      logger.error(`Error deleting customer: ${err.message}`);
      return res.status(500).json({ message: "Database deletion failed" });
    }
    if (results.affectedRows === 0) {
      logger.warn(`Customer with ID: ${id} not found`);
      return res.status(404).json({ message: "Customer not found" });
    }
    logger.info(`Customer with ID: ${id} deleted successfully`);
    res.status(200).json({ message: "Customer deleted successfully" });
  });
});

module.exports = router;
