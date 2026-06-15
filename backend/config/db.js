/**
 * config/db.js
 * ------------------------------------------------------------
 * Creates and exports a shared MySQL connection pool using
 * mysql2/promise. All queries use parameterized statements
 * (prepared statements) to prevent SQL injection.
 */

"use strict";

const mysql = require("mysql2/promise");

// Read configuration from environment variables (never hardcoded).
const {
  DB_HOST = "localhost",
  DB_PORT = 3306,
  DB_USER = "root",
  DB_PASSWORD = "",
  DB_NAME = "talentscope",
  DB_SSL = "false",
} = process.env;

// Build the connection pool. A pool reuses connections efficiently.
const pool = mysql.createPool({
  host: DB_HOST,
  port: Number(DB_PORT),
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  namedPlaceholders: true,
  // Enable SSL for managed providers that require it.
  ssl: String(DB_SSL).toLowerCase() === "true" ? { rejectUnauthorized: false } : undefined,
});

/**
 * Verifies the database connection on startup.
 * Throws if the database is unreachable so the app fails fast.
 */
async function testConnection() {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
    console.log(`✅ MySQL connected — ${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}`);
  } finally {
    connection.release();
  }
}

module.exports = { pool, testConnection };
