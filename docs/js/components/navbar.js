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
