require('./style.css');
/* ========================================
   PAYMENT PAGE - JAVASCRIPT
   Dark Mode & Event Listeners
   ======================================== */

/**
 * Initialize dark mode
 * Checks localStorage and system preferences
 * Must be called first on page load
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
 * Update dark mode toggle icon
 * @param {boolean} isDark - Whether dark mode is active
 */
function updateDarkModeIcon(isDark) {
  const icon = document.querySelector('#darkModeToggle .material-symbols-outlined');
  if (icon) {
    icon.textContent = isDark ? 'dark_mode' : 'light_mode';
  }
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
  // Dark mode toggle
  const darkModeBtn = document.getElementById('darkModeToggle');
  if (darkModeBtn) {
    darkModeBtn.addEventListener('click', toggleDarkMode);
  }

  // Menu button
  const menuBtn = document.getElementById('menuBtn');
  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      // TODO: Implement menu functionality
      console.log('Menu button clicked');
    });
  }

  // User button
  const userBtn = document.getElementById('userBtn');
  if (userBtn) {
    userBtn.addEventListener('click', () => {
      // TODO: Implement user profile functionality
      console.log('User button clicked');
    });
  }

  // Logo click
  const logo = document.querySelector('.logo-image');
  if (logo) {
    logo.addEventListener('click', () => {
      // TODO: Navigate to home page
      console.log('Logo clicked - navigate to home');
    });
  }

  // Payment method buttons
  const paymentBtns = document.querySelectorAll('.payment-btn');
  paymentBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      // Remove active class from all buttons
      paymentBtns.forEach(b => b.classList.remove('active'));
      // Add active class to clicked button
      this.classList.add('active');
      
      // Log selected payment method
      const method = this.querySelector('.material-symbols-outlined')?.textContent ||
                     this.querySelector('.pix-text')?.textContent;
      console.log('Payment method selected:', method);
    });
  });
}

/**
 * Initialize the application
 */
async function init() {
  // CRITICAL: Dark mode must be initialized first
  initDarkMode();
  
  // Setup event listeners second
  setupEventListeners();
  
  // Additional initialization logic can go here
  console.log('Payment page initialized');
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
