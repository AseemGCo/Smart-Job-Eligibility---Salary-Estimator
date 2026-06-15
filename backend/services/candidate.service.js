/**
 * services/candidate.service.js
 * ------------------------------------------------------------
 * Candidate business logic. Runs the eligibility engine, persists
 * computed fields, and enforces ownership/authorization rules.
 */

"use strict";

const CandidateModel = require("../models/candidate.model");
const { evaluate } = require("./eligibility.service");
const { AppError } = require("../utils/apiResponse");

/** Parses the stored suggestions JSON string back into an array. */
function hydrate(row) {
  if (!row) return row;
  let suggestions = [];
  try {
    suggestions = row.suggestions ? JSON.parse(row.suggestions) : [];
  } catch {
    suggestions = [];
  }
  return {
    ...row,
    priority_status: Boolean(row.priority_status),
    salary_text:
      row.salary_min || row.salary_max ? `₹${row.salary_min}-${row.salary_max} LPA` : "Not Applicable",
    suggestions,
  };
}

/** Builds the persistable record from raw input + computed values. */
function buildRecord(input) {
  const computed = evaluate(input);
  return {
    candidate_name: input.candidate_name,
    age: input.age,
    education: input.education,
    skill_score: input.skill_score,
    projects: input.projects,
    relocate: input.relocate,
    eligibility: computed.eligibility,
    priority_status: computed.priority_status,
    confidence_level: computed.confidence_level,
    salary_min: computed.salary_min,
    salary_max: computed.salary_max,
    ranking_score: computed.ranking_score,
    suggestions: JSON.stringify(computed.suggestions),
  };
}

const CandidateService = {
  /** List candidates. Admins see all; regular users see their own. */
  async list({ user, query }) {
    const scope = user.role === "admin" ? null : user.id;
    const rows = await CandidateModel.findMany({
      userId: scope,
      search: query.search || "",
      filter: query.filter || "all",
      sort: query.sort || "recent",
      order: query.order || "desc",
    });
    return rows.map(hydrate);
  },

  /** Get one candidate, enforcing ownership unless admin. */
  async getOne({ user, id }) {
    const scope = user.role === "admin" ? null : user.id;
    const row = await CandidateModel.findById(id, scope);
    if (!row) throw new AppError("Candidate not found.", 404);
    return hydrate(row);
  },

  /** Create a candidate for the authenticated user. */
  async create({ user, input }) {
    const record = buildRecord(input);
    record.user_id = user.id;
    const id = await CandidateModel.create(record);
    const row = await CandidateModel.findById(id);
    return hydrate(row);
  },

  /** Update a candidate (ownership enforced unless admin). */
  async update({ user, id, input }) {
    const scope = user.role === "admin" ? null : user.id;
    const existing = await CandidateModel.findById(id, scope);
    if (!existing) throw new AppError("Candidate not found.", 404);

    const record = buildRecord(input);
    await CandidateModel.update(id, record);
    const row = await CandidateModel.findById(id);
    return hydrate(row);
  },

  /** Delete a candidate (ownership enforced unless admin). */
  async remove({ user, id }) {
    const scope = user.role === "admin" ? null : user.id;
    const affected = await CandidateModel.remove(id, scope);
    if (affected === 0) throw new AppError("Candidate not found.", 404);
    return true;
  },
};

module.exports = { CandidateService, hydrate };
