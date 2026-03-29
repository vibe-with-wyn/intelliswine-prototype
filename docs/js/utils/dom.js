/**
 * DOM Utilities - Simplified and safe DOM operations
 * Provides helper functions for common DOM manipulations
 */

window.AppDom = (() => {
  /**
   * Query selector wrapper with null-safe checks
   * @param {string} selector - CSS selector
   * @param {HTMLElement|Document} root - Context element (defaults to document)
   * @returns {HTMLElement|null}
   */
  function query(selector, root = document) {
    if (!selector) return null;
    return root.querySelector(selector);
  }

  /**
   * Query all and return as array
   * @param {string} selector - CSS selector
   * @param {HTMLElement|Document} root - Context element
   * @returns {HTMLElement[]}
   */
  function queryAll(selector, root = document) {
    if (!selector) return [];
    return Array.from(root.querySelectorAll(selector));
  }

  /**
   * Add event listener with optional delegation
   * @param {HTMLElement|string} element - Element or selector
   * @param {string} eventType - Event type (click, submit, etc)
   * @param {string|Function} handlerOrSelector - Handler function or delegation selector
   * @param {Function} handler - Handler function (if delegating)
   */
  function on(element, eventType, handlerOrSelector, handler) {
    const el = typeof element === 'string' ? query(element) : element;
    if (!el) return;

    if (typeof handlerOrSelector === 'function') {
      // Direct event listener
      el.addEventListener(eventType, handlerOrSelector);
    } else if (typeof handler === 'function') {
      // Event delegation
      el.addEventListener(eventType, (e) => {
        if (e.target.closest(handlerOrSelector)) {
          handler.call(e.target.closest(handlerOrSelector), e);
        }
      });
    }
  }

  /**
   * Toggle class on element
   * @param {HTMLElement|string} element - Element or selector
   * @param {string} className - Class name to toggle
   * @param {boolean} force - Force add (true) or remove (false)
   */
  function toggleClass(element, className, force) {
    const el = typeof element === 'string' ? query(element) : element;
    if (!el) return;
    
    if (force === undefined) {
      el.classList.toggle(className);
    } else {
      el.classList.toggle(className, force);
    }
  }

  /**
   * Add class to element
   * @param {HTMLElement|string} element - Element or selector
   * @param {string} className - Class name
   */
  function addClass(element, className) {
    const el = typeof element === 'string' ? query(element) : element;
    if (!el) return;
    el.classList.add(className);
  }

  /**
   * Remove class from element
   * @param {HTMLElement|string} element - Element or selector
   * @param {string} className - Class name
   */
  function removeClass(element, className) {
    const el = typeof element === 'string' ? query(element) : element;
    if (!el) return;
    el.classList.remove(className);
  }

  /**
   * Check if element has class
   * @param {HTMLElement|string} element - Element or selector
   * @param {string} className - Class name
   * @returns {boolean}
   */
  function hasClass(element, className) {
    const el = typeof element === 'string' ? query(element) : element;
    return el ? el.classList.contains(className) : false;
  }

  /**
   * Set or get text content
   * @param {HTMLElement|string} element - Element or selector
   * @param {string} text - Text to set (optional, if not provided returns current text)
   * @returns {string|void}
   */
  function text(element, text) {
    const el = typeof element === 'string' ? query(element) : element;
    if (!el) return '';
    
    if (text === undefined) {
      return el.textContent;
    }
    el.textContent = text;
  }

  /**
   * Set or get HTML content
   * @param {HTMLElement|string} element - Element or selector
   * @param {string} html - HTML to set (optional)
   * @returns {string|void}
   */
  function html(element, html) {
    const el = typeof element === 'string' ? query(element) : element;
    if (!el) return '';
    
    if (html === undefined) {
      return el.innerHTML;
    }
    el.innerHTML = html;
  }

  /**
   * Set multiple attributes on element
   * @param {HTMLElement|string} element - Element or selector
   * @param {Object} attrs - Attributes object {key: value}
   */
  function setAttrs(element, attrs) {
    const el = typeof element === 'string' ? query(element) : element;
    if (!el || !attrs) return;
    
    Object.entries(attrs).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        el.removeAttribute(key);
      } else {
        el.setAttribute(key, value);
      }
    });
  }

  /**
   * Get attribute value
   * @param {HTMLElement|string} element - Element or selector
   * @param {string} attr - Attribute name
   * @returns {string|null}
   */
  function getAttr(element, attr) {
    const el = typeof element === 'string' ? query(element) : element;
    return el ? el.getAttribute(attr) : null;
  }

  /**
   * Show element (remove display: none)
   * @param {HTMLElement|string} element - Element or selector
   */
  function show(element) {
    const el = typeof element === 'string' ? query(element) : element;
    if (!el) return;
    el.style.display = '';
  }

  /**
   * Hide element (add display: none)
   * @param {HTMLElement|string} element - Element or selector
   */
  function hide(element) {
    const el = typeof element === 'string' ? query(element) : element;
    if (!el) return;
    el.style.display = 'none';
  }

  /**
   * Check if element is visible (not hidden)
   * @param {HTMLElement|string} element - Element or selector
   * @returns {boolean}
   */
  function isVisible(element) {
    const el = typeof element === 'string' ? query(element) : element;
    if (!el) return false;
    return el.style.display !== 'none' && getComputedStyle(el).display !== 'none';
  }

  /**
   * Create element with optional class and content
   * @param {string} tag - Element tag name
   * @param {string} className - Optional class name
   * @param {string} content - Optional text content
   * @returns {HTMLElement}
   */
  function create(tag, className, content) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (content) el.textContent = content;
    return el;
  }

  /**
   * Remove element from DOM
   * @param {HTMLElement|string} element - Element or selector
   */
  function remove(element) {
    const el = typeof element === 'string' ? query(element) : element;
    if (el && el.parentNode) {
      el.parentNode.removeChild(el);
    }
  }

  /**
   * Get form data as object
   * @param {HTMLFormElement|string} form - Form element or selector
   * @returns {Object}
   */
  function getFormData(form) {
    const formEl = typeof form === 'string' ? query(form) : form;
    if (!formEl) return {};
    
    const data = new FormData(formEl);
    const obj = {};
    data.forEach((value, key) => {
      obj[key] = value;
    });
    return obj;
  }

  /**
   * Disable/Enable element
   * @param {HTMLElement|string} element - Element or selector
   * @param {boolean} disabled - True to disable, false to enable
   */
  function setDisabled(element, disabled) {
    const el = typeof element === 'string' ? query(element) : element;
    if (el) {
      el.disabled = disabled;
    }
  }

  return {
    query,
    queryAll,
    on,
    toggleClass,
    addClass,
    removeClass,
    hasClass,
    text,
    html,
    setAttrs,
    getAttr,
    show,
    hide,
    isVisible,
    create,
    remove,
    getFormData,
    setDisabled
  };
})();
