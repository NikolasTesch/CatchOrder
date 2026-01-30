// Landing Page (Login) - JavaScript Functionality

/**
 * Initialize dark mode based on user preference
 */
function initDarkMode() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.body.classList.add('dark-mode');
    updateDarkModeIcon(true);
  } else {
    updateDarkModeIcon(false);
  }
}

/**
 * Toggle dark mode on/off
 */
function toggleDarkMode() {
  const isDark = document.body.classList.toggle('dark-mode');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  updateDarkModeIcon(isDark);
}

/**
 * Update dark mode toggle button icon
 */
function updateDarkModeIcon(isDark) {
  const darkModeToggle = document.getElementById('darkModeToggle');
  if (darkModeToggle) {
    const icon = darkModeToggle.querySelector('.material-symbols-outlined');
    if (icon) {
      icon.textContent = isDark ? 'dark_mode' : 'light_mode';
    }
  }
}

/**
 * Toggle password visibility
 */
function togglePasswordVisibility() {
  const passwordInput = document.getElementById('password');
  const passwordToggle = document.getElementById('passwordToggle');
  const icon = passwordToggle?.querySelector('.material-symbols-outlined');
  
  if (passwordInput && icon) {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    icon.textContent = isPassword ? 'visibility_off' : 'visibility';
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Dark mode toggle
  const darkModeToggle = document.getElementById("darkModeToggle");
  if (darkModeToggle) {
    darkModeToggle.addEventListener("click", toggleDarkMode);
  }

  // Password visibility toggle
  const passwordToggle = document.getElementById("passwordToggle");
  if (passwordToggle) {
    passwordToggle.addEventListener("click", togglePasswordVisibility);
  }

  // Setup form validation
  const loginForm = document.getElementById("loginForm");
  if (loginForm && window.FormValidator) {
    // Define validation rules
    const validationConfig = {
      username: [
        { rule: "required", message: "Nome de usuário é obrigatório" },
        {
          rule: "minLength",
          params: [3],
          message: "Nome de usuário deve ter no mínimo 3 caracteres",
        },
      ],
      password: [
        { rule: "required", message: "Senha é obrigatória" },
        {
          rule: "minLength",
          params: [6],
          message: "Senha deve ter no mínimo 6 caracteres",
        },
      ],
    };

    // Setup real-time validation
    FormValidator.setupForm(loginForm, validationConfig);

    // Handle valid form submission
    loginForm.addEventListener("formValid", async (e) => {
      const form = e.detail.form;
      const submitBtn = form.querySelector('button[type="submit"]');

      // Show loading state
      if (window.LoadingHelper) {
        LoadingHelper.setButtonLoading(submitBtn, true);
      }

      try {
        // Get form data
        const username = form.querySelector("#username").value;
        const password = form.querySelector("#password").value;

        // Simulate API call (replace with actual login logic)
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Example: successful login
        if (window.toast) {
          toast.success("Login realizado com sucesso!");
        }

        // Redirect to dashboard (replace with actual logic)
        setTimeout(() => {
          // window.location.href = '/pages/gest_main/gestMain.html';
          console.log("Redirecting to dashboard...");
        }, 500);
      } catch (error) {
        console.error("Login error:", error);
        if (window.toast) {
          toast.error("Erro ao fazer login. Verifique suas credenciais.");
        }
      } finally {
        // Remove loading state
        if (window.LoadingHelper) {
          LoadingHelper.setButtonLoading(submitBtn, false);
        }
      }
    });
  }
}

/**
 * Initialize page
 */
function init() {
  // Initialize dark mode first (must be before any early returns)
  initDarkMode();

  // Setup UI event listeners
  setupEventListeners();

  console.log("Landing page (Login) initialized with form validation");
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
