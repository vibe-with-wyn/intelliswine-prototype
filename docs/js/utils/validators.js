/**
 * Form Validators - Reusable validation functions
 * Provides validation rules for common form fields
 */

window.AppValidators = (() => {
  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean}
   */
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   * Requirements: 8+ chars, uppercase, lowercase, number, special char
   * @param {string} password - Password to validate
   * @returns {Object} { isValid: boolean, errors: string[] }
   */
  function validatePassword(password) {
    const errors = [];
    
    if (!password) {
      errors.push('Password is required');
      return { isValid: false, errors };
    }
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must include at least one lowercase letter');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must include at least one uppercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('Password must include at least one number');
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      errors.push('Password must include at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Check password strength (0-4 bars)
   * @param {string} password - Password to check
   * @returns {number} 0-4 strength rating
   */
  function getPasswordStrength(password) {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  }

  /**
   * Validate required field
   * @param {string} value - Value to check
   * @returns {boolean}
   */
  function isRequired(value) {
    return value && value.trim().length > 0;
  }

  /**
   * Validate minimum length
   * @param {string} value - Value to check
   * @param {number} min - Minimum length
   * @returns {boolean}
   */
  function minLength(value, min) {
    return value && value.length >= min;
  }

  /**
   * Validate maximum length
   * @param {string} value - Value to check
   * @param {number} max - Maximum length
   * @returns {boolean}
   */
  function maxLength(value, max) {
    return !value || value.length <= max;
  }

  /**
   * Validate field is a number
   * @param {string} value - Value to check
   * @returns {boolean}
   */
  function isNumber(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
  }

  /**
   * Validate field is a positive number
   * @param {string} value - Value to check
   * @returns {boolean}
   */
  function isPositiveNumber(value) {
    return isNumber(value) && parseFloat(value) > 0;
  }

  /**
   * Validate two values match (for password confirmation)
   * @param {string} value1 - First value
   * @param {string} value2 - Second value
   * @returns {boolean}
   */
  function matches(value1, value2) {
    return value1 === value2;
  }

  /**
   * Validate number is within range
   * @param {number} value - Value to check
   * @param {number} min - Minimum allowed
   * @param {number} max - Maximum allowed
   * @returns {boolean}
   */
  function inRange(value, min, max) {
    const num = parseFloat(value);
    return isNumber(value) && num >= min && num <= max;
  }

  return {
    isValidEmail,
    validatePassword,
    getPasswordStrength,
    isRequired,
    minLength,
    maxLength,
    isNumber,
    isPositiveNumber,
    matches,
    inRange
  };
})();
