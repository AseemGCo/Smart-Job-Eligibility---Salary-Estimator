/**
 * middleware/validation.js
 * ------------------------------------------------------------
 * Input validation & sanitization using express-validator.
 * Each rule-set returns an array of middleware; `runValidation`
 * collects any errors and short-circuits with a 422 response.
 */

"use strict";

const { body, validationResult } = require("express-validator");
const { fail } = require("../utils/apiResponse");

/** Collects validation errors and responds 422 if any exist. */
function runValidation(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const details = result.array().map((e) => ({ field: e.path, message: e.msg }));
    return fail(res, "Validation failed.", 422, details);
  }
  return next();
}

/* ---------------- Auth validators ---------------- */

const registerRules = [
  body("name")
    .trim()
    .notEmpty().withMessage("Full name is required.")
    .isLength({ min: 2, max: 100 }).withMessage("Name must be 2–100 characters.")
    .escape(),
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required.")
    .isEmail().withMessage("Enter a valid email address.")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters."),
];

const loginRules = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required.")
    .isEmail().withMessage("Enter a valid email address.")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required."),
  body("remember").optional().isBoolean().toBoolean(),
];

/* ---------------- Candidate validators ---------------- */

const EDUCATION_VALUES = ["Graduate", "Postgraduate", "Non-IT Background"];

const candidateRules = [
  body("candidate_name")
    .trim()
    .notEmpty().withMessage("Candidate name is required.")
    .isLength({ min: 2, max: 120 }).withMessage("Name must be 2–120 characters.")
    .escape(),
  body("age")
    .notEmpty().withMessage("Age is required.")
    .isInt({ min: 14, max: 80 }).withMessage("Age must be between 14 and 80.")
    .toInt(),
  body("education")
    .trim()
    .isIn(EDUCATION_VALUES).withMessage(`Education must be one of: ${EDUCATION_VALUES.join(", ")}.`),
  body("skill_score")
    .notEmpty().withMessage("Skill score is required.")
    .isInt({ min: 0, max: 100 }).withMessage("Skill score must be 0–100.")
    .toInt(),
  body("projects")
    .notEmpty().withMessage("Projects is required.")
    .isInt({ min: 0, max: 1000 }).withMessage("Projects must be 0 or more.")
    .toInt(),
  body("relocate")
    .trim()
    .isIn(["Yes", "No"]).withMessage("Relocate must be 'Yes' or 'No'."),
];

module.exports = {
  runValidation,
  registerRules,
  loginRules,
  candidateRules,
  EDUCATION_VALUES,
};
