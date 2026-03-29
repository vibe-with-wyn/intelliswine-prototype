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

  const sidebar = document.getElementById('sidebar');
  const toggle = document.getElementById('sidebarToggle');
  const overlay = document.getElementById('sidebarOverlay');

  const closeSidebar = () => {
    sidebar?.classList.remove('open');
    overlay?.classList.remove('active');
  };

  toggle?.addEventListener('click', () => {
    sidebar?.classList.toggle('open');
    overlay?.classList.toggle('active');
  });

  overlay?.addEventListener('click', closeSidebar);
});

function setDashboardWelcome() {
  const nameEl = document.getElementById('dashboardUserName');
  const suffixEl = document.getElementById('dashboardHeroSuffix');
  if (!nameEl || !suffixEl) {
    return;
  }
  nameEl.textContent = 'Here is your batch overview';
  suffixEl.textContent = '';
}
