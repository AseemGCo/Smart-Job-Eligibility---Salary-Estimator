/**
 * routes/dashboard.routes.js
 * ------------------------------------------------------------
 * Dashboard analytics route (protected).
 */

"use strict";

const express = require("express");

const DashboardController = require("../controllers/dashboard.controller");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.get("/stats", authenticate, DashboardController.stats);

module.exports = router;
