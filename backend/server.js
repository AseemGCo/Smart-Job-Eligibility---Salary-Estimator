/**
 * server.js
 * ------------------------------------------------------------
 * Application entry point for the TalentScope REST API.
 * Wires together security middleware, routes, and error handling.
 */

"use strict";

// Load environment variables FIRST, before anything else reads them.
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const { testConnection } = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/auth.routes");
const candidateRoutes = require("./routes/candidate.routes");
const dashboardRoutes = require("./routes/dashboard.routes");

const app = express();
const PORT = process.env.PORT || 4000;

/* ------------------------------------------------------------
   SECURITY & PARSING MIDDLEWARE
   ------------------------------------------------------------ */

// Helmet sets secure HTTP headers.
app.use(helmet());

// CORS — only allow configured frontend origins.
const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const isProduction = (process.env.NODE_ENV || "development") === "production";
const localhostRegex = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

app.use(
  cors({
    origin(origin, callback) {
      // No Origin header => non-browser tools (curl, Postman) or same-origin
      // navigations. Always allowed.
      if (!origin) return callback(null, true);

      // In development, be permissive: allow any localhost port and pages
      // opened directly from disk (file:// sends the literal origin "null").
      if (!isProduction && (origin === "null" || localhostRegex.test(origin))) {
        return callback(null, true);
      }

      // Otherwise only allow explicitly whitelisted origins.
      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Deny gracefully (no thrown error => no noisy 500). The browser will
      // block the response because the CORS headers are absent.
      console.warn(`⚠️  CORS: blocked request from origin "${origin}"`);
      return callback(null, false);
    },
    credentials: true,
  })
);

// Body parsers with sane size limits.
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Global rate limiter — protects against brute force / abuse.
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
});
app.use("/api", globalLimiter);

/* ------------------------------------------------------------
   ROUTES
   ------------------------------------------------------------ */

// Friendly root — this is an API server, there is no web page here.
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "TalentScope API. The web app is the separate frontend (e.g. http://localhost:5173).",
    health: "/api/health",
    endpoints: ["/api/auth", "/api/candidates", "/api/dashboard/stats"],
  });
});

// Health check (useful for Render/Railway uptime probes).
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "TalentScope API is healthy", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/dashboard", dashboardRoutes);

// 404 + centralized error handler (must be last).
app.use(notFound);
app.use(errorHandler);

/* ------------------------------------------------------------
   STARTUP
   ------------------------------------------------------------ */

async function start() {
  try {
    await testConnection();
    app.listen(PORT, () => {
      console.log(`🚀 TalentScope API running on http://localhost:${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
}

start();

module.exports = app;
