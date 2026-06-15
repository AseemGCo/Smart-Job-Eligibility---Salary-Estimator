/**
 * controllers/auth.controller.js
 * ------------------------------------------------------------
 * Thin HTTP layer for authentication endpoints. Delegates all
 * logic to AuthService and formats responses consistently.
 */

"use strict";

const AuthService = require("../services/auth.service");
const { success } = require("../utils/apiResponse");

const AuthController = {
  /** POST /api/auth/register */
  async register(req, res, next) {
    try {
      const { name, email, password } = req.body;
      const result = await AuthService.register({ name, email, password });
      return success(res, result, "Account created successfully.", 201);
    } catch (err) {
      next(err);
    }
  },

  /** POST /api/auth/login */
  async login(req, res, next) {
    try {
      const { email, password, remember } = req.body;
      const result = await AuthService.login({ email, password, remember: Boolean(remember) });
      return success(res, result, "Logged in successfully.");
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/auth/logout
   * JWT is stateless, so logout is primarily client-side (drop the
   * token). This endpoint confirms the action for a clean UX.
   */
  async logout(req, res) {
    return success(res, null, "Logged out successfully.");
  },

  /** GET /api/auth/profile (protected) */
  async profile(req, res, next) {
    try {
      const user = await AuthService.profile(req.user.id);
      return success(res, { user }, "Profile loaded.");
    } catch (err) {
      next(err);
    }
  },
};

module.exports = AuthController;
