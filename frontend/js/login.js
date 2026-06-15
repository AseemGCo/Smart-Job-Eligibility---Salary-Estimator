/**
 * js/login.js
 * ------------------------------------------------------------
 * Login page logic: validation, password toggle, API call.
 */

(function () {
  "use strict";

  const { toast, setLoading, setFieldError, clearErrors } = window.UI;

  document.addEventListener("DOMContentLoaded", () => {
    window.Auth.requireGuest();   // redirect if already logged in
    window.UI.initTheme();

    const form = document.getElementById("loginForm");
    const btn = document.getElementById("loginBtn");

    // Password show/hide toggles.
    document.querySelectorAll(".toggle-pw").forEach((tgl) => {
      tgl.addEventListener("click", () => {
        const input = document.getElementById(tgl.dataset.toggle);
        input.type = input.type === "password" ? "text" : "password";
      });
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearErrors(["email", "password"]);

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const remember = document.getElementById("remember").checked;

      // Client-side validation.
      let ok = true;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setFieldError("email", "Enter a valid email address."); ok = false;
      }
      if (!password) { setFieldError("password", "Password is required."); ok = false; }
      if (!ok) return;

      setLoading(btn, true, "Logging in…");
      try {
        const data = await window.API.post("/auth/login", { email, password, remember }, { auth: false });
        window.Auth.setSession(data.token, data.user, remember);
        toast(`Welcome back, ${data.user.name}!`, "success");
        setTimeout(() => window.location.replace("dashboard.html"), 500);
      } catch (err) {
        toast(err.message, "error");
        setLoading(btn, false);
      }
    });
  });
})();
