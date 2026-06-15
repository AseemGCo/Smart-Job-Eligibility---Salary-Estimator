/**
 * middleware/auth.js
 * ------------------------------------------------------------
 * Authentication & authorization middleware.
 *   - authenticate: validates the JWT and attaches req.user
 *   - requireAdmin: restricts a route to admin role
 */

"use strict";

const { verifyToken } = require("../utils/jwt");
const { fail } = require("../utils/apiResponse");

/**
 * Validates the Bearer token in the Authorization header.
 * On success, attaches the decoded payload to req.user.
 */
function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return fail(res, "Authentication required. Please log in.", 401);
  }

  try {
    const decoded = verifyToken(token);
    req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
    return next();
  } catch (err) {
    return fail(res, "Invalid or expired session. Please log in again.", 401);
  }
}

/**
 * Allows only admin users through. Must run AFTER authenticate.
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return fail(res, "Admin access required.", 403);
  }
  return next();
}

module.exports = { authenticate, requireAdmin };
