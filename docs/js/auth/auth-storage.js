// AppAuthStorage is disabled for testing (no-op)
window.AppAuthStorage = (() => ({
  getToken: () => null,
  setToken: () => {},
  getUser: () => null,
  setUser: () => {},
  clear: () => {},
  storeAuth: () => {}
}))();
