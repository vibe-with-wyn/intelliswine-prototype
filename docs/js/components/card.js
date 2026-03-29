/**
 * Card Component JavaScript
 * Handles card interactions: expandable content, animations, etc.
 */

window.AppCard = (() => {
  const Dom = window.AppDom;

  /**
   * Initialize card component
   * Sets up event listeners for card interactions
   */
  function init() {
    setupCardInteractions();
  }

  /**
   * Setup card interactions (expandable cards, etc.)
   */
  function setupCardInteractions() {
    const cards = Dom.queryAll('.dashboard-card');

    cards.forEach((card) => {
      // Optional: Add click handlers for expandable cards
      card.addEventListener('click', (e) => {
        // Handle card-specific interactions here
        // Example: toggle expanded state
        const canExpand = Dom.getAttr(card, 'data-expandable');
        if (canExpand === 'true') {
          Dom.toggleClass(card, 'expanded');
        }
      });
    });
  }

  /**
   * Programmatically toggle card expansion
   * @param {string} cardSelector - CSS selector for card
   */
  function toggleExpanded(cardSelector) {
    const card = Dom.query(cardSelector);
    if (card) {
      Dom.toggleClass(card, 'expanded');
    }
  }

  return {
    init,
    toggleExpanded
  };
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.AppCard.init();
});
