require('./style.css');
// API Configuration
const API_BASE = 'http://localhost:3000/api';

/**
 * Check if user is authenticated
 */
function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/pages/landingPage.html';
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
  console.error('API Error:', error);
  
  if (response && response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/pages/landingPage.html';
    return;
  }
  
  // Show error message to user
  showNotification('Erro ao carregar dados. Tente novamente.', 'error');
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
  // TODO: Implement a proper notification system
  console.log(`[${type.toUpperCase()}] ${message}`);
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
  // Elements
  const menuBtn = document.getElementById('menuBtn');
  const closeSidebarBtn = document.getElementById('closeSidebarBtn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  
  const userBtn = document.getElementById('userBtn');
  const userDropdown = document.getElementById('userDropdown');
  
  const newOrderBtn = document.getElementById('newOrderBtn');
  const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');
  const userLogoutBtn = document.getElementById('userLogoutBtn');
  const darkModeToggle = document.getElementById('darkModeToggle');

  // Sidebar Toggles
  function toggleSidebar() {
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    // Close dropdown if open
    userDropdown.classList.remove('active');
  }

  function closeAll() {
    sidebar.classList.remove('active');
    userDropdown.classList.remove('active');
    overlay.classList.remove('active');
  }

  if (menuBtn) menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleSidebar();
  });

  if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', closeAll);
  if (overlay) overlay.addEventListener('click', closeAll);

  // User Dropdown Check
  if (userBtn) userBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    userDropdown.classList.toggle('active');
    // Close sidebar if open
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (userDropdown && !userDropdown.contains(e.target) && !userBtn.contains(e.target)) {
      userDropdown.classList.remove('active');
    }
  });

  // Dark mode
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', toggleDarkMode);
  }

  // Redirections
  if (newOrderBtn) {
    newOrderBtn.addEventListener('click', () => {
      window.location.href = '/pages/createOrder.html';
    });
  }

  // Logout
  if (sidebarLogoutBtn) sidebarLogoutBtn.addEventListener('click', handleLogout);
  if (userLogoutBtn) userLogoutBtn.addEventListener('click', handleLogout);
  
  // Fill user info
  displayUserInfo();
}

/**
 * Handle user logout
 */
function handleLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/pages/landingPage.html';
}

/**
 * Display user info
 */
function displayUserInfo() {
  const userStr = localStorage.getItem('user');
  console.log('DisplayUserInfo - Raw:', userStr);
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      console.log('DisplayUserInfo - Parsed:', user);
      
      const nameDisplay = document.getElementById('userNameDisplay');
      const roleDisplay = document.getElementById('userRoleDisplay');
      
      if (nameDisplay) {
        nameDisplay.textContent = user.username || 'Usuário';
        console.log('Set Name:', nameDisplay.textContent);
      }
      if (roleDisplay) {
        // Capitalize role
        const role = user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()) : 'Garçom';
        roleDisplay.textContent = role;
        console.log('Set Role:', roleDisplay.textContent);
      }
      
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }
}

function handleTableClick(tableId) {
  console.log('Table clicked:', tableId);
  // Navigate to order details page
  window.location.href = `/pages/orders.html?tableId=${tableId}`;
}

// Load active orders and summary
async function loadOrdersAndSummary() {
  try {
    const response = await fetch(`${API_BASE}/orders`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    
    if (!response.ok) {
      handleApiError(new Error('Failed to load orders'), response);
      return;
    }
    
    const data = await response.json();
    const orders = data.data || [];
    
    // 1. Update Summary (Today's Total)
    updateSummary(orders);
    
    // 2. Render Active Orders
    renderActiveOrders(orders);
    
  } catch (error) {
    handleApiError(error, null);
  }
}

function updateSummary(orders) {
  const today = new Date().toDateString();
  const todayOrders = orders.filter(o => {
    const orderDate = new Date(o.created_at).toDateString();
    return orderDate === today && o.status === 'CLOSED';
  });
  
  const total = todayOrders.reduce((sum, order) => sum + (order.total || 0), 0);
  
  const valueEl = document.querySelector('.summary-value');
  const subtitleEl = document.querySelector('.summary-subtitle');
  
  if (valueEl) valueEl.textContent = `R$ ${total.toFixed(2)}`;
  if (subtitleEl) subtitleEl.textContent = `${todayOrders.length} mesa${todayOrders.length !== 1 ? 's' : ''} atendida${todayOrders.length !== 1 ? 's' : ''} hoje`;
}

function renderActiveOrders(orders) {
  const container = document.getElementById('activeOrdersList');
  if (!container) return;

  // Filter for active orders (OPEN or IN_PROGRESS)
  // TODO: Add filter by current user if backend supports separate endpoint or user_id in response
  const activeOrders = orders.filter(o => o.status !== 'CLOSED' && o.status !== 'CANCELLED');

  if (activeOrders.length === 0) {
    container.innerHTML = '<p class="empty-message">Nenhum pedido em andamento</p>';
    return;
  }

  container.innerHTML = activeOrders.map(order => `
    <div class="order-card-monitor" onclick="window.location.href='/pages/orders.html?orderId=${order.id}'" style="cursor: pointer;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span style="font-weight: bold;">#${order.id.toString().slice(0, 8)}</span>
        <span style="color: var(--color-primary); font-weight: bold;">R$ ${order.total ? order.total.toFixed(2) : '0.00'}</span>
      </div>
      <div style="font-size: 0.875rem; color: var(--text-secondary);">
        Mesa ${order.table_id ? '...' : '?'} <!-- Ideal seria ter o numero da mesa -->
      </div>
      <div style="margin-top: 8px;">
         <span class="badge" style="background: var(--bg-primary); padding: 4px 8px; border-radius: 4px; font-size: 0.75rem;">${order.status}</span>
      </div>
    </div>
  `).join('');
}


/**
 * Display user info
 */
function displayUserInfo() {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      console.log('Logged in as:', user.username);
      // TODO: Display user name in UI if needed
    } catch (error) {
      console.error('Error parsing user data:', error);
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
  loadOrdersAndSummary();
  
  // Auto-refresh every 30 seconds
  setInterval(() => {
    loadTables();
    loadOrdersAndSummary();
  }, 30000);
  
  console.log('WaiterMain page initialized');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
