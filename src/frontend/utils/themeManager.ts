/**
 * Theme Manager - Centralized Dark Mode Management
 * 
 * This module provides a centralized way to manage dark mode across all pages.
 * It handles theme initialization, toggling, and persistence using localStorage.
 * 
 * Features:
 * - Automatic theme detection based on user preference
 * - Persistent theme storage
 * - Icon update synchronization
 * - Event-driven architecture to prevent multiple listeners
 * - Cross-page theme consistency
 */

export type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'theme';
const DARK_MODE_CLASS = 'dark-mode';
const DARK_MODE_TOGGLE_ID = 'darkModeToggle';

// State management to prevent multiple initializations
let isInitialized = false;
let currentTheme: Theme | null = null;

/**
 * Gets the user's preferred theme from system settings
 */
function getSystemPreference(): Theme {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

/**
 * Gets the saved theme from localStorage or falls back to system preference
 */
function getSavedTheme(): Theme {
  const saved = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
  return saved || getSystemPreference();
}

/**
 * Applies the theme to the document
 */
function applyTheme(theme: Theme): void {
  if (theme === 'dark') {
    document.body.classList.add(DARK_MODE_CLASS);
  } else {
    document.body.classList.remove(DARK_MODE_CLASS);
  }
  currentTheme = theme;
}

/**
 * Updates the dark mode toggle icon
 */
function updateToggleIcon(isDark: boolean): void {
  const toggle = document.getElementById(DARK_MODE_TOGGLE_ID);
  if (!toggle) return;

  const icon = toggle.querySelector('.material-symbols-outlined');
  if (icon) {
    icon.textContent = isDark ? 'light_mode' : 'dark_mode';
  }
}

/**
 * Toggles between light and dark themes
 */
function toggleTheme(): void {
  const isDark = document.body.classList.toggle(DARK_MODE_CLASS);
  const newTheme: Theme = isDark ? 'dark' : 'light';
  
  localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  currentTheme = newTheme;
  updateToggleIcon(isDark);
}

/**
 * Sets up event listeners for theme toggle
 */
function setupEventListeners(): void {
  const toggle = document.getElementById(DARK_MODE_TOGGLE_ID);
  if (!toggle) {
    console.warn('[ThemeManager] Dark mode toggle button not found');
    return;
  }

  // Remove any existing listeners to prevent duplicates
  const newToggle = toggle.cloneNode(true) as HTMLElement;
  toggle.parentNode?.replaceChild(newToggle, toggle);
  
  // Add fresh event listener
  newToggle.addEventListener('click', toggleTheme);
}

/**
 * Listens for system theme changes
 */
function setupSystemThemeListener(): void {
  if (!window.matchMedia) return;

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  // Only update if user hasn't set a manual preference
  mediaQuery.addEventListener('change', (e) => {
    if (!localStorage.getItem(THEME_STORAGE_KEY)) {
      const newTheme: Theme = e.matches ? 'dark' : 'light';
      applyTheme(newTheme);
      updateToggleIcon(e.matches);
    }
  });
}

/**
 * Initializes the theme system
 * Should be called once per page load
 */
export function initTheme(): void {
  // Prevent double initialization
  if (isInitialized) {
    console.warn('[ThemeManager] Already initialized. Skipping...');
    return;
  }

  const theme = getSavedTheme();
  applyTheme(theme);
  updateToggleIcon(theme === 'dark');
  
  // Setup listeners after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setupEventListeners();
      setupSystemThemeListener();
    });
  } else {
    setupEventListeners();
    setupSystemThemeListener();
  }

  isInitialized = true;
}

/**
 * Gets the current theme
 */
export function getCurrentTheme(): Theme {
  return currentTheme || getSavedTheme();
}

/**
 * Sets the theme programmatically
 */
export function setTheme(theme: Theme): void {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  applyTheme(theme);
  updateToggleIcon(theme === 'dark');
}

/**
 * Resets initialization state (useful for testing)
 */
export function resetThemeManager(): void {
  isInitialized = false;
  currentTheme = null;
}
