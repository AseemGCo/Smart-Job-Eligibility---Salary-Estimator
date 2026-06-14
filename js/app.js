/* ============================================================
   Smart Job Eligibility & Salary Estimator — app.js
   ------------------------------------------------------------
   Pure Vanilla JavaScript. No frameworks, no libraries.

   This file intentionally demonstrates core JS fundamentals:
     • Variables & Data Types       • Loops (for / for..of / forEach / reduce)
     • Operators                    • Functions (declarations + arrow fns)
     • Conditional Statements       • Arrays & Objects
     • DOM Manipulation             • Event Handling
     • Form Validation              • Local Storage persistence
     • Clean, modular code structure with separation of concerns
   ============================================================ */

"use strict";

/* ============================================================
   SECTION 1 — CONSTANTS & CONFIGURATION (Variables / Objects / Arrays)
   ============================================================ */

// Local Storage key used to persist the candidate pool.
const STORAGE_KEY = "talentscope.candidates";
const THEME_KEY = "talentscope.theme";

// Business-rule thresholds kept in one place for easy maintenance.
const RULES = Object.freeze({
  MIN_AGE: 18,
  MIN_SKILL: 60,
  MIN_PROJECTS: 2,
  PRIORITY_SKILL: 80,
  PRIORITY_PROJECTS: 3,
});

// Salary bands as an array of objects (data-driven business logic).
const SALARY_BANDS = [
  { min: 60, max: 70, low: 4, high: 6 },
  { min: 71, max: 85, low: 6, high: 10 },
  { min: 86, max: 100, low: 10, high: 18 },
];

// Status constants — avoids "magic strings" sprinkled across the code.
const STATUS = Object.freeze({
  PRIORITY: "Priority Candidate",
  ELIGIBLE: "Eligible",
  NOT_ELIGIBLE: "Not Eligible",
});

/* ============================================================
   SECTION 2 — DOM REFERENCES (cached once for performance)
   ============================================================ */

const $ = (selector) => document.querySelector(selector);
const $all = (selector) => document.querySelectorAll(selector);

const els = {
  form: $("#candidateForm"),
  // inputs
  name: $("#name"),
  age: $("#age"),
  education: $("#education"),
  relocate: $("#relocate"),
  skill: $("#skill"),
  skillOut: $("#skillOut"),
  projects: $("#projects"),
  // result panel
  resultPanel: $("#resultPanel"),
  resultTimestamp: $("#resultTimestamp"),
  statusBadge: $("#statusBadge"),
  rankChip: $("#rankChip"),
  salaryValue: $("#salaryValue"),
  confidenceValue: $("#confidenceValue"),
  skillMeter: $("#skillMeter"),
  skillMeterLabel: $("#skillMeterLabel"),
  confMeter: $("#confMeter"),
  confMeterLabel: $("#confMeterLabel"),
  suggestionList: $("#suggestionList"),
  saveBtn: $("#saveBtn"),
  downloadBtn: $("#downloadBtn"),
  // dashboard
  statTotal: $("#statTotal"),
  statEligible: $("#statEligible"),
  statPriority: $("#statPriority"),
  statAvgScore: $("#statAvgScore"),
  topPerformer: $("#topPerformer"),
  topPerformerName: $("#topPerformerName"),
  topPerformerMeta: $("#topPerformerMeta"),
  // history
  historyBody: $("#historyBody"),
  historyCount: $("#historyCount"),
  emptyState: $("#emptyState"),
  searchInput: $("#searchInput"),
  sortSelect: $("#sortSelect"),
  exportAllBtn: $("#exportAllBtn"),
  clearAllBtn: $("#clearAllBtn"),
  exportSingleBtn: $("#downloadBtn"),
  // misc
  themeToggle: $("#themeToggle"),
  toast: $("#toast"),
  year: $("#year"),
};

// Holds the most recent evaluation so "Save" / "Download" can reuse it.
let currentEvaluation = null;

/* ============================================================
   SECTION 3 — CORE BUSINESS LOGIC (Required functions)
   ============================================================ */

/**
 * checkEligibility — applies the eligibility & priority business rules.
 * Demonstrates: conditional statements, comparison & logical operators.
 * @param {object} c - candidate input data
 * @returns {string} one of STATUS.*
 */
function checkEligibility(c) {
  // Hard gate: below minimum skill OR under age => not eligible.
  if (c.skill < RULES.MIN_SKILL || c.age < RULES.MIN_AGE || c.projects < RULES.MIN_PROJECTS) {
    return STATUS.NOT_ELIGIBLE;
  }

  // Eligible at this point. Check whether they also qualify as priority.
  const isPriority = c.skill >= RULES.PRIORITY_SKILL && c.projects >= RULES.PRIORITY_PROJECTS;
  return isPriority ? STATUS.PRIORITY : STATUS.ELIGIBLE;
}

/**
 * calculateSalary — returns an estimated salary range based on skill band,
 * then applies relocation & postgraduate bonuses.
 * Demonstrates: loops, arrays of objects, arithmetic operators.
 * @param {object} c - candidate input data
 * @returns {{low:number, high:number, text:string}}
 */
function calculateSalary(c) {
  // Below the minimum band => no salary estimate.
  if (c.skill < RULES.MIN_SKILL) {
    return { low: 0, high: 0, text: "Not Applicable" };
  }

  // Find the matching band using a loop (loop requirement #1).
  let band = null;
  for (let i = 0; i < SALARY_BANDS.length; i++) {
    const b = SALARY_BANDS[i];
    if (c.skill >= b.min && c.skill <= b.max) {
      band = b;
      break;
    }
  }

  // Defensive fallback (should not happen for valid scores).
  if (!band) {
    return { low: 0, high: 0, text: "Not Applicable" };
  }

  let low = band.low;
  let high = band.high;

  // Bonus rule: willing to relocate => +1 LPA to both ends.
  if (c.relocate === "Yes") {
    low += 1;
    high += 1;
  }

  // Bonus rule: postgraduate => +1 LPA to both ends.
  if (c.education === "Postgraduate") {
    low += 1;
    high += 1;
  }

  return { low, high, text: `₹${low}-${high} LPA` };
}

/**
 * calculateConfidence — derives a confidence label & percentage from projects.
 * Demonstrates: conditional statements, ternary-free branching.
 * @param {object} c - candidate input data
 * @returns {{level:string, percent:number}}
 */
function calculateConfidence(c) {
  if (c.projects >= 4) {
    return { level: "High", percent: 90 };
  } else if (c.projects >= 2) {
    return { level: "Medium", percent: 60 };
  } else {
    return { level: "Low", percent: 30 };
  }
}

/**
 * calculateRankingScore — standout feature.
 * Formula: (Skill Score × 0.7) + (Projects × 5)
 * Demonstrates: arithmetic operators, number rounding.
 * @param {object} c
 * @returns {number}
 */
function calculateRankingScore(c) {
  const score = c.skill * 0.7 + c.projects * 5;
  return Math.round(score * 10) / 10; // 1 decimal place
}

/**
 * buildSuggestions — returns an array of personalized improvement tips.
 * Demonstrates: arrays, push(), conditional logic.
 * @param {object} c
 * @returns {string[]}
 */
function buildSuggestions(c) {
  const tips = [];

  if (c.age < RULES.MIN_AGE) {
    tips.push("Not eligible due to minimum age requirement (must be 18+).");
  }
  if (c.skill < RULES.MIN_SKILL) {
    tips.push("Improve JavaScript fundamentals and build more projects.");
  } else if (c.skill < RULES.PRIORITY_SKILL) {
    tips.push("Push your JS skill score above 80 to qualify as a priority candidate.");
  }
  if (c.projects < RULES.MIN_PROJECTS) {
    tips.push("Complete at least 2 practical projects to become eligible.");
  } else if (c.projects < RULES.PRIORITY_PROJECTS) {
    tips.push("Build one more project to reach priority status and boost confidence.");
  }
  if (c.relocate === "No" && c.skill >= RULES.MIN_SKILL) {
    tips.push("Consider relocation — it adds ₹1 LPA to your estimated salary.");
  }
  if (c.education !== "Postgraduate" && c.skill >= RULES.MIN_SKILL) {
    tips.push("A postgraduate qualification can add ₹1 LPA to your salary estimate.");
  }

  // If everything is strong, celebrate it.
  if (tips.length === 0) {
    tips.push("Excellent profile! You meet all priority criteria — keep it up. 🚀");
  }
  return tips;
}

/**
 * generateReport — produces a full evaluation object combining all logic.
 * This is the single source of truth used by the UI, history and exports.
 * Demonstrates: object composition, function reuse, Date/data types.
 * @param {object} input - raw candidate input
 * @returns {object} evaluation report
 */
function generateReport(input) {
  const status = checkEligibility(input);
  const salary = calculateSalary(input);
  const confidence = calculateConfidence(input);
  const ranking = calculateRankingScore(input);
  const suggestions = buildSuggestions(input);

  return {
    id: Date.now(), // unique id (number)
    name: input.name,
    age: input.age,
    education: input.education,
    relocate: input.relocate,
    skill: input.skill,
    projects: input.projects,
    status: status,
    salary: salary,
    confidence: confidence,
    ranking: ranking,
    suggestions: suggestions,
    createdAt: new Date().toISOString(),
  };
}

/* ============================================================
   SECTION 4 — LOCAL STORAGE PERSISTENCE
   ============================================================ */

/**
 * loadCandidateHistory — reads & parses the candidate pool from Local Storage.
 * Demonstrates: Local Storage, JSON parsing, error handling, arrays.
 * @returns {object[]}
 */
function loadCandidateHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Failed to load candidate history:", err);
    return [];
  }
}

/**
 * persist — writes the candidate pool back to Local Storage.
 * @param {object[]} list
 */
function persist(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error("Failed to save candidate history:", err);
    showToast("Storage error — could not save data.", "error");
  }
}

/**
 * saveCandidate — appends a report to the stored pool and refreshes the UI.
 * Demonstrates: array spread, Local Storage persistence.
 * @param {object} report
 */
function saveCandidate(report) {
  const list = loadCandidateHistory();
  list.push(report);
  persist(list);
  renderDashboard();
  renderHistory();
  showToast(`Saved "${report.name}" to history.`, "success");
}

/**
 * deleteCandidate — removes one candidate by id.
 * Demonstrates: Array.filter, immutability.
 * @param {number} id
 */
function deleteCandidate(id) {
  const list = loadCandidateHistory().filter((c) => c.id !== id);
  persist(list);
  renderDashboard();
  renderHistory();
  showToast("Candidate removed.", "info");
}

/* ============================================================
   SECTION 5 — STATISTICS (Loops over the candidate pool)
   ============================================================ */

/**
 * computeStats — aggregates dashboard analytics using loops.
 * Demonstrates: for..of loop, reduce, accumulation, averages.
 * @param {object[]} list
 * @returns {object}
 */
function computeStats(list) {
  let total = list.length;
  let eligible = 0;
  let priority = 0;
  let scoreSum = 0;

  // Classic for..of loop accumulating counts (loop requirement #2).
  for (const c of list) {
    scoreSum += Number(c.skill) || 0;
    if (c.status === STATUS.ELIGIBLE || c.status === STATUS.PRIORITY) {
      eligible++;
    }
    if (c.status === STATUS.PRIORITY) {
      priority++;
    }
  }

  const avgScore = total > 0 ? Math.round(scoreSum / total) : 0;

  return { total, eligible, priority, avgScore };
}

/**
 * findTopPerformer — returns the candidate with the highest ranking score.
 * Demonstrates: reduce, comparison logic.
 * @param {object[]} list
 * @returns {object|null}
 */
function findTopPerformer(list) {
  if (list.length === 0) return null;
  return list.reduce((top, c) => (c.ranking > top.ranking ? c : top), list[0]);
}

/* ============================================================
   SECTION 6 — RENDERING / DOM MANIPULATION
   ============================================================ */

/**
 * renderDashboard — paints the four stat cards + top-performer banner.
 */
function renderDashboard() {
  const list = loadCandidateHistory();
  const stats = computeStats(list);

  // Animated count-up for a polished feel.
  animateCount(els.statTotal, stats.total);
  animateCount(els.statEligible, stats.eligible);
  animateCount(els.statPriority, stats.priority);
  animateCount(els.statAvgScore, stats.avgScore);

  const top = findTopPerformer(list);
  if (top) {
    els.topPerformer.hidden = false;
    els.topPerformerName.textContent = top.name;
    els.topPerformerMeta.textContent =
      `Rank ${top.ranking} · Skill ${top.skill} · ${top.projects} projects · ${top.salary.text}`;
  } else {
    els.topPerformer.hidden = true;
  }
}

/**
 * getFilteredSorted — applies search + sort to the candidate pool.
 * Demonstrates: array filter, sort, switch statement.
 * @returns {object[]}
 */
function getFilteredSorted() {
  let list = loadCandidateHistory();

  // Search by name (case-insensitive).
  const query = els.searchInput.value.trim().toLowerCase();
  if (query) {
    list = list.filter((c) => c.name.toLowerCase().includes(query));
  }

  // Sort according to the selected criteria.
  const sortBy = els.sortSelect.value;
  switch (sortBy) {
    case "skill":
      list.sort((a, b) => b.skill - a.skill);
      break;
    case "salary":
      list.sort((a, b) => b.salary.high - a.salary.high);
      break;
    case "projects":
      list.sort((a, b) => b.projects - a.projects);
      break;
    case "rank":
      list.sort((a, b) => b.ranking - a.ranking);
      break;
    case "recent":
    default:
      list.sort((a, b) => b.id - a.id);
      break;
  }
  return list;
}

/**
 * statusPillClass — maps a status string to a CSS pill class.
 * @param {string} status
 * @returns {string}
 */
function statusPillClass(status) {
  if (status === STATUS.PRIORITY) return "pill pill-orange";
  if (status === STATUS.ELIGIBLE) return "pill pill-green";
  return "pill pill-red";
}

/**
 * renderHistory — builds the candidate table using a loop.
 * Demonstrates: loops, DOM creation, template strings, conditional classes.
 */
function renderHistory() {
  const list = getFilteredSorted();
  const fullList = loadCandidateHistory();
  const top = findTopPerformer(fullList);

  els.historyCount.textContent = `${fullList.length} candidate${fullList.length === 1 ? "" : "s"}`;

  // Toggle the empty state.
  if (fullList.length === 0) {
    els.emptyState.hidden = false;
  } else {
    els.emptyState.hidden = true;
  }

  // Build rows. Using a string accumulator inside a loop, then a single
  // DOM write for performance (loop requirement #3).
  let rowsHtml = "";
  for (let i = 0; i < list.length; i++) {
    const c = list[i];
    const isTop = top && c.id === top.id;
    rowsHtml += `
      <tr class="${isTop ? "top-row" : ""}">
        <td>${i + 1}${isTop ? " 🏆" : ""}</td>
        <td>${escapeHtml(c.name)}</td>
        <td>${c.age}</td>
        <td>${escapeHtml(c.education)}</td>
        <td><span class="pill pill-blue">${c.skill}</span></td>
        <td>${c.projects}</td>
        <td>${c.salary.text}</td>
        <td>${c.confidence.level}</td>
        <td>${c.ranking}</td>
        <td><span class="${statusPillClass(c.status)}">${c.status}</span></td>
        <td><button class="row-delete" data-id="${c.id}" title="Delete">🗑️</button></td>
      </tr>`;
  }

  els.historyBody.innerHTML = rowsHtml;

  // Attach delete handlers (event handling on dynamic elements).
  const deleteButtons = $all(".row-delete");
  deleteButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.getAttribute("data-id"));
      deleteCandidate(id);
    });
  });
}

/**
 * renderResult — paints the evaluation panel for a single candidate.
 * Demonstrates: DOM manipulation, color-coding, meters, suggestions loop.
 * @param {object} report
 */
function renderResult(report) {
  els.resultPanel.hidden = false;

  // Timestamp
  const date = new Date(report.createdAt);
  els.resultTimestamp.textContent = `Evaluated on ${date.toLocaleString()}`;

  // Status badge with color coding.
  els.statusBadge.textContent = report.status;
  els.statusBadge.className = "status-badge"; // reset
  if (report.status === STATUS.PRIORITY) {
    els.statusBadge.classList.add("status-priority");
  } else if (report.status === STATUS.ELIGIBLE) {
    els.statusBadge.classList.add("status-eligible");
  } else {
    els.statusBadge.classList.add("status-not");
  }

  // Ranking chip
  els.rankChip.textContent = `Rank Score: ${report.ranking}`;

  // Salary & confidence values
  els.salaryValue.textContent = report.salary.text;
  els.confidenceValue.textContent = report.confidence.level;

  // Skill meter
  els.skillMeter.style.width = `${report.skill}%`;
  els.skillMeterLabel.textContent = `${report.skill}/100`;

  // Confidence meter
  els.confMeter.style.width = `${report.confidence.percent}%`;
  els.confMeterLabel.textContent = `${report.confidence.percent}%`;

  // Suggestions list — built with a loop (loop requirement #4).
  els.suggestionList.innerHTML = "";
  for (const tip of report.suggestions) {
    const li = document.createElement("li");
    li.textContent = tip;
    els.suggestionList.appendChild(li);
  }

  // Smooth scroll the result into view.
  els.resultPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

/* ============================================================
   SECTION 7 — FORM VALIDATION
   ============================================================ */

/**
 * readForm — collects & type-casts the form values into a clean object.
 * Demonstrates: data types, type coercion, object literal.
 * @returns {object}
 */
function readForm() {
  return {
    name: els.name.value.trim(),
    age: parseInt(els.age.value, 10),
    education: els.education.value,
    relocate: els.relocate.value,
    skill: parseInt(els.skill.value, 10),
    projects: parseInt(els.projects.value, 10),
  };
}

/**
 * setFieldError — shows/clears a validation message for a single field.
 * @param {string} fieldId
 * @param {string} message
 */
function setFieldError(fieldId, message) {
  const errEl = document.querySelector(`[data-error-for="${fieldId}"]`);
  const field = document.getElementById(fieldId)?.closest(".field");
  if (errEl) errEl.textContent = message;
  if (field) field.classList.toggle("invalid", Boolean(message));
}

/**
 * validateForm — validates all inputs and reports field-level errors.
 * Demonstrates: form validation, conditionals, boolean logic.
 * @param {object} data
 * @returns {boolean} true when valid
 */
function validateForm(data) {
  let valid = true;

  // Reset previous errors.
  ["name", "age", "education", "relocate", "skill", "projects"].forEach((f) =>
    setFieldError(f, "")
  );

  if (!data.name || data.name.length < 2) {
    setFieldError("name", "Please enter a valid name (min 2 characters).");
    valid = false;
  }
  if (Number.isNaN(data.age) || data.age < 14 || data.age > 80) {
    setFieldError("age", "Enter a valid age between 14 and 80.");
    valid = false;
  }
  if (!data.education) {
    setFieldError("education", "Please select an education level.");
    valid = false;
  }
  if (!data.relocate) {
    setFieldError("relocate", "Please choose Yes or No.");
    valid = false;
  }
  if (Number.isNaN(data.skill) || data.skill < 0 || data.skill > 100) {
    setFieldError("skill", "Skill score must be 0–100.");
    valid = false;
  }
  if (Number.isNaN(data.projects) || data.projects < 0) {
    setFieldError("projects", "Enter the number of projects (0 or more).");
    valid = false;
  }

  return valid;
}

/* ============================================================
   SECTION 8 — REPORT EXPORT (Download as text file)
   ============================================================ */

/**
 * formatReportText — turns a report object into a readable text report.
 * Demonstrates: template strings, arrays, loops (for suggestions).
 * @param {object} r
 * @returns {string}
 */
function formatReportText(r) {
  const divider = "=".repeat(54);
  let suggestionLines = "";
  r.suggestions.forEach((tip, i) => {
    suggestionLines += `  ${i + 1}. ${tip}\n`;
  });

  return (
`${divider}
   SMART JOB ELIGIBILITY & SALARY ESTIMATOR — REPORT
${divider}

Candidate Name : ${r.name}
Age            : ${r.age}
Education      : ${r.education}
Relocate       : ${r.relocate}
Generated      : ${new Date(r.createdAt).toLocaleString()}

------------------------------------------------------
  EVALUATION SUMMARY
------------------------------------------------------
Status            : ${r.status}
JS Skill Score    : ${r.skill}/100
Projects          : ${r.projects}
Estimated Salary  : ${r.salary.text}
Confidence Level  : ${r.confidence.level} (${r.confidence.percent}%)
Ranking Score     : ${r.ranking}

------------------------------------------------------
  IMPROVEMENT SUGGESTIONS
------------------------------------------------------
${suggestionLines}
${divider}
   Generated by TalentScope · JavaScript Power Challenge
${divider}
`
  );
}

/**
 * downloadTextFile — triggers a client-side file download.
 * Demonstrates: Blob, URL.createObjectURL, DOM, cleanup.
 * @param {string} filename
 * @param {string} content
 */
function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * exportAllCandidates — builds a combined report of every candidate.
 * Demonstrates: loops over the pool, statistics, string building.
 */
function exportAllCandidates() {
  const list = loadCandidateHistory();
  if (list.length === 0) {
    showToast("No candidates to export yet.", "info");
    return;
  }

  const stats = computeStats(list);
  const top = findTopPerformer(list);
  const divider = "=".repeat(54);

  let body = `${divider}\n   TALENTSCOPE — FULL CANDIDATE EXPORT\n${divider}\n\n`;
  body += `Total Candidates : ${stats.total}\n`;
  body += `Eligible         : ${stats.eligible}\n`;
  body += `Priority         : ${stats.priority}\n`;
  body += `Average Skill    : ${stats.avgScore}\n`;
  body += `Top Performer    : ${top ? `${top.name} (Rank ${top.ranking})` : "—"}\n\n`;
  body += `${divider}\n\n`;

  // Loop over every candidate and append a mini-report.
  list.forEach((c, idx) => {
    body += `#${idx + 1}  ${c.name}\n`;
    body += `    Status: ${c.status} | Skill: ${c.skill} | Projects: ${c.projects}\n`;
    body += `    Salary: ${c.salary.text} | Confidence: ${c.confidence.level} | Rank: ${c.ranking}\n\n`;
  });

  downloadTextFile("talentscope-all-candidates.txt", body);
  showToast("Exported all candidates.", "success");
}

/* ============================================================
   SECTION 9 — UI HELPERS
   ============================================================ */

let toastTimer = null;

/**
 * showToast — small non-blocking notification.
 * @param {string} message
 * @param {string} type - success | error | info
 */
function showToast(message, type = "info") {
  els.toast.textContent = message;
  els.toast.className = `toast show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    els.toast.className = "toast";
  }, 2800);
}

/**
 * animateCount — animates a number from its current value to a target.
 * Demonstrates: loops via requestAnimationFrame, easing, number handling.
 * @param {HTMLElement} el
 * @param {number} target
 */
function animateCount(el, target) {
  const start = parseInt(el.textContent, 10) || 0;
  const duration = 500;
  const startTime = performance.now();

  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const value = Math.round(start + (target - start) * eased);
    el.textContent = value;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/**
 * escapeHtml — prevents HTML injection when rendering user input.
 * Demonstrates: error-safe DOM practices.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = String(str);
  return div.innerHTML;
}

/**
 * applyTheme — toggles light/dark and persists the choice.
 * @param {string} theme - "light" | "dark"
 */
function applyTheme(theme) {
  if (theme === "light") {
    document.body.classList.add("light");
    els.themeToggle.firstChild.textContent = "☀️ ";
  } else {
    document.body.classList.remove("light");
    els.themeToggle.firstChild.textContent = "🌙 ";
  }
  localStorage.setItem(THEME_KEY, theme);
}

/* ============================================================
   SECTION 10 — EVENT HANDLERS (Event Handling)
   ============================================================ */

/**
 * handleEvaluate — main form submit handler.
 * @param {Event} e
 */
function handleEvaluate(e) {
  e.preventDefault();

  const data = readForm();
  if (!validateForm(data)) {
    showToast("Please fix the highlighted fields.", "error");
    return;
  }

  // Generate the report and remember it for save/download actions.
  currentEvaluation = generateReport(data);
  renderResult(currentEvaluation);
  showToast("Evaluation complete!", "success");
}

/**
 * handleSave — persists the current evaluation to history.
 */
function handleSave() {
  if (!currentEvaluation) {
    showToast("Evaluate a candidate first.", "info");
    return;
  }
  saveCandidate(currentEvaluation);
}

/**
 * handleDownloadSingle — downloads the current evaluation as a text report.
 */
function handleDownloadSingle() {
  if (!currentEvaluation) {
    showToast("Evaluate a candidate first.", "info");
    return;
  }
  const safeName = currentEvaluation.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  downloadTextFile(`report-${safeName}.txt`, formatReportText(currentEvaluation));
  showToast("Report downloaded.", "success");
}

/**
 * handleClearAll — wipes the candidate pool from Local Storage.
 */
function handleClearAll() {
  const list = loadCandidateHistory();
  if (list.length === 0) {
    showToast("History is already empty.", "info");
    return;
  }
  const ok = window.confirm(`Delete all ${list.length} saved candidates? This cannot be undone.`);
  if (!ok) return;
  localStorage.removeItem(STORAGE_KEY);
  renderDashboard();
  renderHistory();
  showToast("All candidate history cleared.", "info");
}

/**
 * handleReset — clears the form, errors and hides the result panel.
 */
function handleReset() {
  setTimeout(() => {
    els.skillOut.textContent = els.skill.value;
    ["name", "age", "education", "relocate", "skill", "projects"].forEach((f) =>
      setFieldError(f, "")
    );
    els.resultPanel.hidden = true;
    currentEvaluation = null;
  }, 0);
}

/**
 * bindEvents — wires up every event listener once at startup.
 * Demonstrates: event handling, separation of concerns.
 */
function bindEvents() {
  // Form submit / reset.
  els.form.addEventListener("submit", handleEvaluate);
  els.form.addEventListener("reset", handleReset);

  // Live skill slider readout.
  els.skill.addEventListener("input", () => {
    els.skillOut.textContent = els.skill.value;
  });

  // Result actions.
  els.saveBtn.addEventListener("click", handleSave);
  els.downloadBtn.addEventListener("click", handleDownloadSingle);

  // History toolbar.
  els.searchInput.addEventListener("input", renderHistory);
  els.sortSelect.addEventListener("change", renderHistory);
  els.exportAllBtn.addEventListener("click", exportAllCandidates);
  els.clearAllBtn.addEventListener("click", handleClearAll);

  // Theme toggle.
  els.themeToggle.addEventListener("click", () => {
    const next = document.body.classList.contains("light") ? "dark" : "light";
    applyTheme(next);
  });
}

/* ============================================================
   SECTION 11 — INITIALISATION (App entry point)
   ============================================================ */

/**
 * init — bootstraps the application after the DOM is ready.
 */
function init() {
  // Footer year.
  els.year.textContent = new Date().getFullYear();

  // Restore saved theme.
  const savedTheme = localStorage.getItem(THEME_KEY) || "dark";
  applyTheme(savedTheme);

  // Wire events and paint the initial UI from Local Storage.
  bindEvents();
  renderDashboard();
  renderHistory();

  console.log("%cTalentScope ready ✅", "color:#8b5cf6;font-weight:bold;");
}

// Kick things off once the DOM is parsed.
document.addEventListener("DOMContentLoaded", init);
