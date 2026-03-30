/**
 * Sidebar Component JavaScript
 * Handles sidebar interactions: toggle, active state, user profile
 */

window.AppSidebar = (() => {
  const Dom = window.AppDom;
  const Auth = window.AppAuthStorage;

  /**
   * Initialize sidebar component
   * Sets up event listeners for sidebar toggle and active state
   */
  function init() {
    setupSidebarToggle();
    setActiveLink();
    hydrateUserProfile();
    setupLogout();
  }

  /**
   * Setup sidebar toggle button
   */
  function setupSidebarToggle() {
    const toggle = Dom.query('#sidebarToggle');
    const sidebar = Dom.query('#sidebar');

    if (!toggle || !sidebar) return;

    Dom.on(toggle, 'click', () => {
      Dom.toggleClass(sidebar, 'open');
    });
  }

  /**
   * Set active link based on current page
   * Compares current URL with sidebar links
   */
  function setActiveLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
    const sidebarLinks = Dom.queryAll('.sidebar-link');

    sidebarLinks.forEach((link) => {
      const href = Dom.getAttr(link, 'href');
      if (href && href.includes(currentPage)) {
        Dom.addClass(link, 'active');
      } else {
        Dom.removeClass(link, 'active');
      }
    });
  }

  /**
   * Hydrate sidebar footer profile from stored auth user
   */
  function hydrateUserProfile() {
    const user = Auth?.getUser?.();
    if (!user) return;

    const profileAvatar = Dom.query('#sidebarProfileAvatar');
    const profileName = Dom.query('#sidebarProfileName');
    const profileEmail = Dom.query('#sidebarProfileEmail');

    if (profileAvatar && user.firstName) {
      const initials = (user.firstName[0] + (user.lastName?.[0] || '')).toUpperCase();
      Dom.text(profileAvatar, initials);
    }

    if (profileName && user.firstName) {
      Dom.text(profileName, `${user.firstName} ${user.lastName || ''}`.trim());
    }

    if (profileEmail && user.email) {
      Dom.text(profileEmail, user.email);
    }
  }

  /**
   * Setup sidebar sign out button
   */
  function setupLogout() {
    const logoutBtn = Dom.query('#sidebarSignOutBtn');
    if (!logoutBtn || !Auth) return;

    Dom.on(logoutBtn, 'click', () => {
      Auth.clear();
      window.location.href = '../../login.html';
    });
  }

  return {
    init
  };
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.AppSidebar.init();
});
