window.AppApi = (() => {
  const API_BASE_KEY = 'apiBase';
  const DEFAULT_API_BASE = 'http://localhost:8080';

  function getApiBase() {
    return window.localStorage.getItem(API_BASE_KEY) || DEFAULT_API_BASE;
  }

  async function post(path, payload, context) {
    return request({ path, payload, context, requiresAuth: false });
  }

  // postAuth is disabled for testing (no auth required)
  async function postAuth(path, payload, context) {
    return request({ path, payload, context, requiresAuth: false });
  }

  async function request({ path, payload, context, requiresAuth }) {
    // Ignore requiresAuth for testing
    let response;
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      response = await fetch(`${getApiBase()}${path}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
    } catch (err) {
      const error = new Error(window.AppMessages?.GENERIC_NETWORK || 'Network error.');
      error.tone = 'warning';
      throw error;
    }

    if (response.status === 204) {
      return null;
    }

    if (response.ok) {
      return response.json();
    }

    const data = await window.AppMessages.parseJsonSafe(response);
    const backendMessage = window.AppMessages.extractBackendMessage(data);
    const errorInfo = window.AppMessages.humanize(response.status, backendMessage, context);
    const error = new Error(errorInfo.message);
    error.tone = errorInfo.tone;
    throw error;
  }

  return {
    getApiBase,
    post,
    postAuth
  };
})();
