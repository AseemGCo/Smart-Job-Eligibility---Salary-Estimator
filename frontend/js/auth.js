/**
 * js/auth.js
 * ------------------------------------------------------------
 * Client-side session management + route guards + app chrome.
 *   - Stores/reads JWT + user (local vs session storage based on
 *     the "remember me" choice).
 *   - requireAuth / requireGuest / requireAdmin guards.
 *   - Wires the shared appbar (user chip, logout, nav, theme).
 */

(function () {
  "use strict";

  const { TOKEN_KEY, USER_KEY } = window.APP_CONFIG;

  /* ---------- Session storage ---------- */

  /** Persists token + user. `remember` => localStorage, else sessionStorage. */
  function setSession(token, user, remember = false) {
    const store = remember ? localStorage : sessionStorage;
    const other = remember ? sessionStorage : localStorage;
    store.setItem(TOKEN_KEY, token);
    store.setItem(USER_KEY, JSON.stringify(user));
    // Ensure we don't keep a stale copy in the other store.
    other.removeItem(TOKEN_KEY);
    other.removeItem(USER_KEY);
  }

  function getToken() {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || null;
  }

  function getUser() {
    const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }

  function clearSession() {
    [localStorage, sessionStorage].forEach((s) => {
      s.removeItem(TOKEN_KEY);
      s.removeItem(USER_KEY);
    });
  }

  function isAuthenticated() {
    return Boolean(getToken());
  }

  /* ---------- Route guards ---------- */

  /** Redirect to login if not authenticated. Returns the user when ok. */
  function requireAuth() {
    if (!isAuthenticated()) {
      window.location.replace("login.html");
      return null;
    }
    return getUser();
  }

  /** Redirect already-logged-in users away from guest-only pages. */
  function requireGuest() {
    if (isAuthenticated()) {
      window.location.replace("dashboard.html");
    }
  }

  /** Redirect non-admins away from admin pages. */
  function requireAdmin() {
    const user = requireAuth();
    if (user && user.role !== "admin") {
      window.UI.toast("Admin access required.", "error");
      window.location.replace("dashboard.html");
      return null;
    }
    return user;
  }

  /* ---------- Logout ---------- */

  async function logout() {
    try {
      await window.API.post("/auth/logout", {});
    } catch {
      // Stateless JWT — even if the call fails, clear locally.
    } finally {
      clearSession();
      window.location.replace("login.html");
    }
  }

  /* ---------- App chrome (shared appbar) ---------- */

  /**
   * Initializes the shared app shell on protected pages:
   * sets the user chip, highlights the active nav link, reveals
   * admin-only elements, and binds logout + theme.
   */
  function initAppChrome(activePage) {
    const user = getUser();

    // User chip + greeting.
    const chip = document.getElementById("userChip");
    if (chip && user) chip.textContent = `👤 ${user.name}`;

    // Active nav link.
    document.querySelectorAll(".appnav-link").forEach((link) => {
      if (link.dataset.page === activePage) link.classList.add("active");
    });

    // Reveal admin-only elements.
    if (user && user.role === "admin") {
      document.querySelectorAll("[data-admin]").forEach((el) => { el.hidden = false; });
    }

    // Logout buttons (there may be more than one).
    document.querySelectorAll("#logoutBtn, #logoutBtn2").forEach((btn) =>
      btn.addEventListener("click", logout)
    );

    window.UI.initTheme();
    window.UI.setYear();
  }

  window.Auth = {
    setSession, getToken, getUser, clearSession, isAuthenticated,
    requireAuth, requireGuest, requireAdmin, logout, initAppChrome,
  };
})();
