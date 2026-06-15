/**
 * js/admin.js
 * ------------------------------------------------------------
 * Admin dashboard: platform-wide stats + management of ALL
 * candidates (view, search, filter, delete). Admin-only — guarded
 * by requireAdmin().
 */

(function () {
  "use strict";

  const { $, toast, animateCount, escapeHtml, debounce } = window.UI;

  let cache = [];

  function statusInfo(c) {
    if (c.priority_status) return { label: "Priority", cls: "pill pill-orange" };
    if (c.eligibility === "Eligible") return { label: "Eligible", cls: "pill pill-green" };
    return { label: "Not Eligible", cls: "pill pill-red" };
  }

  async function loadStats() {
    const stats = await window.API.get("/dashboard/stats");
    animateCount($("#statUsers"), stats.totalUsers || 0);
    animateCount($("#statTotal"), stats.totalCandidates);
    animateCount($("#statEligible"), stats.eligibleCandidates);
    animateCount($("#statPriority"), stats.priorityCandidates);
    animateCount($("#statAvg"), stats.averageSkillScore);
  }

  function buildQuery() {
    const search = $("#searchInput").value.trim();
    const filter = $("#filterSelect").value;
    const sort = $("#sortSelect").value;
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filter && filter !== "all") params.set("filter", filter);
    if (sort) params.set("sort", sort);
    const qs = params.toString();
    return qs ? `?${qs}` : "";
  }

  async function loadCandidates() {
    const loader = $("#adminLoader");
    const wrap = $("#adminWrap");
    const empty = $("#adminEmpty");
    loader.hidden = false; wrap.hidden = true; empty.hidden = true;

    try {
      const data = await window.API.get(`/candidates${buildQuery()}`);
      const list = data.candidates || [];
      cache = list;
      $("#adminCount").textContent = `${list.length} candidate${list.length === 1 ? "" : "s"}`;

      loader.hidden = true;
      if (list.length === 0) { empty.hidden = false; return; }

      let html = "";
      list.forEach((c, i) => {
        const s = statusInfo(c);
        html += `
          <tr>
            <td>${i + 1}</td>
            <td><span class="pill pill-blue">${escapeHtml(c.owner_name || ("#" + c.user_id))}</span></td>
            <td>${escapeHtml(c.candidate_name)}</td>
            <td>${c.age}</td>
            <td>${escapeHtml(c.education)}</td>
            <td>${c.skill_score}</td>
            <td>${c.projects}</td>
            <td>${escapeHtml(c.salary_text)}</td>
            <td>${escapeHtml(c.confidence_level)}</td>
            <td>${c.ranking_score}</td>
            <td><span class="${s.cls}">${s.label}</span></td>
            <td><button class="icon-btn danger" data-del="${c.id}" title="Delete">🗑️</button></td>
          </tr>`;
      });
      $("#adminBody").innerHTML = html;
      wrap.hidden = false;

      document.querySelectorAll("[data-del]").forEach((b) =>
        b.addEventListener("click", () => removeCandidate(Number(b.dataset.del))));
    } catch (err) {
      loader.hidden = true;
      toast(err.message, "error");
    }
  }

  async function removeCandidate(id) {
    const c = cache.find((x) => x.id === id);
    if (!c) return;
    if (!window.confirm(`Delete "${c.candidate_name}" (owner: ${c.owner_name || c.user_id})?`)) return;
    try {
      await window.API.del(`/candidates/${id}`);
      toast("Candidate deleted.", "info");
      await Promise.all([loadStats(), loadCandidates()]);
    } catch (err) {
      toast(err.message, "error");
    }
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const user = window.Auth.requireAdmin();
    if (!user) return;
    window.Auth.initAppChrome("admin");

    $("#searchInput").addEventListener("input", debounce(loadCandidates, 350));
    $("#filterSelect").addEventListener("change", loadCandidates);
    $("#sortSelect").addEventListener("change", loadCandidates);

    try {
      await Promise.all([loadStats(), loadCandidates()]);
    } catch (err) {
      toast(err.message, "error");
    }
  });
})();
