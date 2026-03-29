window.AppMessages = (() => {
  const GENERIC_NETWORK = 'Network error. Please check your connection and try again.';

  async function parseJsonSafe(response) {
    try {
      return await response.json();
    } catch (err) {
      return null;
    }
  }

  function extractBackendMessage(data) {
    if (!data) {
      return '';
    }

    if (typeof data === 'string') {
      return data;
    }

    if (Array.isArray(data.errors) && data.errors.length > 0) {
      const first = data.errors[0];
      if (typeof first === 'string') {
        return first;
      }
      if (first?.defaultMessage) {
        return String(first.defaultMessage);
      }
      if (first?.message) {
        return String(first.message);
      }
    }

    if (data.message) {
      return String(data.message);
    }

    if (data.error) {
      return String(data.error);
    }

    if (data.detail) {
      return String(data.detail);
    }

    return '';
  }

  function humanize(status, backendMessage, context) {
    const normalized = (backendMessage || '').toLowerCase();

    if (status === 429) {
      return {
        message: 'Too many attempts. Please wait a few minutes and try again.',
        tone: 'warning'
      };
    }

    if (status === 401) {
      if (context === 'login') {
        return { message: 'Invalid email or password.', tone: 'warning' };
      }
      return { message: 'Your session expired. Please log in again.', tone: 'warning' };
    }

    if (status === 403) {
      return { message: 'You do not have permission to do that.', tone: 'error' };
    }

    if (status === 400) {
      if (context === 'login') {
        return { message: 'Invalid email or password.', tone: 'warning' };
      }
      if (context === 'changePassword' && normalized.includes('current password')) {
        return { message: 'Your current password is incorrect.', tone: 'warning' };
      }
      if (normalized.includes('password')) {
        return { message: 'Your password does not meet the requirements.', tone: 'warning' };
      }
      if (normalized.includes('email') && (normalized.includes('exists') || normalized.includes('already'))) {
        return { message: 'That email is already registered.', tone: 'warning' };
      }
      return { message: 'Please check your details and try again.', tone: 'warning' };
    }

    if (status >= 500) {
      return { message: 'Server error. Please try again shortly.', tone: 'error' };
    }

    if (backendMessage) {
      return { message: backendMessage, tone: 'warning' };
    }

    return { message: 'Request failed. Please try again.', tone: 'error' };
  }

  return {
    GENERIC_NETWORK,
    parseJsonSafe,
    extractBackendMessage,
    humanize
  };
})();
