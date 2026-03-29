/**
 * Batch Setup Wizard - Production Cycle Creation Module
 * Handles multi-step batch configuration and task generation
 */

window.AppBatchSetup = (() => {
  const Api = window.AppApi;
  const Toast = window.AppToast;
  const Dom = window.AppDom;

  let currentStep = 1;
  let batchData = {};
  let createdBatchId = null;

  const modalElements = {
    modal: null,
    backdrop: null,
    closeBtn: null,
    cancelBtn: null,
    nextBtn: null,
    createBtn: null,
    viewProjectionBtn: null,
    formAlert: null,
    form: null
  };

  function updateBodyScrollLock() {
    const batchModalActive = Boolean(document.querySelector('.batch-modal.active'));
    const setupModalVisible = modalElements.modal
      ? window.getComputedStyle(modalElements.modal).display !== 'none'
      : false;
    document.body.classList.toggle('modal-open', batchModalActive || setupModalVisible);
  }

  /**
   * Initialize batch setup wizard
   */
  function init() {
    cacheElements();
    setupEventListeners();
  }

  /**
   * Cache modal DOM elements
   */
  function cacheElements() {
    modalElements.modal = document.getElementById('batchSetupModal');
    modalElements.backdrop = document.getElementById('batchModalBackdrop');
    modalElements.closeBtn = document.getElementById('batchModalClose');
    modalElements.cancelBtn = document.getElementById('batchModalCancel');
    modalElements.nextBtn = document.getElementById('batchModalNext');
    modalElements.createBtn = document.getElementById('batchModalCreate');
    modalElements.viewProjectionBtn = document.getElementById('batchModalViewProjection');
    modalElements.formAlert = document.getElementById('batchFormAlert');
    modalElements.form = document.getElementById('batchForm');
  }

  /**
   * Setup event listeners
   */
  function setupEventListeners() {
    if (!modalElements.modal) return;

    // Close modal
    modalElements.closeBtn?.addEventListener('click', closeModal);
    modalElements.cancelBtn?.addEventListener('click', closeModal);
    modalElements.backdrop?.addEventListener('click', closeModal);

    // Step navigation
    modalElements.nextBtn?.addEventListener('click', handleNextStep);
    modalElements.createBtn?.addEventListener('click', handleCreateBatch);
    modalElements.viewProjectionBtn?.addEventListener('click', handleViewProjection);

    // Form submission
    modalElements.form?.addEventListener('submit', (e) => e.preventDefault());

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalElements.modal.style.display !== 'none') {
        closeModal();
      }
    });
  }

  /**
   * Open batch setup modal
   */
  function openModal() {
    if (!modalElements.modal) return;

    // Reset state
    currentStep = 1;
    batchData = {};
    createdBatchId = null;
    resetForm();
    showStep(1);

    modalElements.modal.style.display = 'flex';
    updateBodyScrollLock();
  }

  /**
   * Close batch setup modal
   */
  function closeModal() {
    if (!modalElements.modal) return;
    modalElements.modal.style.display = 'none';
    resetForm();
    updateBodyScrollLock();
  }

  /**
   * Show specific step
   */
  function showStep(stepNum) {
    // Hide all steps
    document.querySelectorAll('.wizard-step').forEach((step) => {
      step.style.display = 'none';
    });

    // Show current step
    const currentStepEl = document.getElementById(`step${stepNum}`);
    if (currentStepEl) {
      currentStepEl.style.display = 'block';
    }

    // Update progress indicators
    document.querySelectorAll('.progress-step').forEach((step, idx) => {
      step.classList.toggle('active', idx + 1 === stepNum);
    });

    // Update button visibility
    modalElements.nextBtn.style.display = stepNum < 3 ? 'block' : 'none';
    modalElements.createBtn.style.display = stepNum === 2 ? 'block' : 'none';
    modalElements.viewProjectionBtn.style.display = stepNum === 3 ? 'block' : 'none';

    currentStep = stepNum;
  }

  /**
   * Handle next step
   */
  function handleNextStep() {
    if (currentStep === 1) {
      if (validateForm()) {
        collectFormData();
        populateReview();
        showStep(2);
      }
    } else if (currentStep === 2) {
      showStep(3);
    }
  }

  /**
   * Validate form inputs
   */
  function validateForm() {
    const batchName = document.getElementById('batchName').value.trim();
    const initialCount = parseInt(document.getElementById('initialCount').value);
    const initialWeight = parseFloat(document.getElementById('initialWeight').value);
    const targetWeight = parseFloat(document.getElementById('targetWeight').value);
    const startDate = document.getElementById('startDate').value;

    // Clear previous alert
    setAlert('', '');

    // Validation rules
    if (!batchName) {
      setAlert('Batch name is required', 'error');
      return false;
    }

    if (!initialCount || initialCount < 1) {
      setAlert('Initial pig count must be at least 1', 'error');
      return false;
    }

    if (!initialWeight || initialWeight <= 0) {
      setAlert('Initial weight must be greater than 0', 'error');
      return false;
    }

    if (!targetWeight || targetWeight <= 0) {
      setAlert('Target market weight must be greater than 0', 'error');
      return false;
    }

    if (targetWeight <= initialWeight) {
      setAlert('Target weight must be greater than initial weight', 'error');
      return false;
    }

    if (!startDate) {
      setAlert('Start date is required', 'error');
      return false;
    }

    return true;
  }

  /**
   * Collect form data
   */
  function collectFormData() {
    batchData = {
      batchName: document.getElementById('batchName').value.trim(),
      initialCount: parseInt(document.getElementById('initialCount').value),
      initialWeight: parseFloat(document.getElementById('initialWeight').value),
      targetWeight: parseFloat(document.getElementById('targetWeight').value),
      startDate: document.getElementById('startDate').value,
      feedType: document.getElementById('feedType').value || null
    };
  }

  /**
   * Populate review step with form data
   */
  function populateReview() {
    document.getElementById('reviewBatchName').textContent = batchData.batchName;
    document.getElementById('reviewInitialCount').textContent = batchData.initialCount.toLocaleString();
    document.getElementById('reviewInitialWeight').textContent = batchData.initialWeight.toFixed(1);
    document.getElementById('reviewTargetWeight').textContent = batchData.targetWeight.toFixed(1);
    document.getElementById('reviewStartDate').textContent = formatDate(batchData.startDate);

    // Show feed type if provided
    if (batchData.feedType) {
      document.getElementById('reviewFeedTypeRow').style.display = 'flex';
      document.getElementById('reviewFeedType').textContent = capitalizeFeedType(batchData.feedType);
    } else {
      document.getElementById('reviewFeedTypeRow').style.display = 'none';
    }

    // Calculate projections
    calculateProjections();
  }

  /**
   * Calculate growth projections (simplified)
   */
  function calculateProjections() {
    // Simplified Gompertz-like projection
    const weightGain = batchData.targetWeight - batchData.initialWeight;
    const dailyGain = 0.8; // Conservative daily gain in kg (placeholder)
    const projectedDays = Math.ceil(weightGain / dailyGain);

    // Simplified feed projection (placeholder: ~2kg feed per kg weight gain)
    const fcr = 2.5; // Feed conversion ratio placeholder
    const projectedFeedPerPig = weightGain * fcr;

    document.getElementById('projectedDays').textContent = `${projectedDays} days`;
    document.getElementById('projectedFeed').textContent = `${projectedFeedPerPig.toFixed(1)} kg/pig`;
  }

  /**
   * Handle batch creation
   */
  async function handleCreateBatch() {
    const submitBtn = modalElements.createBtn;
    setButtonLoading(submitBtn, true);

    try {
      // Prepare API payload
      const payload = {
        name: batchData.batchName,
        initialCount: batchData.initialCount,
        currentCount: batchData.initialCount,
        initialWeight: batchData.initialWeight,
        targetMarketWeight: batchData.targetWeight,
        startDate: batchData.startDate,
        feedType: batchData.feedType,
        status: 'ACTIVE'
      };

      // Create batch via API (no auth)
      const response = await Api.post('/api/batches', payload);
      if (!response || !response.id) {
        throw new Error('Invalid response from server');
      }

      createdBatchId = response.id;
      const taskCount = response.generatedTasks || 0;

      // Update success screen
      document.getElementById('successBatchName').textContent = batchData.batchName;
      document.getElementById('successTaskCount').textContent = taskCount;

      // Show success step
      showStep(3);

      Toast.success(`Batch "${batchData.batchName}" created successfully! ${taskCount} tasks generated.`);
    } catch (error) {
      const errorMsg = error.message || 'Failed to create batch. Please try again.';
      setAlert(errorMsg, 'error');
      Toast.error(errorMsg);
      console.error('Batch creation error:', error);
    } finally {
      setButtonLoading(submitBtn, false);
    }
  }

  /**
   * Handle view projection after batch creation
   */
  function handleViewProjection() {
    if (createdBatchId) {
      closeModal();
      // Navigate to analytics/growth projection page
      window.location.href = `../pages/analytics.html?batchId=${createdBatchId}`;
    }
  }

  /**
   * Set form alert message
   */
  function setAlert(message, type) {
    if (!modalElements.formAlert) return;

    if (!message) {
      modalElements.formAlert.textContent = '';
      modalElements.formAlert.className = 'form-alert';
      return;
    }

    modalElements.formAlert.textContent = message;
    modalElements.formAlert.className = `form-alert is-${type}`;
  }

  /**
   * Reset form to initial state
   */
  function resetForm() {
    if (modalElements.form) {
      modalElements.form.reset();
    }
    setAlert('', '');
    document.getElementById('reviewFeedTypeRow').style.display = 'none';
  }

  /**
   * Set button loading state
   */
  function setButtonLoading(button, isLoading) {
    if (!button) return;
    button.disabled = isLoading;
    button.classList.toggle('is-loading', isLoading);
    button.style.opacity = isLoading ? '0.6' : '1';
  }

  /**
   * Format date for display
   */
  function formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  /**
   * Capitalize feed type
   */
  function capitalizeFeedType(feedType) {
    return feedType.charAt(0).toUpperCase() + feedType.slice(1);
  }

  // Public API
  return {
    init,
    openModal,
    closeModal
  };
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.AppBatchSetup.init();
});
