/**
 * middleware/errorHandler.js
 * ------------------------------------------------------------
 * Centralized 404 + error handling so controllers can simply
 * `throw new AppError(...)` or call `next(err)`.
 */

"use strict";

const { fail } = require("../utils/apiResponse");

/** 404 handler for unknown routes. */
function notFound(req, res) {
  return fail(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
}

/** Central error handler. */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Known MySQL duplicate-entry error => 409 Conflict.
  if (err && err.code === "ER_DUP_ENTRY") {
    return fail(res, "A record with that value already exists.", 409);
  }

  const status = err.statusCode || 500;
  const message = err.isOperational ? err.message : "Internal server error.";

  // Log full error server-side; never leak stack traces to clients.
  if (status >= 500) {
    console.error("💥 Unhandled error:", err);
  }

  return fail(res, message, status, err.details || null);
}

module.exports = { notFound, errorHandler };
