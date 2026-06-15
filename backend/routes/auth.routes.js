/**
 * routes/auth.routes.js
 * ------------------------------------------------------------
 * Authentication routes. Login/register are additionally
 * protected by a stricter rate limiter against brute force.
 */

"use strict";

const express = require("express");
const rateLimit = require("express-rate-limit");

const AuthController = require("../controllers/auth.controller");
const { authenticate } = require("../middleware/auth");
const { registerRules, loginRules, runValidation } = require("../middleware/validation");

const router = express.Router();

// Stricter limiter for auth endpoints (brute-force protection).
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts. Please try again in 15 minutes." },
});

router.post("/register", authLimiter, registerRules, runValidation, AuthController.register);
router.post("/login", authLimiter, loginRules, runValidation, AuthController.login);
router.post("/logout", authenticate, AuthController.logout);
router.get("/profile", authenticate, AuthController.profile);

module.exports = router;
