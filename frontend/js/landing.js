/**
 * js/landing.js
 * ------------------------------------------------------------
 * Landing page: toggles guest vs authenticated CTAs and theme.
 */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    window.UI.initTheme();
    window.UI.setYear();

    const authed = window.Auth.isAuthenticated();
    document.querySelectorAll("[data-guest]").forEach((el) => { el.hidden = authed; });
    document.querySelectorAll("[data-auth]").forEach((el) => { el.hidden = !authed; });
  });
})();
