/**
 * Batch Modal Component
 * Manages the "Start Batch" modal dialog
 */

const AppBatchModal = (() => {
  // State
  let modal = null;
  let form = null;
  let openBtn = null;
  let closeBtn = null;
  let cancelBtn = null;
  let farmSetupModal = null;
  let farmSetupCloseBtn = null;
  let farmSetupDismissBtn = null;

  function updateBodyScrollLock() {
    const hasActiveModal = Boolean(document.querySelector('.batch-modal.active'));
    document.body.classList.toggle('modal-open', hasActiveModal);
  }

  /**
   * Initialize the batch modal
   */
  function init() {
    modal = document.getElementById('startBatchModal');
    form = document.getElementById('startBatchForm');
    openBtn = document.getElementById('startBatchBtn');
    closeBtn = document.getElementById('closeBatchModalBtn');
    cancelBtn = document.getElementById('cancelBatchBtn');
    farmSetupModal = document.getElementById('farmSetupModal');
    farmSetupCloseBtn = document.getElementById('closeFarmSetupModalBtn');
    farmSetupDismissBtn = document.getElementById('dismissFarmSetupBtn');

    if (!modal || !form) {
      console.warn('Batch modal components not found');
      return;
    }

    bindEvents();
    openFromRedirect();
  }

  /**
   * Bind event listeners
   */
  function bindEvents() {
    // Open modal
    if (openBtn) {
      openBtn.addEventListener('click', (event) => {
        if (!isFarmSetupComplete()) {
          openFarmSetupModal(event);
          return;
        }
        open(event);
      });
    }

    // Close modal
    closeBtn.addEventListener('click', close);
    cancelBtn.addEventListener('click', close);

    // Close on overlay click
    modal.querySelector('.batch-modal-overlay').addEventListener('click', close);

    // Prevent closing when clicking inside the modal content
    modal.querySelector('.batch-modal-content').addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Form submission
    form.addEventListener('submit', handleSubmit);

    if (farmSetupModal) {
      farmSetupModal.querySelector('.batch-modal-overlay')?.addEventListener('click', closeFarmSetupModal);
      farmSetupCloseBtn?.addEventListener('click', closeFarmSetupModal);
      farmSetupDismissBtn?.addEventListener('click', closeFarmSetupModal);
    }

    // Set today's date as default for arrival date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('arrivalDate').value = today;
  }

  /**
   * Open the modal
   */
  function open(e) {
    if (e) e.preventDefault();
    if (!isFarmSetupComplete() && farmSetupModal) {
      openFarmSetupModal();
      return;
    }
    modal.classList.add('active');
    form.reset();
    
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('arrivalDate').value = today;
    updateBodyScrollLock();
  }

  /**
   * Close the modal
   */
  function close(e) {
    if (e) e.preventDefault();
    modal.classList.remove('active');
    form.reset();
    updateBodyScrollLock();
  }

  function openFarmSetupModal(e) {
    if (e) e.preventDefault();
    if (!farmSetupModal) return;
    farmSetupModal.classList.add('active');
    farmSetupModal.setAttribute('aria-hidden', 'false');
    updateBodyScrollLock();
  }

  function closeFarmSetupModal(e) {
    if (e) e.preventDefault();
    if (!farmSetupModal) return;
    farmSetupModal.classList.remove('active');
    farmSetupModal.setAttribute('aria-hidden', 'true');
    updateBodyScrollLock();
  }

  function isFarmSetupComplete() {
    const localFlag = window.localStorage.getItem('farmSetupComplete') === 'true';
    return localFlag;
  }

  function openFromRedirect() {
    const shouldOpen = window.localStorage.getItem('openStartBatchModal') === 'true';
    if (!shouldOpen) return;

    window.localStorage.removeItem('openStartBatchModal');
    open();
  }

  /**
   * Handle form submission
   */
  async function handleSubmit(e) {
    e.preventDefault();

    // Validate form
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // Collect form data
    const formData = new FormData(form);
    const batchData = {
      farmId: formData.get('farmSelect'),
      name: formData.get('batchName'),
      pigCount: parseInt(formData.get('pigCount')),
      arrivalDate: formData.get('arrivalDate'),
      initialWeight: parseFloat(formData.get('initialWeight')),
      targetWeight: parseFloat(formData.get('targetWeight')),
      targetDays: parseInt(formData.get('targetDays')),
      breed: formData.get('breed'),
      source: formData.get('source'),
      vaccination: formData.get('vaccination'),
      feedType: formData.get('feedType'),
      feedSupplier: formData.get('feedSupplier'),
      feedChangeWeight: formData.get('feedStartWeight') ? parseFloat(formData.get('feedStartWeight')) : null,
    };

    try {
      // Show loading state
      setLoading(true);

      // Mock the backend response and generate tasks
      await new Promise((resolve) => setTimeout(resolve, 600));
      const mockBatchId = `batch_${Date.now()}`;
      const tasksPayload = generateMockTasks(batchData);

      window.localStorage.setItem('mockBatch', JSON.stringify({
        id: mockBatchId,
        createdAt: new Date().toISOString(),
        ...batchData
      }));
      window.localStorage.setItem('mockTasks', JSON.stringify(tasksPayload));

      // Show success message
      showSuccessMessage('Batch started successfully!');

      // Close modal after a short delay, then go to Tasks
      setTimeout(() => {
        close();
        window.location.href = './tasks.html';
      }, 900);
    } catch (error) {
      console.error('Batch start error:', error);
      showErrorMessage(error.message || 'Failed to start batch. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function generateMockTasks(batchData) {
    const arrivalDate = batchData.arrivalDate ? new Date(batchData.arrivalDate) : new Date();
    const today = new Date();
    const dayNumber = Math.max(1, Math.ceil((today - arrivalDate) / 86400000) + 1);
    const feedLabel = batchData.feedType || 'Growing';
    const targetDays = Number.isFinite(batchData.targetDays) ? batchData.targetDays : 120;
    const transitionDay = Math.min(40, targetDays);
    const marketDay = Math.max(45, Math.floor(targetDays * 0.8));

    return {
      generatedAt: new Date().toISOString(),
      batchName: batchData.name,
      today: [
        {
          title: 'Morning feed (06:00)',
          priority: 'High',
          category: 'Feeding',
          detail: `${feedLabel} mix - 2.2 kg per head`,
          completed: true
        },
        {
          title: 'Water system check',
          priority: 'Medium',
          category: 'Utilities',
          detail: 'Inspect flow rate and leaks',
          completed: true
        },
        {
          title: 'Evening feed (18:00)',
          priority: 'High',
          category: 'Feeding',
          detail: 'Monitor leftovers and intake',
          completed: false
        },
        {
          title: 'Daily health walk-through',
          priority: 'Medium',
          category: 'Monitoring',
          detail: `Day ${dayNumber} observation`,
          completed: false
        }
      ],
      upcoming: [
        {
          title: `Feed transition (Day ${transitionDay})`,
          priority: 'High',
          category: 'Feeding',
          detail: 'Switch to finishing feed mix',
          completed: false
        },
        {
          title: 'Weekly weigh-in',
          priority: 'Medium',
          category: 'Monitoring',
          detail: 'Sample 10% of pens',
          completed: false
        },
        {
          title: 'Pen sanitation',
          priority: 'Low',
          category: 'Sanitation',
          detail: 'Scrub walkways and feeders',
          completed: false
        }
      ],
      milestones: [
        {
          label: 'Day 7',
          message: 'Post-receiving health assessment.',
          time: 'Within 1 week',
          dotColor: 'green'
        },
        {
          label: 'Day 42',
          message: 'Vaccine schedule due.',
          time: 'Mid-cycle',
          dotColor: 'blue'
        },
        {
          label: `Day ${marketDay}`,
          message: 'Market readiness check.',
          time: 'Projected target',
          dotColor: 'amber'
        }
      ]
    };
  }

  /**
   * Set loading state
   */
  function setLoading(isLoading) {
    const btn = form.querySelector('button[type="submit"]');
    if (isLoading) {
      form.classList.add('is-loading');
      btn.disabled = true;
    } else {
      form.classList.remove('is-loading');
      btn.disabled = false;
    }
  }

  /**
   * Show success message
   */
  function showSuccessMessage(message) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'batch-success-message show';
    msgDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    
    const formTop = form.querySelector('.form-section');
    if (formTop) {
      formTop.insertAdjacentElement('beforebegin', msgDiv);
      setTimeout(() => msgDiv.remove(), 3000);
    }
  }

  /**
   * Show error message
   */
  function showErrorMessage(message) {
    if (window.AppToast?.error) {
      window.AppToast.error(message);
      return;
    }
    alert(`Error: ${message}`);
  }

  /**
   * Validate form fields
   */
  function validateForm() {
    const inputs = form.querySelectorAll('.form-input[required]');
    let isValid = true;

    inputs.forEach((input) => {
      if (!input.value.trim()) {
        input.classList.add('error');
        isValid = false;
      } else {
        input.classList.remove('error');
      }
    });

    return isValid;
  }

  // Public API
  return {
    init,
    open,
    close,
  };
})();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', AppBatchModal.init);
} else {
  AppBatchModal.init();
}
