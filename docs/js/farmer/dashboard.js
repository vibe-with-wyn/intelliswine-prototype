document.addEventListener('DOMContentLoaded', () => {
  setDashboardWelcome();
  const tasks = document.querySelectorAll('[data-task]');
  tasks.forEach(task => {
    task.addEventListener('click', () => {
      task.classList.toggle('completed');
      const checkbox = task.querySelector('.task-checkbox');
      checkbox?.classList.toggle('checked');
    });
  });
});

function setDashboardWelcome() {
  const authStore = window.AppAuthStorage;
  const user = authStore?.getUser?.();
  const nameEl = document.getElementById('dashboardUserName');
  const suffixEl = document.getElementById('dashboardHeroSuffix');

  if (!nameEl || !suffixEl) {
    return;
  }

  const firstName = user?.firstName?.trim() || '';

  if (firstName) {
    nameEl.textContent = `${firstName}, `;
    suffixEl.textContent = 'here is your batch overview';
    return;
  }

  nameEl.textContent = 'Here is your batch overview';
  suffixEl.textContent = '';
}
