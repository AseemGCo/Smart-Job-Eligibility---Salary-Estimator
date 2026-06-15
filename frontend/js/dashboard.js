/**
 * js/dashboard.js
 * ------------------------------------------------------------
 * Dashboard page: loads analytics + recent candidates.
 * Stats are scoped per-user (or platform-wide for admins).
 */

(function () {
  "use strict";

  const { $, toast, animateCount, escapeHtml } = window.UI;

  /** Maps a candidate to a status label + pill class. */
  function statusInfo(c) {
    if (c.priority_status) return { label: "Priority", cls: "pill pill-orange" };
    if (c.eligibility === "Eligible") return { label: "Eligible", cls: "pill pill-green" };
    return { label: "Not Eligible", cls: "pill pill-red" };
  }

  async function loadStats(user) {
    const stats = await window.API.get("/dashboard/stats");

    if (user.role === "admin") {
      animateCount($("#statUsers"), stats.totalUsers || 0);
      $("#scopeNote").textContent = "Platform-wide analytics across all users.";
    } else {
      $("#scopeNote").textContent = "Here's an overview of your candidate pool.";
    }

    animateCount($("#statTotal"), stats.totalCandidates);
    animateCount($("#statEligible"), stats.eligibleCandidates);
    animateCount($("#statPriority"), stats.priorityCandidates);
    animateCount($("#statAvg"), stats.averageSkillScore);

    // Top performer banner.
    const tp = stats.topPerformer;
    if (tp) {
      $("#topPerformerCard").hidden = false;
      $("#tpName").textContent = tp.candidate_name;
      $("#tpMeta").textContent =
        `Rank ${tp.ranking_score} · Skill ${tp.skill_score} · ${tp.projects} projects · ${tp.salary_text}`;
    }
  }

  async function loadRecent() {
    const loader = $("#recentLoader");
    const wrap = $("#recentTableWrap");
    const empty = $("#recentEmpty");
    const body = $("#recentBody");

    const data = await window.API.get("/candidates?sort=recent");
    const list = (data.candidates || []).slice(0, 6);

    loader.hidden = true;

    if (list.length === 0) {
      empty.hidden = false;
      return;
    }

    let html = "";
    for (const c of list) {
      const s = statusInfo(c);
      html += `
        <tr>
          <td>${escapeHtml(c.candidate_name)}</td>
          <td><span class="pill pill-blue">${c.skill_score}</span></td>
          <td>${c.projects}</td>
          <td>${escapeHtml(c.salary_text)}</td>
          <td>${escapeHtml(c.confidence_level)}</td>
          <td>${c.ranking_score}</td>
          <td><span class="${s.cls}">${s.label}</span></td>
        </tr>`;
    }
    body.innerHTML = html;
    wrap.hidden = false;
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const user = window.Auth.requireAuth();
    if (!user) return;

    window.Auth.initAppChrome("dashboard");
    $("#greetName").textContent = user.name.split(" ")[0];

    try {
      await Promise.all([loadStats(user), loadRecent()]);
    } catch (err) {
      toast(err.message, "error");
      $("#recentLoader").hidden = true;
    }
  });
})();
