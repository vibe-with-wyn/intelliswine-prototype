/**
 * Navbar Component JavaScript
 * Handles navbar interactions: profile dropdown, search, notifications
 */

window.AppNavbar = (() => {
  const Dom = window.AppDom;

  /**
   * Initialize navbar component
   * Sets up event listeners for interactive elements
   */
  function init() {
    setupSearch();
    setupMobileSearchToggle();
    setupStartBatchAction();
  }

  /**
   * Setup search field functionality
   */
  function setupSearch() {
    const searchInput = Dom.query('.search-field input');
    if (!searchInput) return;

    Dom.on(searchInput, 'input', (e) => {
      const query = e.target.value.toLowerCase();
      // TODO: Implement search functionality
      console.log('Search query:', query);
    });
  }

  function setupMobileSearchToggle() {
    const toggle = Dom.query('#mobileSearchToggle');
    const navbarActions = Dom.query('.navbar-actions');
    const searchInput = Dom.query('.search-field input');

    if (!toggle || !navbarActions) return;

    const mobileQuery = window.matchMedia('(max-width: 768px)');

    const closeSearch = () => {
      Dom.removeClass(navbarActions, 'search-open');
      toggle.setAttribute('aria-expanded', 'false');
    };

    const openSearch = () => {
      Dom.addClass(navbarActions, 'search-open');
      toggle.setAttribute('aria-expanded', 'true');
      searchInput?.focus();
    };

    Dom.on(toggle, 'click', (event) => {
      if (!mobileQuery.matches) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      if (Dom.hasClass(navbarActions, 'search-open')) {
        closeSearch();
      } else {
        openSearch();
      }
    });

    document.addEventListener('click', (event) => {
      if (!mobileQuery.matches) {
        return;
      }

      if (!navbarActions.contains(event.target)) {
        closeSearch();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeSearch();
      }
    });

    const handleViewportChange = () => {
      if (!mobileQuery.matches) {
        closeSearch();
      }
    };

    if (typeof mobileQuery.addEventListener === 'function') {
      mobileQuery.addEventListener('change', handleViewportChange);
    } else {
      mobileQuery.addListener(handleViewportChange);
    }
  }

  function setupStartBatchAction() {
    const startBatchBtn = Dom.query('#startBatchBtn');
    if (!startBatchBtn) return;

    Dom.on(startBatchBtn, 'click', (event) => {
      const modal = document.getElementById('startBatchModal');
      if (modal && window.AppBatchModal?.open) {
        event.preventDefault();
        window.AppBatchModal.open();
        return;
      }

      window.localStorage.setItem('openStartBatchModal', 'true');
      window.location.href = 'dashboard.html';
    });
  }

  return {
    init
  };
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.AppNavbar.init();
});
