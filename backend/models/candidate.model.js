/**
 * models/candidate.model.js
 * ------------------------------------------------------------
 * Data-access layer for the `candidates` table.
 * Dynamic filters/sorts use a strict whitelist + parameterized
 * values so they remain safe from SQL injection.
 */

"use strict";

const { pool } = require("../config/db");

// Whitelist of sortable columns (prevents ORDER BY injection).
const SORTABLE = {
  recent: "created_at",
  skill: "skill_score",
  salary: "salary_max",
  projects: "projects",
  rank: "ranking_score",
  name: "candidate_name",
};

// Columns selected for read operations (note: suggestions is JSON text).
const SELECT_COLS = `
  id, user_id, candidate_name, age, education, skill_score, projects, relocate,
  eligibility, priority_status, confidence_level, salary_min, salary_max,
  ranking_score, suggestions, created_at
`;

/**
 * Builds the dynamic WHERE/ORDER pieces shared by list queries.
 * @param {object} opts - { userId, search, filter, sort, order }
 * @returns {{ where:string, params:array, orderBy:string }}
 */
function buildQueryParts(opts = {}) {
  const { userId = null, search = "", filter = "all", sort = "recent", order = "desc" } = opts;

  const clauses = [];
  const params = [];

  // Scope to a single user when userId is provided (regular users).
  if (userId !== null) {
    clauses.push("user_id = ?");
    params.push(userId);
  }

  // Case-insensitive name search.
  if (search) {
    clauses.push("candidate_name LIKE ?");
    params.push(`%${search}%`);
  }

  // Status filter.
  if (filter === "eligible") {
    clauses.push("eligibility = 'Eligible'");
  } else if (filter === "not-eligible") {
    clauses.push("eligibility = 'Not Eligible'");
  } else if (filter === "priority") {
    clauses.push("priority_status = 1");
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const sortCol = SORTABLE[sort] || SORTABLE.recent;
  const sortDir = String(order).toLowerCase() === "asc" ? "ASC" : "DESC";
  const orderBy = `ORDER BY ${sortCol} ${sortDir}`;

  return { where, params, orderBy };
}

const CandidateModel = {
  /** List candidates with optional scope/search/filter/sort. Includes owner name. */
  async findMany(opts = {}) {
    const { where, params, orderBy } = buildQueryParts(opts);
    // Prefix the shared columns with the table alias and join the owner's name.
    const cols = SELECT_COLS.replace(/\s+/g, " ")
      .trim()
      .split(", ")
      .map((c) => `c.${c}`)
      .join(", ");
    const scopedWhere = where.replace(/user_id/g, "c.user_id").replace(/candidate_name/g, "c.candidate_name");
    const scopedOrder = orderBy
      .replace(/\b(created_at|skill_score|salary_max|projects|ranking_score|candidate_name)\b/g, "c.$1");
    const [rows] = await pool.query(
      `SELECT ${cols}, u.name AS owner_name, u.email AS owner_email
       FROM candidates c
       JOIN users u ON u.id = c.user_id
       ${scopedWhere} ${scopedOrder}`,
      params
    );
    return rows;
  },

  /** Find a single candidate by id (optionally scoped to a user). */
  async findById(id, userId = null) {
    let sql = `SELECT ${SELECT_COLS} FROM candidates WHERE id = ?`;
    const params = [id];
    if (userId !== null) {
      sql += " AND user_id = ?";
      params.push(userId);
    }
    sql += " LIMIT 1";
    const [rows] = await pool.query(sql, params);
    return rows[0] || null;
  },

  /** Insert a candidate (computed fields already provided). Returns new id. */
  async create(data) {
    const [result] = await pool.query(
      `INSERT INTO candidates
        (user_id, candidate_name, age, education, skill_score, projects, relocate,
         eligibility, priority_status, confidence_level, salary_min, salary_max,
         ranking_score, suggestions)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.user_id, data.candidate_name, data.age, data.education, data.skill_score,
        data.projects, data.relocate, data.eligibility, data.priority_status,
        data.confidence_level, data.salary_min, data.salary_max, data.ranking_score,
        data.suggestions,
      ]
    );
    return result.insertId;
  },

  /** Update an existing candidate (computed fields already provided). */
  async update(id, data) {
    const [result] = await pool.query(
      `UPDATE candidates SET
        candidate_name = ?, age = ?, education = ?, skill_score = ?, projects = ?,
        relocate = ?, eligibility = ?, priority_status = ?, confidence_level = ?,
        salary_min = ?, salary_max = ?, ranking_score = ?, suggestions = ?
       WHERE id = ?`,
      [
        data.candidate_name, data.age, data.education, data.skill_score, data.projects,
        data.relocate, data.eligibility, data.priority_status, data.confidence_level,
        data.salary_min, data.salary_max, data.ranking_score, data.suggestions, id,
      ]
    );
    return result.affectedRows;
  },

  /** Delete a candidate by id (optionally scoped to a user). */
  async remove(id, userId = null) {
    let sql = "DELETE FROM candidates WHERE id = ?";
    const params = [id];
    if (userId !== null) {
      sql += " AND user_id = ?";
      params.push(userId);
    }
    const [result] = await pool.query(sql, params);
    return result.affectedRows;
  },

  /**
   * Aggregate dashboard stats. When userId is null, computes across
   * all candidates (admin); otherwise scoped to the user.
   */
  async stats(userId = null) {
    const where = userId !== null ? "WHERE user_id = ?" : "";
    const params = userId !== null ? [userId] : [];
    const [rows] = await pool.query(
      `SELECT
         COUNT(*) AS totalCandidates,
         COALESCE(SUM(eligibility = 'Eligible'), 0) AS eligibleCandidates,
         COALESCE(SUM(priority_status = 1), 0) AS priorityCandidates,
         COALESCE(ROUND(AVG(skill_score)), 0) AS averageSkillScore
       FROM candidates ${where}`,
      params
    );
    return rows[0];
  },

  /** Returns the single highest-ranked candidate (optionally scoped). */
  async topPerformer(userId = null) {
    const where = userId !== null ? "WHERE user_id = ?" : "";
    const params = userId !== null ? [userId] : [];
    const [rows] = await pool.query(
      `SELECT ${SELECT_COLS} FROM candidates ${where} ORDER BY ranking_score DESC LIMIT 1`,
      params
    );
    return rows[0] || null;
  },
};

module.exports = CandidateModel;
