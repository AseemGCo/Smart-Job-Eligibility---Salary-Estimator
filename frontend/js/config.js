/**
 * js/config.js
 * ------------------------------------------------------------
 * Central frontend configuration. Auto-detects the API base URL:
 *   - On localhost  -> http://localhost:4000/api
 *   - In production  -> value of window.__API_BASE__ (set below)
 *
 * 👉 After deploying the backend (Render/Railway), set
 *    PROD_API_BASE to your backend URL, e.g.
 *    "https://talentscope-api.onrender.com/api"
 */

(function () {
  "use strict";

  // EDIT THIS after deploying your backend:
  const PROD_API_BASE = "https://YOUR-BACKEND-URL.onrender.com/api";

  const host = window.location.hostname;
  const isLocal = host === "localhost" || host === "127.0.0.1" || host === "";

  window.APP_CONFIG = {
    API_BASE: isLocal ? "http://localhost:4000/api" : PROD_API_BASE,
    TOKEN_KEY: "talentscope.token",
    USER_KEY: "talentscope.user",
    THEME_KEY: "talentscope.theme",
  };
})();
