
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
 * Setup event listeners
 */
function setupEventListeners() {
  // Dark mode toggle
  const darkModeToggle = document.getElementById('darkModeToggle');
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', toggleDarkMode);
  }

  // Back button
  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      console.log('Back button clicked');
      window.history.back();
    });
  }

  // User button
  const userBtn = document.getElementById('userBtn');
  if (userBtn) {
    userBtn.addEventListener('click', () => {
      console.log('User profile clicked');
      // TODO: Navigate to user profile
    });
  }

  // Logo click
  const logoImage = document.getElementById('logoImage');
  if (logoImage) {
    logoImage.addEventListener('click', () => {
      console.log('Logo clicked');
      // TODO: Navigate to home
    });
  }

  // Photo upload button
  const photoUploadBtn = document.getElementById('photoUploadBtn');
  if (photoUploadBtn) {
    photoUploadBtn.addEventListener('click', () => {
      console.log('Photo upload clicked');
      // TODO: Open file picker
    });
  }

  // Form submission
  const userForm = document.getElementById('userForm');
  if (userForm) {
    userForm.addEventListener('submit', (e) => {
      e.preventDefault();
      console.log('User form submitted');
      // TODO: Handle form submission
    });
  }
}

/**
 * Initialize page
 */
function init() {
  // Initialize dark mode first (must be before any early returns)
  initDarkMode();
  
  // Setup UI event listeners (must be second)
  setupEventListeners();
  
  console.log('Create User page initialized');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
