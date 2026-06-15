/**
 * scripts/migrate.js
 * ------------------------------------------------------------
 * Developer convenience script to initialize the database.
 *   node scripts/migrate.js          -> runs schema.sql
 *   node scripts/migrate.js --seed   -> runs schema.sql + sample_data.sql
 *
 * It also creates/updates the default admin account from .env
 * (ADMIN_EMAIL / ADMIN_PASSWORD) with a properly bcrypt-hashed password.
 *
 * NOTE: This connects WITHOUT a database selected first so it can
 * create the database if it does not yet exist.
 */

"use strict";

require("dotenv").config();

const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

const {
  DB_HOST = "localhost",
  DB_PORT = 3306,
  DB_USER = "root",
  DB_PASSWORD = "",
  DB_NAME = "talentscope",
  ADMIN_NAME = "Site Admin",
  ADMIN_EMAIL = "admin@talentscope.com",
  ADMIN_PASSWORD = "Admin@12345",
  BCRYPT_SALT_ROUNDS = "12",
} = process.env;

const DB_DIR = path.join(__dirname, "..", "..", "database");

function readSql(file) {
  const full = path.join(DB_DIR, file);
  if (!fs.existsSync(full)) {
    throw new Error(`SQL file not found: ${full}`);
  }
  return fs.readFileSync(full, "utf8");
}

async function run() {
  const seed = process.argv.includes("--seed");

  // multipleStatements lets us run an entire .sql file at once.
  const conn = await mysql.createConnection({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    multipleStatements: true,
  });

  try {
    console.log("▶ Running schema.sql ...");
    await conn.query(readSql("schema.sql"));
    console.log("✅ Schema applied.");

    if (seed) {
      console.log("▶ Running sample_data.sql ...");
      await conn.query(readSql("sample_data.sql"));
      console.log("✅ Sample data inserted.");
    }

    // Ensure a default admin exists with a hashed password.
    console.log("▶ Ensuring default admin account ...");
    const hash = await bcrypt.hash(ADMIN_PASSWORD, Number(BCRYPT_SALT_ROUNDS));
    await conn.query(
      `INSERT INTO \`${DB_NAME}\`.users (name, email, password_hash, role)
       VALUES (?, ?, ?, 'admin')
       ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = 'admin', name = VALUES(name)`,
      [ADMIN_NAME, ADMIN_EMAIL, hash]
    );
    console.log(`✅ Admin ready -> ${ADMIN_EMAIL} (password from .env ADMIN_PASSWORD)`);

    console.log("\n🎉 Database initialization complete.");
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exitCode = 1;
  } finally {
    await conn.end();
  }
}

run();
