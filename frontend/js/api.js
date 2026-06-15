/**
 * js/api.js
 * ------------------------------------------------------------
 * Thin fetch wrapper around the REST API.
 *   - Automatically attaches the JWT Bearer token.
 *   - Parses JSON and normalizes errors into thrown Error objects.
 *   - On 401, clears the session and redirects to login.
 */

(function () {
  "use strict";

  const { API_BASE, TOKEN_KEY } = window.APP_CONFIG;

  /** Reads the token from local/session storage. */
  function getToken() {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || null;
  }

  /**
   * Core request function.
   * @param {string} path - e.g. "/auth/login"
   * @param {object} options - { method, body, auth }
   * @returns {Promise<object>} parsed `data` payload
   */
  async function request(path, { method = "GET", body = null, auth = true } = {}) {
    const headers = { "Content-Type": "application/json" };

    if (auth) {
      const token = getToken();
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }

    let res;
    try {
      res = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (networkErr) {
      // Connection refused / CORS / offline.
      throw new Error("Cannot reach the server. Is the backend running?");
    }

    // Attempt to parse JSON (some responses may be empty).
    let payload = null;
    const text = await res.text();
    if (text) {
      try { payload = JSON.parse(text); } catch { payload = null; }
    }

    if (res.status === 401 && auth) {
      // Session expired/invalid — clean up and bounce to login.
      handleUnauthorized();
      throw new Error((payload && payload.message) || "Session expired. Please log in again.");
    }

    if (!res.ok || (payload && payload.success === false)) {
      const message = (payload && payload.message) || `Request failed (${res.status}).`;
      const err = new Error(message);
      err.status = res.status;
      err.errors = (payload && payload.errors) || null;
      throw err;
    }

    return payload ? payload.data : null;
  }

  /** Clears the session and redirects to login (avoids loops on auth pages). */
  function handleUnauthorized() {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(window.APP_CONFIG.USER_KEY);
    sessionStorage.removeItem(window.APP_CONFIG.USER_KEY);
    const page = window.location.pathname.split("/").pop();
    if (page !== "login.html" && page !== "register.html" && page !== "index.html") {
      window.location.href = "login.html";
    }
  }

  // Convenience verbs.
  window.API = {
    get: (path, opts) => request(path, { ...opts, method: "GET" }),
    post: (path, body, opts) => request(path, { ...opts, method: "POST", body }),
    put: (path, body, opts) => request(path, { ...opts, method: "PUT", body }),
    del: (path, opts) => request(path, { ...opts, method: "DELETE" }),
    request,
    getToken,
  };
})();
