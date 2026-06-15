/**
 * services/auth.service.js
 * ------------------------------------------------------------
 * Authentication business logic: registration, login, profile.
 * Handles bcrypt hashing and JWT issuance. Throws AppError on
 * invalid input so the controller can stay thin.
 */

"use strict";

const bcrypt = require("bcryptjs");
const UserModel = require("../models/user.model");
const { signToken } = require("../utils/jwt");
const { AppError } = require("../utils/apiResponse");

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 12);

/** Strips sensitive fields before returning a user to the client. */
function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
  };
}

const AuthService = {
  /** Registers a new user and returns { user, token }. */
  async register({ name, email, password }) {
    const existing = await UserModel.findByEmail(email);
    if (existing) {
      throw new AppError("An account with this email already exists.", 409);
    }

    // Hash the password — plain text is NEVER stored.
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const id = await UserModel.create({ name, email, password_hash, role: "user" });
    const user = await UserModel.findById(id);
    const token = signToken({ id: user.id, email: user.email, role: user.role });

    return { user: publicUser(user), token };
  },

  /** Validates credentials and returns { user, token }. */
  async login({ email, password, remember = false }) {
    const user = await UserModel.findByEmail(email);
    // Use a generic message to avoid leaking which part was wrong.
    if (!user) {
      throw new AppError("Invalid email or password.", 401);
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      throw new AppError("Invalid email or password.", 401);
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role }, remember);
    return { user: publicUser(user), token };
  },

  /** Returns the public profile for an authenticated user id. */
  async profile(id) {
    const user = await UserModel.findById(id);
    if (!user) throw new AppError("User not found.", 404);
    return publicUser(user);
  },
};

module.exports = AuthService;
