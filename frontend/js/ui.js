/**
 * js/ui.js
 * ------------------------------------------------------------
 * Reusable UI helpers shared by every page:
 *   toast notifications, theme toggle, loading states, escaping,
 *   number animation, and small DOM utilities.
 */

(function () {
  "use strict";

  const { THEME_KEY } = window.APP_CONFIG;

  /* ---------- Tiny selectors ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $all = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------- Toast ---------- */
  let toastTimer = null;
  function toast(message, type = "info") {
    const el = $("#toast");
    if (!el) return;
    el.textContent = message;
    el.className = `toast show ${type}`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.className = "toast"; }, 3000);
  }

  /* ---------- HTML escaping (XSS-safe rendering) ---------- */
  function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = String(value == null ? "" : value);
    return div.innerHTML;
  }

  /* ---------- Button loading state ---------- */
  function setLoading(button, isLoading, loadingText = "Please wait…") {
    if (!button) return;
    if (isLoading) {
      button.dataset.originalHtml = button.innerHTML;
      button.disabled = true;
      button.innerHTML = `<span class="spinner"></span> ${escapeHtml(loadingText)}`;
    } else {
      button.disabled = false;
      if (button.dataset.originalHtml) button.innerHTML = button.dataset.originalHtml;
    }
  }

  /* ---------- Animated count-up ---------- */
  function animateCount(el, target) {
    if (!el) return;
    const start = parseInt(el.textContent, 10) || 0;
    const duration = 500;
    const startTime = performance.now();
    function step(now) {
      const p = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(start + (target - start) * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- Theme ---------- */
  function applyTheme(theme) {
    const isLight = theme === "light";
    document.body.classList.toggle("light", isLight);
    localStorage.setItem(THEME_KEY, isLight ? "light" : "dark");
    $all("#themeToggle").forEach((b) => { b.textContent = isLight ? "☀️" : "🌙"; });
  }

  function initTheme() {
    applyTheme(localStorage.getItem(THEME_KEY) || "dark");
    $all("#themeToggle").forEach((btn) =>
      btn.addEventListener("click", () => {
        applyTheme(document.body.classList.contains("light") ? "dark" : "light");
      })
    );
  }

  /* ---------- Debounce (for live search) ---------- */
  function debounce(fn, delay = 300) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  /* ---------- Field validation helpers ---------- */
  function setFieldError(fieldId, message) {
    const err = document.querySelector(`[data-error-for="${fieldId}"]`);
    const field = document.getElementById(fieldId)?.closest(".field");
    if (err) err.textContent = message || "";
    if (field) field.classList.toggle("invalid", Boolean(message));
  }

  function clearErrors(fieldIds) {
    fieldIds.forEach((id) => setFieldError(id, ""));
  }

  /* ---------- Download a text file ---------- */
  function downloadText(filename, content) {
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

  /* ---------- Footer year ---------- */
  function setYear() {
    const y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();
  }

  // Expose helpers globally.
  window.UI = {
    $, $all, toast, escapeHtml, setLoading, animateCount,
    applyTheme, initTheme, debounce, setFieldError, clearErrors,
    downloadText, setYear,
  };
})();
