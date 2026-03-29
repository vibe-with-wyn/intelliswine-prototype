window.AppAuthStorage = (() => {
  const AUTH_TOKEN_KEY = 'authToken';
  const AUTH_USER_KEY = 'authUser';

  function getToken() {
    return window.localStorage.getItem(AUTH_TOKEN_KEY);
  }

  function setToken(token) {
    if (token) {
      window.localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      window.localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  }

  function getUser() {
    const raw = window.localStorage.getItem(AUTH_USER_KEY);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw);
    } catch (err) {
      return null;
    }
  }

  function setUser(user) {
    if (!user) {
      window.localStorage.removeItem(AUTH_USER_KEY);
      return;
    }
    window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  }

  function clear() {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    window.localStorage.removeItem(AUTH_USER_KEY);
  }

  function storeAuth(response) {
    if (!response?.token) {
      return;
    }
    setToken(response.token);
    setUser({
      id: response.userId,
      email: response.email,
      firstName: response.firstName,
      lastName: response.lastName,
      role: response.role,
      farmId: response.farmId,
      farmName: response.farmName
    });
  }

  return {
    getToken,
    setToken,
    getUser,
    setUser,
    clear,
    storeAuth
  };
})();
