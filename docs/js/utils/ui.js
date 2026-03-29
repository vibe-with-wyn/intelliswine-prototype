window.AppUi = (() => {
  function setAlert(element, message, type, options = {}) {
    if (!element) {
      return;
    }
    element.textContent = message;
    if (options.linkText && options.linkHref) {
      const space = document.createTextNode(' ');
      const link = document.createElement('a');
      link.href = options.linkHref;
      link.className = 'form-link-primary';
      link.textContent = options.linkText;
      element.appendChild(space);
      element.appendChild(link);
    }
    element.classList.remove('is-error', 'is-success', 'is-warning');
    if (type === 'error') {
      element.classList.add('is-error');
    }
    if (type === 'warning') {
      element.classList.add('is-warning');
    }
    if (type === 'success') {
      element.classList.add('is-success');
    }
  }

  function setLoading(button, isLoading) {
    if (!button) {
      return;
    }
    button.disabled = isLoading;
    button.classList.toggle('is-loading', isLoading);
  }

  return {
    setAlert,
    setLoading
  };
})();
