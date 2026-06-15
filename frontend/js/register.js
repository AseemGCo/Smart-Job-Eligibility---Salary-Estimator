/**
 * js/register.js
 * ------------------------------------------------------------
 * Registration logic: validation, password strength indicator,
 * confirm-password match, and API call.
 */

(function () {
  "use strict";

  const { toast, setLoading, setFieldError, clearErrors } = window.UI;

  /** Scores a password 0..4 and returns { score, label, color, percent }. */
  function scorePassword(pw) {
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    score = Math.min(score, 4);

    const levels = [
      { label: "Very weak", color: "#ef4444", percent: 20 },
      { label: "Weak", color: "#f59e0b", percent: 40 },
      { label: "Fair", color: "#eab308", percent: 60 },
      { label: "Good", color: "#22c55e", percent: 80 },
      { label: "Strong", color: "#16a34a", percent: 100 },
    ];
    return { score, ...levels[score] };
  }

  document.addEventListener("DOMContentLoaded", () => {
    window.Auth.requireGuest();
    window.UI.initTheme();

    const form = document.getElementById("registerForm");
    const btn = document.getElementById("registerBtn");
    const pw = document.getElementById("password");
    const strengthWrap = document.getElementById("strength");
    const strengthFill = document.getElementById("strengthFill");
    const strengthLabel = document.getElementById("strengthLabel");

    // Password show/hide toggles.
    document.querySelectorAll(".toggle-pw").forEach((tgl) => {
      tgl.addEventListener("click", () => {
        const input = document.getElementById(tgl.dataset.toggle);
        input.type = input.type === "password" ? "text" : "password";
      });
    });

    // Live strength meter.
    pw.addEventListener("input", () => {
      const val = pw.value;
      if (!val) { strengthWrap.hidden = true; return; }
      strengthWrap.hidden = false;
      const s = scorePassword(val);
      strengthFill.style.width = `${s.percent}%`;
      strengthFill.style.background = s.color;
      strengthLabel.textContent = s.label;
      strengthLabel.style.color = s.color;
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearErrors(["name", "email", "password", "confirm"]);

      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = pw.value;
      const confirm = document.getElementById("confirm").value;

      let ok = true;
      if (name.length < 2) { setFieldError("name", "Please enter your full name."); ok = false; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setFieldError("email", "Enter a valid email address."); ok = false; }
      if (password.length < 8) { setFieldError("password", "Password must be at least 8 characters."); ok = false; }
      if (confirm !== password) { setFieldError("confirm", "Passwords do not match."); ok = false; }
      if (!ok) return;

      setLoading(btn, true, "Creating account…");
      try {
        const data = await window.API.post("/auth/register", { name, email, password }, { auth: false });
        // Auto-login after successful registration.
        window.Auth.setSession(data.token, data.user, false);
        toast("Account created! Redirecting…", "success");
        setTimeout(() => window.location.replace("dashboard.html"), 600);
      } catch (err) {
        // Surface field-level errors if the API returned any.
        if (err.errors) {
          err.errors.forEach((er) => setFieldError(er.field, er.message));
        }
        toast(err.message, "error");
        setLoading(btn, false);
      }
    });
  });
})();
