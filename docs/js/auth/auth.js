(() => {
  const api = window.AppApi;
  const authStore = window.AppAuthStorage;
  const ui = window.AppUi;

  document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const changePasswordForm = document.getElementById('changePasswordForm');

    if (registerForm) {
      registerForm.addEventListener('submit', handleRegister);
      const termsCheckbox = document.getElementById('termsAgree');
      const termsTooltip = document.getElementById('termsTooltip');
      termsCheckbox?.addEventListener('change', () => {
        if (termsCheckbox.checked) {
          termsTooltip?.classList.remove('is-visible');
        }
      });
    }

    if (loginForm) {
      loginForm.addEventListener('submit', handleLogin);
    }

    if (changePasswordForm) {
      changePasswordForm.addEventListener('submit', handleChangePassword);
    }
  });

  async function handleRegister(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const alertEl = document.getElementById('registerAlert');
  const submitBtn = form.querySelector('button[type="submit"]');
  const termsCheckbox = document.getElementById('termsAgree');
  const termsTooltip = document.getElementById('termsTooltip');

  ui.setAlert(alertEl, '', '');
  ui.setLoading(submitBtn, true);

  if (termsCheckbox && !termsCheckbox.checked) {
    termsTooltip?.classList.add('is-visible');
    ui.setLoading(submitBtn, false);
    termsCheckbox.focus();
    return;
  }

  const payload = {
    firstName: document.getElementById('firstName')?.value.trim(),
    lastName: document.getElementById('lastName')?.value.trim(),
    email: document.getElementById('regEmail')?.value.trim(),
    password: document.getElementById('regPassword')?.value,
    farmName: document.getElementById('farmName')?.value.trim(),
    farmSize: document.getElementById('farmSize')?.value
  };

  try {
    await api.post('/api/auth/register', payload, 'register');
    ui.setAlert(alertEl, 'Account created. You can log in now.', 'success', {
      linkText: 'Go to login',
      linkHref: 'login.html'
    });
  } catch (error) {
    ui.setAlert(
      alertEl,
      error.message || 'Registration failed. Please try again.',
      error.tone || 'error'
    );
  } finally {
    ui.setLoading(submitBtn, false);
  }
  }

  async function handleLogin(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const alertEl = document.getElementById('loginAlert');
    const submitBtn = form.querySelector('button[type="submit"]');
    ui.setAlert(alertEl, 'Login successful. Redirecting...', 'success');
    ui.setLoading(submitBtn, false);
    window.location.href = 'farmer/pages/dashboard.html';
  }

  async function handleChangePassword(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const alertEl = document.getElementById('changePasswordAlert');
    const submitBtn = form.querySelector('button[type="submit"]');
    ui.setAlert(alertEl, 'Password updated successfully.', 'success');
    ui.setLoading(submitBtn, false);
    form.reset();
  }
})();
