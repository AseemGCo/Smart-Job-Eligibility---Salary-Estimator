/**
 * models/user.model.js
 * ------------------------------------------------------------
 * Data-access layer for the `users` table.
 * All queries are parameterized to prevent SQL injection.
 */

"use strict";

const { pool } = require("../config/db");

const UserModel = {
  /** Find a user by email (includes password_hash for login checks). */
  async findByEmail(email) {
    const [rows] = await pool.query(
      "SELECT id, name, email, password_hash, role, created_at, updated_at FROM users WHERE email = ? LIMIT 1",
      [email]
    );
    return rows[0] || null;
  },

  /** Find a user by id (excludes password_hash). */
  async findById(id) {
    const [rows] = await pool.query(
      "SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ? LIMIT 1",
      [id]
    );
    return rows[0] || null;
  },

  /** Create a new user. Returns the new id. */
  async create({ name, email, password_hash, role = "user" }) {
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
      [name, email, password_hash, role]
    );
    return result.insertId;
  },

  /** Count all users (admin dashboard). */
  async countAll() {
    const [rows] = await pool.query("SELECT COUNT(*) AS total FROM users");
    return rows[0].total;
  },

  /** List all users (admin only) without password hashes. */
  async findAll() {
    const [rows] = await pool.query(
      "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC"
    );
    return rows;
  },
};

module.exports = UserModel;
