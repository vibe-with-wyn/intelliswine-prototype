/**
 * Shared Form Handler - Reusable form submission logic
 * Centralizes common form handling patterns (validation, submission, state management)
 */

window.AppFormHandler = (() => {
  const Dom = window.AppDom;
  const Ui = window.AppUi;
  const Messages = window.AppMessages;
  
  /**
   * Handle form submission with loading state and error handling
   * @param {Object} config - Configuration object
   * @config {HTMLFormElement|string} config.form - Form element or selector
   * @config {Function} config.onSubmit - Callback function that makes the API call
   * @config {Function} config.onSuccess - Optional callback on success
   * @config {Function} config.onError - Optional callback on error
   * @config {string} config.submitBtnSelector - Optional submit button selector
   * @config {string} config.alertSelector - Optional alert message element selector
   * @returns {Promise}
   */
  function handleSubmit(config) {
    const {
      form,
      onSubmit,
      onSuccess,
      onError,
      submitBtnSelector = 'button[type="submit"]',
      alertSelector = '.form-alert'
    } = config;

    const formEl = typeof form === 'string' ? Dom.query(form) : form;
    const submitBtn = formEl ? Dom.query(submitBtnSelector, formEl) : null;
    const alertEl = formEl ? Dom.query(alertSelector, formEl) : null;

    if (!formEl) {
      console.error('Form element not found', form);
      return Promise.reject('Form not found');
    }

    // Prevent default form submission
    const handleFormSubmit = async (e) => {
      e.preventDefault();
      
      // Clear previous alerts
      if (alertEl) {
        Ui.setAlert(alertEl, '', '');
      }
      
      // Set button to loading state
      if (submitBtn) {
        Ui.setLoading(submitBtn, true);
      }

      try {
        // Call the submission handler
        const result = await onSubmit(Dom.getFormData(formEl));
        
        // Handle success
        if (alertEl) {
          Ui.setAlert(alertEl, 'Success!', 'success');
        }
        
        // Call optional success callback
        if (onSuccess) {
          await onSuccess(result);
        }
        
        return result;
      } catch (error) {
        // Extract error message
        const errorMessage = typeof error === 'string' 
          ? error 
          : Messages.humanize(error.status, Messages.extractBackendMessage(error.data), formEl);
        
        // Display error
        if (alertEl) {
          Ui.setAlert(alertEl, errorMessage, 'error');
        }
        
        // Call optional error callback
        if (onError) {
          onError(error);
        }
        
        console.error('Form submission error:', error);
      } finally {
        // Reset button state
        if (submitBtn) {
          Ui.setLoading(submitBtn, false);
        }
      }
    };

    // Attach event listener
    formEl.addEventListener('submit', handleFormSubmit);
    
    // Return cleanup function
    return () => {
      formEl.removeEventListener('submit', handleFormSubmit);
    };
  }

  /**
   * Validate form fields before submission
   * @param {Object} config - Configuration object
   * @config {HTMLFormElement|string} config.form - Form element or selector
   * @config {Object} config.rules - Validation rules {fieldName: validationFunction}
   * @returns {Object} { isValid: boolean, errors: Object }
   */
  function validateForm(config) {
    const { form, rules } = config;
    const formEl = typeof form === 'string' ? Dom.query(form) : form;
    
    if (!formEl) {
      return { isValid: false, errors: { form: 'Form not found' } };
    }

    const formData = Dom.getFormData(formEl);
    const errors = {};
    let isValid = true;

    Object.entries(rules).forEach(([fieldName, validatorFn]) => {
      const value = formData[fieldName] || '';
      const result = validatorFn(value, formData);
      
      if (result !== true) {
        errors[fieldName] = result;
        isValid = false;
      }
    });

    return { isValid, errors };
  }

  /**
   * Clear all form fields
   * @param {HTMLFormElement|string} form - Form element or selector
   */
  function clearForm(form) {
    const formEl = typeof form === 'string' ? Dom.query(form) : form;
    if (formEl) {
      formEl.reset();
    }
  }

  /**
   * Reset form to initial state (clear and hide errors)
   * @param {HTMLFormElement|string} form - Form element or selector
   * @param {string} alertSelector - Alert element selector
   */
  function resetForm(form, alertSelector = '.form-alert') {
    const formEl = typeof form === 'string' ? Dom.query(form) : form;
    if (!formEl) return;

    clearForm(formEl);
    
    const alertEl = Dom.query(alertSelector, formEl);
    if (alertEl) {
      Ui.setAlert(alertEl, '', '');
    }
  }

  /**
   * Display field-level validation errors
   * @param {HTMLFormElement|string} form - Form element or selector
   * @param {Object} errors - Errors object {fieldName: errorMessage}
   */
  function displayFieldErrors(form, errors) {
    const formEl = typeof form === 'string' ? Dom.query(form) : form;
    if (!formEl) return;

    // Clear previous error displays
    Dom.queryAll('.form-error', formEl).forEach(el => {
      Dom.text(el, '');
      Dom.show(el);
    });

    // Display new errors
    Object.entries(errors).forEach(([fieldName, errorMessage]) => {
      const errorEl = Dom.query(`[data-error="${fieldName}"]`, formEl);
      if (errorEl) {
        Dom.text(errorEl, errorMessage);
      }
    });
  }

  /**
   * Disable all form inputs
   * @param {HTMLFormElement|string} form - Form element or selector
   * @param {boolean} disabled - True to disable, false to enable
   */
  function setFormDisabled(form, disabled) {
    const formEl = typeof form === 'string' ? Dom.query(form) : form;
    if (!formEl) return;

    Dom.queryAll('input, textarea, select, button', formEl).forEach(el => {
      Dom.setDisabled(el, disabled);
    });
  }

  return {
    handleSubmit,
    validateForm,
    clearForm,
    resetForm,
    displayFieldErrors,
    setFormDisabled
  };
})();
