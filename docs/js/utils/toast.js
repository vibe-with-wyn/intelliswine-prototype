/**
 * Toast Notification System - Display non-blocking alerts
 * Provides methods to show temporary notifications to users
 * Integrated with IntelliSwine design system
 */

window.AppToast = (() => {
  const toastId = 'app-toast-container';
  const defaultDuration = 4000; // 4 seconds default
  const iconMap = {
    success: '<svg class="toast-icon-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"></circle><path d="M8.5 12.2l2.3 2.3 4.7-4.8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
    error: '<svg class="toast-icon-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"></circle><path d="M9.2 9.2l5.6 5.6M14.8 9.2l-5.6 5.6" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>',
    info: '<svg class="toast-icon-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"></circle><path d="M12 10.8v5.2" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><circle cx="12" cy="7.8" r="1.1" fill="currentColor"></circle></svg>',
    warning: '<svg class="toast-icon-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3.8l8.2 14.2c.5.9-.1 2-1.1 2H4.9c-1 0-1.6-1.1-1.1-2L12 3.8z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path><path d="M12 9v4.8" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><circle cx="12" cy="16.9" r="1.1" fill="currentColor"></circle></svg>'
  };

  /**
   * Ensure toast container exists and CSS is loaded
   */
  function ensureContainer() {
    let container = document.getElementById(toastId);
    if (!container) {
      // Create container
      container = document.createElement('div');
      container.id = toastId;
      document.body.appendChild(container);

      // Load CSS if not already loaded
      if (!document.getElementById('toast-css')) {
        const link = document.createElement('link');
        link.id = 'toast-css';
        link.rel = 'stylesheet';
        link.href = '../../css/components/toast.css';
        document.head.appendChild(link);
      }
    }
    return container;
  }

  /**
   * Create toast element with improved design
   * @param {string} message - Toast message text
   * @param {string} type - Toast type: 'success', 'error', 'info', 'warning'
   * @param {Object} options - Additional options
   * @returns {HTMLElement} Toast element
   */
  function createToastElement(message, type = 'info', options = {}) {
    const toast = document.createElement('div');
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    toast.id = id;
    toast.className = `toast toast-${type}`;

    const icon = iconMap[type] || iconMap.info;
    const isArrowAction = options.actionText?.trim() === '→';
    const actionClass = isArrowAction ? 'toast-action toast-action-arrow' : 'toast-action';
    const actionAriaLabel = options.actionAriaLabel || (isArrowAction ? 'Open dashboard' : options.actionText);
    
    // Build action button HTML if provided
    let actionHtml = '';
    if (options.actionText && options.onAction) {
      actionHtml = `
        <button class="${actionClass}" type="button" aria-label="${actionAriaLabel}">
          ${options.actionText}
        </button>
      `;
    }

    // Build progress bar (optional)
    let progressHtml = '';
    if (options.showProgress) {
      progressHtml = '<div class="toast-progress"></div>';
    }

    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-icon">
          ${icon}
        </span>
        <div class="toast-message">${escapeHtml(message)}</div>
      </div>
      ${actionHtml}
      ${progressHtml}
    `;

    // Attach event handlers
    if (options.actionText && options.onAction) {
      const actionBtn = toast.querySelector('.toast-action');
      actionBtn.addEventListener('click', () => {
        options.onAction();
        removeToast(id, true);
      });
    }

    return toast;
  }

  /**
   * Escape HTML to prevent XSS
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Remove toast with animation
   * @param {string} id - Toast ID to remove
   * @param {boolean} immediate - Skip animation
   */
  function removeToast(id, immediate = false) {
    const toast = document.getElementById(id);
    if (toast) {
      if (immediate) {
        toast.classList.add('closing');
        setTimeout(() => toast.remove(), 250);
      } else {
        toast.remove();
      }
    }
  }

  /**
   * Show success toast
   * @param {string} message - Message text
   * @param {Object} options - Options: actionText, onAction, duration, showClose, showProgress
   */
  function success(message, options = {}) {
    const container = ensureContainer();
    const toast = createToastElement(message, 'success', options);
    container.appendChild(toast);

    const duration = options.duration !== undefined ? options.duration : defaultDuration;
    if (duration > 0) {
      setTimeout(() => removeToast(toast.id), duration);
    }

    return toast.id;
  }

  /**
   * Show error toast
   * @param {string} message - Message text
   * @param {Object} options - Options: actionText, onAction, duration, showClose, showProgress
   */
  function error(message, options = {}) {
    const container = ensureContainer();
    const toast = createToastElement(message, 'error', options);
    container.appendChild(toast);

    const duration = options.duration !== undefined ? options.duration : defaultDuration;
    if (duration > 0) {
      setTimeout(() => removeToast(toast.id), duration);
    }

    return toast.id;
  }

  /**
   * Show info toast
   * @param {string} message - Message text
   * @param {Object} options - Options: actionText, onAction, duration, showClose, showProgress
   */
  function info(message, options = {}) {
    const container = ensureContainer();
    const toast = createToastElement(message, 'info', options);
    container.appendChild(toast);

    const duration = options.duration !== undefined ? options.duration : defaultDuration;
    if (duration > 0) {
      setTimeout(() => removeToast(toast.id), duration);
    }

    return toast.id;
  }

  /**
   * Show warning toast
   * @param {string} message - Message text
   * @param {Object} options - Options: actionText, onAction, duration, showClose, showProgress
   */
  function warning(message, options = {}) {
    const container = ensureContainer();
    const toast = createToastElement(message, 'warning', options);
    container.appendChild(toast);

    const duration = options.duration !== undefined ? options.duration : defaultDuration;
    if (duration > 0) {
      setTimeout(() => removeToast(toast.id), duration);
    }

    return toast.id;
  }

  /**
   * Dismiss a specific toast by ID
   * @param {string} id - Toast ID
   */
  function dismiss(id) {
    removeToast(id, true);
  }

  /**
   * Dismiss all toasts
   */
  function dismissAll() {
    const container = document.getElementById(toastId);
    if (container) {
      const toasts = container.querySelectorAll('.toast');
      toasts.forEach(toast => toast.remove());
    }
  }

  return {
    success,
    error,
    info,
    warning,
    dismiss,
    dismissAll
  };
})();
