/**
 * Toast Notification System - Display non-blocking alerts
 * Provides methods to show temporary notifications to users
 * Integrated with IntelliSwine design system
 */

window.AppToast = (() => {
  const toastId = 'app-toast-container';
  const defaultDuration = 4000; // 4 seconds default
  const iconMap = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    info: 'fa-info-circle',
    warning: 'fa-exclamation-triangle'
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
    
    // Build action button HTML if provided
    let actionHtml = '';
    if (options.actionText && options.onAction) {
      actionHtml = `
        <button class="toast-action" type="button" aria-label="${options.actionText}">
          ${options.actionText}
        </button>
      `;
    }

    // Build close button
    let closeHtml = '';
    if (options.showClose !== false) {
      closeHtml = `
        <button class="toast-close" type="button" aria-label="Close notification">
          <i class="fas fa-times"></i>
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
          <i class="fas ${icon}"></i>
        </span>
        <div class="toast-message">${escapeHtml(message)}</div>
      </div>
      ${actionHtml}
      ${closeHtml}
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

    if (options.showClose !== false) {
      const closeBtn = toast.querySelector('.toast-close');
      closeBtn.addEventListener('click', () => {
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
