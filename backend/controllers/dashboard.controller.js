/**
 * controllers/dashboard.controller.js
 * ------------------------------------------------------------
 * Aggregated analytics. Regular users get stats scoped to their
 * own candidates; admins get platform-wide stats + user count.
 */

"use strict";

const CandidateModel = require("../models/candidate.model");
const UserModel = require("../models/user.model");
const { hydrate } = require("../services/candidate.service");
const { success } = require("../utils/apiResponse");

const DashboardController = {
  /** GET /api/dashboard/stats */
  async stats(req, res, next) {
    try {
      const isAdmin = req.user.role === "admin";
      const scope = isAdmin ? null : req.user.id;

      const base = await CandidateModel.stats(scope);
      const topRow = await CandidateModel.topPerformer(scope);

      const payload = {
        scope: isAdmin ? "global" : "user",
        totalCandidates: Number(base.totalCandidates),
        eligibleCandidates: Number(base.eligibleCandidates),
        priorityCandidates: Number(base.priorityCandidates),
        averageSkillScore: Number(base.averageSkillScore),
        topPerformer: topRow ? hydrate(topRow) : null,
      };

      // Admins also see the total number of registered users.
      if (isAdmin) {
        payload.totalUsers = await UserModel.countAll();
      }

      return success(res, payload, "Dashboard stats loaded.");
    } catch (err) {
      next(err);
    }
  },
};

module.exports = DashboardController;
