/**
 * Component Loader System - Handles component injection into pages
 * Loads HTML components and manages component lifecycle
 */

window.AppComponentLoader = (() => {
  const Dom = window.AppDom;
  const componentCache = {};

  /**
   * Load HTML component from file
   * @param {string} componentPath - Path to component HTML file
   * @returns {Promise<string>} HTML content of component
   */
  async function loadComponent(componentPath) {
    if (componentCache[componentPath]) {
      return componentCache[componentPath];
    }

    try {
      const response = await fetch(componentPath);
      if (!response.ok) {
        throw new Error(`Failed to load component: ${componentPath}`);
      }
      const html = await response.text();
      componentCache[componentPath] = html;
      return html;
    } catch (error) {
      console.error('Component loading error:', error);
      throw error;
    }
  }

  /**
   * Inject component into container element
   * @param {HTMLElement|string} container - Container element or selector
   * @param {string} componentPath - Path to component file
   * @param {Object} data - Optional data to pass to component
   * @returns {Promise<HTMLElement>}
   */
  async function injectComponent(container, componentPath, data = {}) {
    const containerEl = typeof container === 'string' 
      ? Dom.query(container) 
      : container;

    if (!containerEl) {
      throw new Error('Container element not found');
    }

    try {
      const html = await loadComponent(componentPath);
      const processedHtml = processTemplate(html, data);
      containerEl.innerHTML = processedHtml;
      return containerEl;
    } catch (error) {
      console.error('Component injection error:', error);
      throw error;
    }
  }

  /**
   * Process template string with data substitution
   * Supports simple {{variableName}} syntax
   * @param {string} template - HTML template
   * @param {Object} data - Data object for substitution
   * @returns {string} Processed HTML
   */
  function processTemplate(template, data = {}) {
    if (!data || Object.keys(data).length === 0) {
      return template;
    }

    let html = template;
    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      html = html.replace(regex, value);
    });
    return html;
  }

  /**
   * Initialize all components on a page
   * Looks for data-component attributes and loads them
   * @example <div data-component="navbar" data-component-path="components/navbar.html"></div>
   * @returns {Promise<void>}
   */
  async function initializePageComponents() {
    const componentElements = Dom.queryAll('[data-component]');

    const promises = componentElements.map(async (el) => {
      const componentName = Dom.getAttr(el, 'data-component');
      const componentPath = Dom.getAttr(el, 'data-component-path');
      const dataStr = Dom.getAttr(el, 'data-component-data');
      
      if (!componentPath) {
        console.warn(`Component "${componentName}" missing data-component-path`);
        return;
      }

      try {
        const data = dataStr ? JSON.parse(dataStr) : {};
        await injectComponent(el, componentPath, data);
      } catch (error) {
        console.error(`Error initializing component "${componentName}":`, error);
      }
    });

    await Promise.all(promises);
  }

  /**
   * Clear component cache (useful for development)
   * @param {string} componentPath - Optional specific component path to clear
   */
  function clearCache(componentPath) {
    if (componentPath) {
      delete componentCache[componentPath];
    } else {
      Object.keys(componentCache).forEach(key => {
        delete componentCache[key];
      });
    }
  }

  /**
   * Register component initialization callback
   * Allows components to run setup code after being injected
   * @param {string} componentName - Name of component
   * @param {Function} initFunction - Initialization function
   */
  const componentInitializers = {};

  function registerComponentInit(componentName, initFunction) {
    componentInitializers[componentName] = initFunction;
  }

  /**
   * Call component initializer if registered
   * @param {string} componentName - Component name
   * @param {HTMLElement} componentElement - Component DOM element
   */
  function initComponent(componentName, componentElement) {
    const initializer = componentInitializers[componentName];
    if (initializer && typeof initializer === 'function') {
      initializer(componentElement);
    }
  }

  return {
    loadComponent,
    injectComponent,
    processTemplate,
    initializePageComponents,
    clearCache,
    registerComponentInit,
    initComponent
  };
})();
