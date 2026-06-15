/**
 * js/profile.js
 * ------------------------------------------------------------
 * Profile page: shows the authenticated user's details (from the
 * /auth/profile endpoint) and their personal activity stats.
 */

(function () {
  "use strict";

  const { $, toast, animateCount } = window.UI;

  function initials(name) {
    return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  }

  function formatDate(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const cached = window.Auth.requireAuth();
    if (!cached) return;
    window.Auth.initAppChrome("profile");

    try {
      // Always re-fetch the canonical profile from the server.
      const { user } = await window.API.get("/auth/profile");

      $("#avatar").textContent = initials(user.name);
      $("#profileName").textContent = user.name;
      $("#profileRole").textContent = user.role;
      $("#profileRole").className = `pill ${user.role === "admin" ? "pill-orange" : "pill-blue"}`;
      $("#rowName").textContent = user.name;
      $("#rowEmail").textContent = user.email;
      $("#rowRole").textContent = user.role === "admin" ? "Administrator" : "Regular User";
      $("#rowSince").textContent = formatDate(user.created_at);
      $("#rowId").textContent = `#${user.id}`;

      // Activity stats.
      const stats = await window.API.get("/dashboard/stats");
      animateCount($("#myTotal"), stats.totalCandidates);
      animateCount($("#myEligible"), stats.eligibleCandidates);
      animateCount($("#myPriority"), stats.priorityCandidates);
      animateCount($("#myAvg"), stats.averageSkillScore);
    } catch (err) {
      toast(err.message, "error");
    }
  });
})();
