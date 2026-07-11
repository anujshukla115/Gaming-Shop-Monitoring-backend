// =======================
// GameHub Backend Server
// =======================

// Load environment variables FIRST
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

// =======================
// Middleware
// =======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS - Allow all origins for development
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// =======================
// MongoDB Connection
// =======================
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI not found in environment variables");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });

// =======================
// Routes - GAMING SHOP ONLY
// =======================
app.use("/api/auth", require("./routes/auth"));
app.use("/api/user", require("./routes/user"));
app.use("/api/devices", require("./routes/devices"));
app.use("/api/gaming-bills", require("./routes/gaming-bills"));
app.use("/api/shop-expenses", require("./routes/shop-expenses"));

// =======================
// Health Check (Frontend + Railway)
// =======================
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "GameHub API is running",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Root route (Railway check)
app.get("/", (req, res) => {
  res.status(200).json({
    name: "GameHub Backend",
    status: "Running",
    environment: process.env.NODE_ENV || "development",
    endpoints: {
      auth: "/api/auth",
      user: "/api/user",
      devices: "/api/devices",
      bills: "/api/gaming-bills",
      expenses: "/api/shop-expenses",
      health: "/api/health"
    }
  });
});

// =======================
// 404 Handler
// =======================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// =======================
// Global Error Handler
// =======================
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  console.error("Stack:", err.stack);

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

// =======================
// Start Server (Railway compatible)
// =======================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 GameHub Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
});
