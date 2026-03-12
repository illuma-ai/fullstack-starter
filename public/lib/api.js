/**
 * lib/api.js — API client.
 *
 * Wraps fetch() with:
 * - Automatic Authorization header from stored token
 * - JSON parsing
 * - Error handling with structured error messages
 */

window.ApiClient = (function() {
  var TOKEN_KEY = 'auth_token';

  function getToken() {
    try { return localStorage.getItem(TOKEN_KEY); } catch(e) { return null; }
  }

  function setToken(token) {
    try { if (token) localStorage.setItem(TOKEN_KEY, token); else localStorage.removeItem(TOKEN_KEY); } catch(e) {}
  }

  function clearToken() {
    try { localStorage.removeItem(TOKEN_KEY); } catch(e) {}
  }

  /**
   * Make an API request.
   * @param {string} path — API path (e.g., '/api/items')
   * @param {Object} options — fetch options
   * @returns {Promise<Object>} Parsed JSON response
   */
  async function request(path, options) {
    options = options || {};
    var headers = { 'Content-Type': 'application/json' };
    var token = getToken();
    if (token) {
      headers['Authorization'] = 'Bearer ' + token;
    }
    options.headers = Object.assign(headers, options.headers || {});

    var response = await fetch(path, options);
    var data;
    try {
      data = await response.json();
    } catch (e) {
      data = { error: 'Invalid response from server' };
    }

    if (!response.ok) {
      var err = new Error(data.error || 'Request failed');
      err.status = response.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  return {
    getToken: getToken,
    setToken: setToken,
    clearToken: clearToken,
    get: function(path) { return request(path, { method: 'GET' }); },
    post: function(path, body) { return request(path, { method: 'POST', body: JSON.stringify(body) }); },
    put: function(path, body) { return request(path, { method: 'PUT', body: JSON.stringify(body) }); },
    del: function(path) { return request(path, { method: 'DELETE' }); },
  };
})();
