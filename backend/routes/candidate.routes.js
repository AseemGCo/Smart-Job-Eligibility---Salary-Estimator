/**
 * routes/candidate.routes.js
 * ------------------------------------------------------------
 * Candidate CRUD routes. Every route requires authentication.
 */

"use strict";

const express = require("express");

const CandidateController = require("../controllers/candidate.controller");
const { authenticate } = require("../middleware/auth");
const { candidateRules, runValidation } = require("../middleware/validation");

const router = express.Router();

// Protect all candidate routes.
router.use(authenticate);

router.get("/", CandidateController.list);
router.get("/:id", CandidateController.getOne);
router.post("/", candidateRules, runValidation, CandidateController.create);
router.put("/:id", candidateRules, runValidation, CandidateController.update);
router.delete("/:id", CandidateController.remove);

module.exports = router;
