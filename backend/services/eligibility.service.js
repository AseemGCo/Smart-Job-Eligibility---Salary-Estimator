/**
 * services/eligibility.service.js
 * ------------------------------------------------------------
 * The CORE BUSINESS LOGIC, executed server-side.
 * Mirrors (and is the source of truth for) eligibility, salary,
 * confidence, ranking and improvement suggestions.
 */

"use strict";

// Business-rule thresholds in one place for easy maintenance.
const RULES = Object.freeze({
  MIN_AGE: 18,
  MIN_SKILL: 60,
  MIN_PROJECTS: 2,
  PRIORITY_SKILL: 80,
  PRIORITY_PROJECTS: 3,
});

// Salary bands (data-driven).
const SALARY_BANDS = [
  { min: 60, max: 70, low: 4, high: 6 },
  { min: 71, max: 85, low: 6, high: 10 },
  { min: 86, max: 100, low: 10, high: 18 },
];

const STATUS = Object.freeze({
  PRIORITY: "Priority Candidate",
  ELIGIBLE: "Eligible",
  NOT_ELIGIBLE: "Not Eligible",
});

/** Eligibility & priority status. */
function checkEligibility(c) {
  if (c.skill_score < RULES.MIN_SKILL || c.age < RULES.MIN_AGE || c.projects < RULES.MIN_PROJECTS) {
    return STATUS.NOT_ELIGIBLE;
  }
  const isPriority = c.skill_score >= RULES.PRIORITY_SKILL && c.projects >= RULES.PRIORITY_PROJECTS;
  return isPriority ? STATUS.PRIORITY : STATUS.ELIGIBLE;
}

/** Salary band lookup + relocation/postgraduate bonuses. */
function calculateSalary(c) {
  if (c.skill_score < RULES.MIN_SKILL) {
    return { low: 0, high: 0, text: "Not Applicable" };
  }

  let band = null;
  for (let i = 0; i < SALARY_BANDS.length; i++) {
    const b = SALARY_BANDS[i];
    if (c.skill_score >= b.min && c.skill_score <= b.max) {
      band = b;
      break;
    }
  }
  if (!band) return { low: 0, high: 0, text: "Not Applicable" };

  let low = band.low;
  let high = band.high;

  if (c.relocate === "Yes") { low += 1; high += 1; }
  if (c.education === "Postgraduate") { low += 1; high += 1; }

  return { low, high, text: `₹${low}-${high} LPA` };
}

/** Confidence level derived from number of projects. */
function calculateConfidence(c) {
  if (c.projects >= 4) return { level: "High", percent: 90 };
  if (c.projects >= 2) return { level: "Medium", percent: 60 };
  return { level: "Low", percent: 30 };
}

/** Composite ranking score: (skill × 0.7) + (projects × 5). */
function calculateRankingScore(c) {
  const score = c.skill_score * 0.7 + c.projects * 5;
  return Math.round(score * 10) / 10;
}

/** Personalized improvement suggestions. */
function buildSuggestions(c) {
  const tips = [];

  if (c.age < RULES.MIN_AGE) {
    tips.push("Not eligible due to minimum age requirement (must be 18+).");
  }
  if (c.skill_score < RULES.MIN_SKILL) {
    tips.push("Improve JavaScript fundamentals and build more projects.");
  } else if (c.skill_score < RULES.PRIORITY_SKILL) {
    tips.push("Push your JS skill score above 80 to qualify as a priority candidate.");
  }
  if (c.projects < RULES.MIN_PROJECTS) {
    tips.push("Complete at least 2 practical projects to become eligible.");
  } else if (c.projects < RULES.PRIORITY_PROJECTS) {
    tips.push("Build one more project to reach priority status and boost confidence.");
  }
  if (c.relocate === "No" && c.skill_score >= RULES.MIN_SKILL) {
    tips.push("Consider relocation — it adds ₹1 LPA to your estimated salary.");
  }
  if (c.education !== "Postgraduate" && c.skill_score >= RULES.MIN_SKILL) {
    tips.push("A postgraduate qualification can add ₹1 LPA to your salary estimate.");
  }
  if (tips.length === 0) {
    tips.push("Excellent profile! You meet all priority criteria — keep it up. 🚀");
  }
  return tips;
}

/**
 * evaluate — runs all rules and returns the computed fields ready
 * for persistence. `input` must include: candidate_name, age,
 * education, skill_score, projects, relocate.
 */
function evaluate(input) {
  const status = checkEligibility(input);
  const salary = calculateSalary(input);
  const confidence = calculateConfidence(input);
  const ranking = calculateRankingScore(input);
  const suggestions = buildSuggestions(input);

  return {
    eligibility: status === STATUS.NOT_ELIGIBLE ? STATUS.NOT_ELIGIBLE : STATUS.ELIGIBLE,
    priority_status: status === STATUS.PRIORITY ? 1 : 0,
    status, // combined human-readable status
    confidence_level: confidence.level,
    confidence_percent: confidence.percent,
    salary_min: salary.low,
    salary_max: salary.high,
    salary_text: salary.text,
    ranking_score: ranking,
    suggestions, // array
  };
}

module.exports = {
  RULES,
  STATUS,
  checkEligibility,
  calculateSalary,
  calculateConfidence,
  calculateRankingScore,
  buildSuggestions,
  evaluate,
};
