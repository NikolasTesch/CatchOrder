// Create Products Page - JavaScript Functionality

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
      // TODO: Navigate back or to previous page
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

  // Tab switching
  const cadastroTab = document.getElementById('cadastroTab');
  const estoqueTab = document.getElementById('estoqueTab');

  if (cadastroTab) {
    cadastroTab.addEventListener('click', () => {
      setActiveTab('cadastro');
    });
  }

  if (estoqueTab) {
    estoqueTab.addEventListener('click', () => {
      setActiveTab('estoque');
    });
  }
}

/**
 * Set active tab
 */
function setActiveTab(tabName) {
  const cadastroTab = document.getElementById('cadastroTab');
  const estoqueTab = document.getElementById('estoqueTab');

  if (tabName === 'cadastro') {
    cadastroTab?.classList.add('active');
    cadastroTab?.setAttribute('aria-selected', 'true');
    estoqueTab?.classList.remove('active');
    estoqueTab?.setAttribute('aria-selected', 'false');
    // TODO: Show cadastro content
  } else if (tabName === 'estoque') {
    estoqueTab?.classList.add('active');
    estoqueTab?.setAttribute('aria-selected', 'true');
    cadastroTab?.classList.remove('active');
    cadastroTab?.setAttribute('aria-selected', 'false');
    // TODO: Show estoque content
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
  
  // Page-specific initialization
  console.log('Create Products page initialized');
  
  // TODO: Load categories
  // TODO: Setup form validation
  // TODO: Setup submit handler
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
