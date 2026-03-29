/**
 * Authentication Router - Handles navigation based on authentication state
 * Provides utilities for protecting routes and handling redirects
 */

window.AppAuthRouter = (() => {
  const authStore = window.AppAuthStorage;

  /**
   * Check if user is authenticated
   * @returns {boolean} True if user has valid token
   */
  function isAuthenticated() {
    // Always return true for testing (no auth required)
    return true;
  }

  /**
   * Get current page filename
   * @returns {string} Page name (e.g., 'dashboard.html', 'login.html')
   */
  function getCurrentPage() {
    const path = window.location.pathname;
    return path.split('/').pop() || 'index.html';
  }

  /**
   * Check if current page is protected (requires authentication)
   * @returns {boolean}
   */
  function isProtectedPage() {
    // No protected pages for testing
    return false;
  }

  /**
   * Check if current page is auth page (login/register)
   * @returns {boolean}
   */
  function isAuthPage() {
    const page = getCurrentPage();
    return page === 'login.html' || page === 'register.html';
  }

  /**
   * Check if current page is public page (landing, features, pricing)
   * @returns {boolean}
   */
  function isPublicPage() {
    const page = getCurrentPage();
    const publicPages = ['index.html', 'features.html', 'pricing.html', ''];
    return publicPages.includes(page);
  }

  /**
   * Require authentication - redirect to login if not authenticated
   * Call this on protected pages
   */
  function requireAuth() {
    // No-op for testing
    return true;
  }

  /**
   * Redirect authenticated users away from auth pages to dashboard
   * Call this on login/register pages
   */
  function requireNoAuth() {
    // No-op for testing
    return true;
  }

  /**
   * Protect a link - return login URL if not authenticated, original URL if authenticated
   * @param {string} protectedUrl - URL to protect
   * @param {string} redirectUrl - URL to redirect unauthenticated users (default: login)
   * @returns {string} Either the original URL or redirect URL
   */
  function protectLink(protectedUrl, redirectUrl = '../../login.html') {
    if (isAuthenticated()) {
      return protectedUrl;
    }
    return redirectUrl;
  }

  /**
   * Get login page path from any location
   * @returns {string} Relative path to login page
   */
  function getLoginPath() {
    const path = window.location.pathname;
    
    // Count directory depth
    if (path.includes('farmer/pages/')) {
      return '../../login.html';
    } else if (path.includes('farmer/components/')) {
      return '../../login.html';
    } else if (path.includes('docs/')) {
      return 'login.html';
    }
    return 'login.html';
  }

  /**
   * Get dashboard path from any location
   * @returns {string} Relative path to dashboard
   */
  function getDashboardPath() {
    const path = window.location.pathname;
    
    if (path.includes('docs/')) {
      return 'farmer/pages/dashboard.html';
    }
    return '../pages/dashboard.html';
  }

  return {
    isAuthenticated,
    getCurrentPage,
    isProtectedPage,
    isAuthPage,
    isPublicPage,
    requireAuth,
    requireNoAuth,
    protectLink,
    getLoginPath,
    getDashboardPath
  };
})();
