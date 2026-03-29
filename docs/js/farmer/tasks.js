(() => {
  const TASKS_KEY = 'mockTasks';
  const BATCH_KEY = 'mockBatch';

  document.addEventListener('DOMContentLoaded', () => {
    renderTasks();
    setupViewAllTasksButton();
    setupTaskModal();
  });

  let activeTask = null;
  let showAllTasks = false;

  function updateBodyScrollLock() {
    const hasActiveModal = Boolean(document.querySelector('.batch-modal.active'));
    document.body.classList.toggle('modal-open', hasActiveModal);
  }

  function renderTasks() {
    const payload = getStoredTasks();
    const batch = getStoredBatch();
    
    // Update batch info
    if (batch && batch.name) {
      document.getElementById('batchInfo').textContent = `Batch: ${batch.name}`;
    }

    const todayTasks = payload?.today || [];
    // Render progress indicator
    renderProgressIndicator(batch, todayTasks);

    // Render task lists
    renderTaskList('todayTaskList', todayTasks, 'todayTaskEmpty');

    // Update counts
    setCount('todayTaskCount', todayTasks.length, 'tasks');
    setTaskStatus(todayTasks);
  }

  function setupViewAllTasksButton() {
    const viewAllBtn = document.getElementById('viewAllTasksBtn');
    if (!viewAllBtn) return;

    viewAllBtn.addEventListener('click', () => {
      showAllTasks = !showAllTasks;
      viewAllBtn.classList.toggle('active', showAllTasks);
      viewAllBtn.innerHTML = showAllTasks
        ? '<i class="fas fa-compress"></i>\nView Today Only'
        : '<i class="fas fa-list"></i>\nView All Tasks';
      renderTasks();
    });
  }

  function getStoredBatch() {
    const raw = window.localStorage.getItem(BATCH_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (err) {
      return null;
    }
  }

  function getCurrentBatchDay(batch) {
    if (!batch?.arrivalDate) return 1;
    const arrivalDate = new Date(batch.arrivalDate);
    const today = new Date();
    const days = Math.ceil((today - arrivalDate) / 86400000);
    return Math.max(1, days);
  }

  function getCurrentStage(day) {
    if (day <= 3) return 'receiving';
    if (day <= 40) return 'growing';
    if (day <= 90) return 'finishing';
    return 'market-ready';
  }

  function getStageProgress(day) {
    const allStages = [
      { name: 'Receiving', start: 1, end: 3, duration: 3, focus: 'Acclimation', subStages: ['Reception', 'Health Assessment', 'Environment Acclimation'] },
      { name: 'Growing', start: 4, end: 40, duration: 37, focus: 'Development', subStages: ['Early Growing (40-75 lbs)', 'Late Growing (75-135 lbs)', 'Pre-Finish Transition'] },
      { name: 'Finishing', start: 41, end: 90, duration: 50, focus: 'Market Preparation', subStages: ['Pre-Finish (135-180 lbs)', 'Mid-Finish (180-220 lbs)', 'Late Finish (220-260 lbs)'] },
      { name: 'Market Ready', start: 91, end: 120, duration: 30, focus: 'Slaughter Weight', subStages: ['Final Growth (260-270 lbs)', 'Transport Prep', 'Sale Processing'] }
    ];

    // Find current stage
    let currentStageIndex = 0;
    let completedStageIndex = -1;

    for (let i = 0; i < allStages.length; i++) {
      if (day >= allStages[i].start && day <= allStages[i].end) {
        currentStageIndex = i;
        completedStageIndex = i - 1;
        break;
      }
      if (day > allStages[i].end) {
        completedStageIndex = i;
        currentStageIndex = i + 1;
      }
    }

    const currentStage = allStages[currentStageIndex];
    if (!currentStage) currentStageIndex = allStages.length - 1;

    // Get remaining stages (current + future)
    const remainingStages = allStages.slice(currentStageIndex);

    // Calculate stage progress
    const stageDay = day - (currentStage?.start || 1) + 1;
    const stageDuration = currentStage?.duration || 30;
    const stageProgress = currentStage ? Math.min(100, Math.round((stageDay / stageDuration) * 100)) : 0;

    // Get current sub-stage
    const currentSubStage = getCurrentSubStage(currentStage, day);

    // Overall progress
    const totalDays = 120;
    const overallProgress = Math.round((Math.min(day, totalDays) / totalDays) * 100);

    return {
      currentStageIndex: currentStageIndex,
      completedStageCount: completedStageIndex + 1,
      currentStage: currentStage,
      currentSubStage: currentSubStage,
      stageProgress: stageProgress,
      stageDayNumber: stageDay,
      stageDuration: stageDuration,
      overallProgress: overallProgress,
      remainingStages: remainingStages,
      allStages: allStages
    };
  }

  function getCurrentSubStage(stage, day) {
    if (!stage || !stage.subStages) return 'In Progress';
    
    const relativeDay = day - stage.start;
    const subStageDuration = Math.ceil(stage.duration / stage.subStages.length);
    const subStageIndex = Math.floor(relativeDay / subStageDuration);
    
    return stage.subStages[Math.min(subStageIndex, stage.subStages.length - 1)] || stage.subStages[0];
  }

  function renderProgressIndicator(batch, todayTasks) {
    if (!batch) {
      document.getElementById('progressCard').style.display = 'none';
      return;
    }

    const day = getCurrentBatchDay(batch);
    const stageData = getStageProgress(day);
    const completed = todayTasks.filter(t => t.completed).length;

    // Update KPI
    document.getElementById('kpiDay').textContent = day;
    document.getElementById('kpiProgress').textContent = stageData.stageProgress + '%';
    document.getElementById('kpiCompleted').textContent = completed;

    // Update stage description with sub-stage info
    const stageInfo = stageData.currentStage;
    if (stageInfo) {
      const description = `${stageInfo.name} (${stageData.stageDayNumber}/${stageData.stageDuration}) • ${stageData.currentSubStage}`;
      document.getElementById('progressDescription').textContent = description;
    }

    // Render only remaining stages (current + future)
    const stageContainer = document.querySelector('.progress-stages');
    if (!stageContainer) return;

    stageContainer.innerHTML = '';

    stageData.remainingStages.forEach((stage, index) => {
      const isCurrent = index === 0;

      const stageEl = document.createElement('div');
      stageEl.className = `stage ${isCurrent ? 'current' : 'upcoming'}`;
      stageEl.id = `stage_${stageData.allStages.indexOf(stage) + 1}`;
      stageEl.innerHTML = `
        <div class="stage-dot"></div>
        <div class="stage-label">${stage.name}</div>
        <div class="stage-day">Day ${stage.start}-${stage.end}</div>
        ${isCurrent ? `<div class="stage-focus">${stage.focus}</div>` : ''}
      `;

      stageContainer.appendChild(stageEl);

      // Add connector for all but last stage
      if (index < stageData.remainingStages.length - 1) {
        const connector = document.createElement('div');
        connector.className = `stage-connector ${isCurrent ? 'active' : ''}`;
        stageContainer.appendChild(connector);
      }
    });

    // Update progress bar to show stage progress instead of overall
    const progressFill = document.getElementById('progressBarFill');
    if (progressFill) {
      progressFill.style.width = stageData.stageProgress + '%';
    }

    // Add sub-stage indicator
    updateSubStageIndicator(stageData);

    if (stageInfo) {
      const focusEl = document.getElementById('progressFocus');
      if (focusEl) {
        const focusText = focusEl.querySelector('span');
        if (focusText) {
          focusText.textContent = `Focus today: ${stageInfo.focus}`;
        }
      }
    }
  }

  function updateSubStageIndicator(stageData) {
    let subStageEl = document.getElementById('subStageIndicator');
    
    if (!subStageEl) {
      // Create sub-stage indicator if it doesn't exist
      const progressHeader = document.querySelector('.progress-header');
      if (progressHeader) {
        subStageEl = document.createElement('div');
        subStageEl.id = 'subStageIndicator';
        subStageEl.className = 'sub-stage-indicator';
        progressHeader.insertAdjacentElement('afterend', subStageEl);
      }
    }

    if (subStageEl && stageData.currentStage) {
      const stage = stageData.currentStage;
      const subStages = stage.subStages || [];
      const currentSubIndex = subStages.indexOf(stageData.currentSubStage);

      subStageEl.innerHTML = `
        <div class="sub-stage-track">
          <div class="sub-stage-label">
            <span class="label-text">${stage.name} phases:</span>
            <span class="phase-info">${stageData.currentSubStage}</span>
          </div>
          <div class="sub-stage-dots">
            ${subStages.map((sub, idx) => `
              <div class="sub-dot ${idx <= currentSubIndex ? 'active' : ''} ${idx === currentSubIndex ? 'current' : ''}"></div>
            `).join('')}
          </div>
          <div class="progress-focus" id="progressFocus">
            <i class="fas fa-bullseye"></i>
            <span>Focus today: --</span>
          </div>
        </div>
      `;
    }
  }

  function getStoredTasks() {
    const raw = window.localStorage.getItem(TASKS_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (err) {
      return null;
    }
  }

  function renderTaskList(containerId, tasks, emptyId) {
    const container = document.getElementById(containerId);
    const emptyState = document.getElementById(emptyId);
    if (!container) return;

    container.innerHTML = '';

    if (!tasks.length) {
      if (emptyState) emptyState.hidden = false;
      return;
    }

    if (emptyState) emptyState.hidden = true;

    tasks.forEach((task) => {
      if (!showAllTasks && task.completed) return;
      container.appendChild(createTaskElement(task));
    });
  }

  function createTaskElement(task) {
    const item = document.createElement('div');
    item.className = `task-item${task.completed ? ' completed' : ''}`;
    item.setAttribute('data-task', '');

    const row = document.createElement('div');
    row.className = 'task-row task-row-data';

    const taskCell = document.createElement('div');
    taskCell.className = 'task-cell task-cell-task';

    const content = document.createElement('div');
    content.className = 'task-content';

    const checkbox = document.createElement('div');
    checkbox.className = `task-checkbox${task.completed ? ' checked' : ''}`;

    const title = document.createElement('div');
    title.className = 'task-title';
    title.textContent = task.title || 'Task';

    const detail = document.createElement('div');
    detail.className = 'task-detail';
    detail.textContent = task.detail || '';

    content.appendChild(checkbox);
    content.appendChild(title);
    taskCell.appendChild(content);
    if (task.detail) {
      taskCell.appendChild(detail);
    }

    const priorityCell = document.createElement('div');
    priorityCell.className = 'task-cell';
    const priority = document.createElement('span');
    const priorityLabel = task.priority || 'Normal';
    priority.className = `task-priority ${priorityLabel.toLowerCase()}`;
    priority.textContent = priorityLabel;
    priorityCell.appendChild(priority);

    const categoryCell = document.createElement('div');
    categoryCell.className = 'task-cell';
    const category = document.createElement('span');
    category.className = 'task-category';
    category.textContent = task.category || 'General';
    categoryCell.appendChild(category);

    const actionsCell = document.createElement('div');
    actionsCell.className = 'task-cell task-cell-actions';

    const actions = document.createElement('div');
    actions.className = 'task-actions';

    const actionHint = document.createElement('div');
    actionHint.className = 'task-detail';
    actionHint.textContent = 'Log feed intake or mark complete';

    const logBtn = document.createElement('button');
    logBtn.type = 'button';
    logBtn.className = 'btn btn-secondary';
    logBtn.innerHTML = '<i class="fas fa-clipboard"></i> Log Data';
    logBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      openTaskModal(task);
    });

    const completeBtn = document.createElement('button');
    completeBtn.type = 'button';
    completeBtn.className = 'btn btn-primary';
    completeBtn.innerHTML = '<i class="fas fa-check"></i> Complete';
    completeBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleTaskComplete(item, checkbox);
    });

    actions.appendChild(logBtn);
    actions.appendChild(completeBtn);
    actions.appendChild(actionHint);
    actionsCell.appendChild(actions);

    row.appendChild(taskCell);
    row.appendChild(priorityCell);
    row.appendChild(categoryCell);
    row.appendChild(actionsCell);
    item.appendChild(row);

    return item;
  }

  function toggleTaskComplete(item, checkbox) {
    item.classList.toggle('completed');
    checkbox.classList.toggle('checked');
  }

  function setupTaskModal() {
    const modal = document.getElementById('taskDataModal');
    const form = document.getElementById('taskDataForm');
    if (!modal || !form) return;

    modal.addEventListener('click', (event) => {
      if (event.target.hasAttribute('data-modal-close')) {
        closeTaskModal();
      }
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      closeTaskModal();
    });
  }

  function openTaskModal(task) {
    const modal = document.getElementById('taskDataModal');
    const title = document.getElementById('taskModalTitle');
    const subtitle = document.getElementById('taskModalSubtitle');
    const form = document.getElementById('taskDataForm');
    if (!modal || !form) return;

    activeTask = task || null;
    if (title) title.textContent = task?.title || 'Log Task Data';
    if (subtitle) subtitle.textContent = task?.detail || 'Capture daily production inputs for this task.';

    form.reset();
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    updateBodyScrollLock();
  }

  function closeTaskModal() {
    const modal = document.getElementById('taskDataModal');
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    activeTask = null;
    updateBodyScrollLock();
  }

  function setCount(elementId, count, label) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = count;
  }

  function setTaskStatus(tasks) {
    const statusEl = document.getElementById('todayTaskStatus');
    if (!statusEl) return;
    const completed = tasks.filter(task => task.completed).length;
    const pending = Math.max(0, tasks.length - completed);
    statusEl.textContent = `${pending} pending`;
  }
})();
