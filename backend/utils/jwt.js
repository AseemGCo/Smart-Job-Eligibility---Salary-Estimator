/**
 * utils/jwt.js
 * ------------------------------------------------------------
 * Thin wrapper around jsonwebtoken for signing & verifying tokens.
 * The secret and expiry are pulled from environment variables.
 */

"use strict";

const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";
const JWT_REMEMBER_EXPIRES_IN = process.env.JWT_REMEMBER_EXPIRES_IN || "7d";

if (!JWT_SECRET) {
  // Fail fast: a missing secret is a critical misconfiguration.
  console.error("❌ JWT_SECRET is not set. Define it in your .env file.");
}

/**
 * Signs a JWT for an authenticated user.
 * @param {object} payload - e.g. { id, role, email }
 * @param {boolean} remember - longer expiry when "remember me" is checked
 * @returns {string}
 */
function signToken(payload, remember = false) {
  const expiresIn = remember ? JWT_REMEMBER_EXPIRES_IN : JWT_EXPIRES_IN;
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Verifies a JWT and returns its decoded payload.
 * Throws if invalid/expired.
 * @param {string} token
 * @returns {object}
 */
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { signToken, verifyToken };
