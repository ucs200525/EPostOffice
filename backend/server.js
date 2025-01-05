const express = require("express");
const mysql = require("mysql2");
const dotenv = require("dotenv");
const helmet = require("helmet");
const cors = require("cors");
const logger = require("./logger"); // Import the logger

// Initialize environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 4000;

// Security Middleware
app.use(helmet());
app.use(cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  logger.error("❌ Error:", err.stack);
  res.status(statusCode).send({ message: "Internal Server Error", error: err.message });
});


// // MySQL Database Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "e_post_office",
});


db.connect((err) => {
  if (err) {
    logger.error("❌ Database connection failed:", err.message);
    
  }
  logger.info("✅ Connected to MySQL database.");
});



// Routes
app.get("/", (req, res) => {
  res.send("Welcome to the E-Post Office API");
});

// Import Routes
const authRoutes = require("./routes/authRoutes");
const customerRoutes = require("./routes/customerRoutes");
const adminRoutes = require("./routes/adminRoutes");
const staffRoutes = require("./routes/staffRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/staff", staffRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  logger.error("❌ Error:", err.stack);
  res.status(500).send({ message: "Internal Server Error", error: err.message });
});

// Start the server
app.listen(PORT, () => {
  logger.info(`🚀 Server is running on http://localhost:${PORT}`);
});