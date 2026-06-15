/**
 * controllers/candidate.controller.js
 * ------------------------------------------------------------
 * HTTP layer for candidate CRUD. All routes are protected; the
 * service enforces ownership (admins may access everything).
 */

"use strict";

const { CandidateService } = require("../services/candidate.service");
const { success } = require("../utils/apiResponse");

const CandidateController = {
  /** GET /api/candidates */
  async list(req, res, next) {
    try {
      const data = await CandidateService.list({ user: req.user, query: req.query });
      return success(res, { candidates: data, count: data.length }, "Candidates loaded.");
    } catch (err) {
      next(err);
    }
  },

  /** GET /api/candidates/:id */
  async getOne(req, res, next) {
    try {
      const candidate = await CandidateService.getOne({ user: req.user, id: req.params.id });
      return success(res, { candidate }, "Candidate loaded.");
    } catch (err) {
      next(err);
    }
  },

  /** POST /api/candidates */
  async create(req, res, next) {
    try {
      const candidate = await CandidateService.create({ user: req.user, input: req.body });
      return success(res, { candidate }, "Candidate evaluated and saved.", 201);
    } catch (err) {
      next(err);
    }
  },

  /** PUT /api/candidates/:id */
  async update(req, res, next) {
    try {
      const candidate = await CandidateService.update({
        user: req.user,
        id: req.params.id,
        input: req.body,
      });
      return success(res, { candidate }, "Candidate updated.");
    } catch (err) {
      next(err);
    }
  },

  /** DELETE /api/candidates/:id */
  async remove(req, res, next) {
    try {
      await CandidateService.remove({ user: req.user, id: req.params.id });
      return success(res, null, "Candidate deleted.");
    } catch (err) {
      next(err);
    }
  },
};

module.exports = CandidateController;
