require('./style.css');

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
      console.log('Menu clicked');
      // TODO: Open navigation menu
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

  // New order button
  const newOrderBtn = document.getElementById('newOrderBtn');
  if (newOrderBtn) {
    newOrderBtn.addEventListener('click', () => {
      console.log('New order clicked');
      // TODO: Navigate to order creation
    });
  }
}

// Load tables from backend
async function loadTables() {
  try {
    const response = await fetch(`${API_BASE}/tables`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      console.error('Error loading tables');
      return;
    }
    
    const data = await response.json();
    const tables = data.data || [];
    
    // Render occupied tables
    renderOccupiedTables(tables.filter(t => t.status === 'OCCUPIED'));
    
    // Render all tables
    renderAllTables(tables);
    
  } catch (error) {
    console.error('Error:', error);
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
  console.log('Table clicked:', tableId);
}

// Load summary data
async function loadSummary() {
  try {
    const response = await fetch(`${API_BASE}/orders`, {
      credentials: 'include'
    });
    
    if (!response.ok) return;
    
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
    if (subtitleEl) subtitleEl.textContent = `${todayOrders.length} mesas atendidas hoje`;
    
  } catch (error) {
    console.error('Error loading summary:', error);
  }
}


function init() {
  initDarkMode();
  setupEventListeners();
  loadTables();
  loadSummary();
  setInterval(() => {
    loadTables();
    loadSummary();
  }, 30000);
  
  console.log('WaiterMain page initialized');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
