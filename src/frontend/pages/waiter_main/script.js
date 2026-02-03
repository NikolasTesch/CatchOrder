require('./style.css');
// API Configuration
const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : (window.location.pathname.includes('/server09/') ? '/server09/api' : '/api');

/**
 * Check if user is authenticated
 */
function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'landingPage.html';
    return false;
  }
  return true;
}

/**
 * Get authorization headers
 */
function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

/**
 * Handle API errors
 */
function handleApiError(error, response) {
  if (response && response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'landingPage.html';
    return;
  }

  // Show error message to user
  showNotification('Erro ao carregar dados. Tente novamente.', 'error');
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
  // Notification system not implemented yet
}

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

function toggleDarkMode() {
  const isDark = document.body.classList.toggle('dark-mode');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  updateDarkModeIcon(isDark);
}


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
 * Setup UI event listeners
 */
function setupEventListeners() {
  // Dark mode toggle
  const darkModeToggle = document.getElementById('darkModeToggle');
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', toggleDarkMode);
  }

  // Menu button
  const menuBtn = document.getElementById('menuBtn');
  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      // Menu functionality handled in TypeScript
    });
  }

  // User button
  const userBtn = document.getElementById('userBtn');
  if (userBtn) {
    userBtn.addEventListener('click', () => {
      // User profile functionality handled in TypeScript
    });
  }

  // Logo click
  const logoImage = document.getElementById('logoImage');
  if (logoImage) {
    logoImage.addEventListener('click', () => {
      // Logo click functionality handled in TypeScript
    });
  }

  // New order button
  const newOrderBtn = document.getElementById('newOrderBtn');
  if (newOrderBtn) {
    newOrderBtn.addEventListener('click', () => {
      window.location.href = 'createOrder.html';
    });
  }

}


/**
 * Handle user logout
 */
function handleLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'landingPage.html';
}

// Load tables from backend
async function loadTables() {
  try {
    const response = await fetch(`${API_BASE}/tables`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include'
    });

    if (!response.ok) {
      handleApiError(new Error('Failed to load tables'), response);
      return;
    }

    const data = await response.json();
    const tables = data.data || [];

    // Render occupied tables
    renderOccupiedTables(tables.filter(t => t.status === 'OCCUPIED'));

    // Render all tables
    renderAllTables(tables);

  } catch (error) {
    handleApiError(error, null);
  }
}

function renderOccupiedTables(tables) {
  const container = document.querySelector('.occupied-scroll');
  if (!container) return;

  container.innerHTML = tables.length > 0
    ? tables.map(table => `
        <button class="table-card occupied" data-table-id="${table.id}" aria-label="Mesa ${table.number}">
          <span class="table-number">${table.number}</span>
        </button>
      `).join('')
    : '<p class="empty-message">Nenhuma mesa ocupada</p>';

  container.querySelectorAll('.table-card').forEach(card => {
    card.addEventListener('click', () => handleTableClick(card.dataset.tableId));
  });
}

function renderAllTables(tables) {
  const container = document.querySelector('.tables-grid');
  if (!container) return;

  container.innerHTML = tables.map(table => `
    <button class="table-card ${table.status.toLowerCase()}" data-table-id="${table.id}" aria-label="Mesa ${table.number}">
      <span class="table-number">${table.number}</span>
    </button>
  `).join('');

  // Add click listeners
  container.querySelectorAll('.table-card').forEach(card => {
    card.addEventListener('click', () => handleTableClick(card.dataset.tableId));
  });
}

function handleTableClick(tableId) {
  window.location.href = `orders.html?tableId=${tableId}`;
}

// Load summary data
async function loadSummary() {
  try {
    const response = await fetch(`${API_BASE}/orders`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include'
    });

    if (!response.ok) {
      handleApiError(new Error('Failed to load summary'), response);
      return;
    }

    const data = await response.json();
    const orders = data.data || [];

    // Calculate today's total
    const today = new Date().toDateString();
    const todayOrders = orders.filter(o => {
      const orderDate = new Date(o.created_at).toDateString();
      return orderDate === today && o.status === 'CLOSED';
    });

    const total = todayOrders.reduce((sum, order) => sum + (order.total || 0), 0);

    // Update UI
    const valueEl = document.querySelector('.summary-value');
    const subtitleEl = document.querySelector('.summary-subtitle');

    if (valueEl) valueEl.textContent = `R$ ${total.toFixed(2)}`;
    if (subtitleEl) subtitleEl.textContent = `${todayOrders.length} mesa${todayOrders.length !== 1 ? 's' : ''} atendida${todayOrders.length !== 1 ? 's' : ''} hoje`;

  } catch (error) {
    handleApiError(error, null);
  }
}

/**
 * Display user info
 */
function displayUserInfo() {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      // User info is displayed in the profile popover
    } catch (error) {
      // Error handling for user data parsing
    }
  }
}

function init() {
  // Check authentication first
  if (!checkAuth()) {
    return;
  }

  displayUserInfo();
  initDarkMode();
  setupEventListeners();
  loadTables();
  loadSummary();

  // Auto-refresh every 30 seconds
  setInterval(() => {
    loadTables();
    loadSummary();
  }, 30000);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
