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
  const darkModeToggle = document.getElementById('darkModeToggle');
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', toggleDarkMode);
  }

  // Password visibility toggle
  const passwordToggle = document.getElementById('passwordToggle');
  if (passwordToggle) {
    passwordToggle.addEventListener('click', togglePasswordVisibility);
  }

  // Form submission (if not handled by TypeScript)
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      // Let TypeScript handle the actual login logic
      // This is just for fallback
      console.log('Login form submitted');
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
  
  console.log('Landing page (Login) initialized');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
