/**
 * utils/apiResponse.js
 * ------------------------------------------------------------
 * Helpers for consistent JSON API responses + a typed AppError
 * so controllers can throw meaningful HTTP errors.
 */

"use strict";

/** Custom error carrying an HTTP status code. */
class AppError extends Error {
  constructor(message, statusCode = 400, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
  }
}

/** Standard success envelope. */
function success(res, data = null, message = "OK", statusCode = 200) {
  return res.status(statusCode).json({ success: true, message, data });
}

/** Standard error envelope. */
function fail(res, message = "Something went wrong", statusCode = 400, details = null) {
  const body = { success: false, message };
  if (details) body.errors = details;
  return res.status(statusCode).json(body);
}

module.exports = { AppError, success, fail };
