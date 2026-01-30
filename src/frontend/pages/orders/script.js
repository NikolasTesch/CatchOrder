require ('./style.css');
// Orders Page - JavaScript Functionality
// Displays and manages orders with backend integration

const API_BASE = '/api';

// State management
let orders = [];
let users = [];
let tables = [];
let searchTerm = '';

// DOM Elements
const searchInput = document.querySelector('.search-input');
const newOrderButton = document.querySelector('.btn-new-order');
const openOrdersSection = document.querySelector('.orders-section:nth-of-type(1) .section-title').parentElement;
const finishedOrdersSection = document.querySelector('.orders-section:nth-of-type(2) .section-title').parentElement;


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


async function init() {
  initDarkMode();
  setupHeaderListeners();
  
  await Promise.all([
    loadOrders(),
    loadUsers(),
    loadTables()
  ]);
  
  renderOrders();
  setupEventListeners();
  
  // Auto-refresh every 30 seconds
  setInterval(async () => {
    await loadOrders();
    renderOrders();
  }, 30000);
}

/**
 * Load orders from API
 */
async function loadOrders() {
  try {
    const response = await fetch(`${API_BASE}/orders`);
    if (!response.ok) throw new Error('Erro ao carregar pedidos');
    
    const data = await response.json();
    orders = data.data || [];
  } catch (error) {
    console.error('Erro ao carregar pedidos:', error);
    showError('Erro ao carregar pedidos');
  }
}

/**
 * Load users from API
 */
async function loadUsers() {
  try {
    const response = await fetch(`${API_BASE}/users`);
    if (!response.ok) throw new Error('Erro ao carregar usuários');
    
    const data = await response.json();
    users = data.data || [];
  } catch (error) {
    console.error('Erro ao carregar usuários:', error);
  }
}

/**
 * Load tables from API
 */
async function loadTables() {
  try {
    const response = await fetch(`${API_BASE}/tables`);
    if (!response.ok) throw new Error('Erro ao carregar mesas');
    
    const data = await response.json();
    tables = data.data || [];
  } catch (error) {
    console.error('Erro ao carregar mesas:', error);
  }
}

/**
 * Render orders grouped by status
 */
function renderOrders() {
  const filteredOrders = filterOrders();
  
  const openOrders = filteredOrders.filter(order => 
    order.status === 'OPEN' || order.status === 'IN_PROGRESS'
  );
  
  const finishedOrders = filteredOrders.filter(order => 
    order.status === 'CLOSED' || order.status === 'PAID'
  );
  
  renderOpenOrders(openOrders);
  renderFinishedOrders(finishedOrders);
}

/**
 * Filter orders by search term (table number)
 */
function filterOrders() {
  if (!searchTerm) return orders;
  
  return orders.filter(order => {
    const table = tables.find(t => t.id === order.table_id);
    return table && table.table_number.toString().includes(searchTerm);
  });
}

/**
 * Render open orders
 */
function renderOpenOrders(openOrders) {
  const container = openOrdersSection;
  
  // Remove existing order cards (keep title)
  const existingCards = container.querySelectorAll('.order-card');
  existingCards.forEach(card => card.remove());
  
  if (openOrders.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.textContent = 'Nenhuma ordem em aberto';
    emptyMessage.style.cssText = 'text-align: center; padding: 2rem; color: var(--neutral-60);';
    container.appendChild(emptyMessage);
    return;
  }
  
  openOrders.forEach(order => {
    const card = createOrderCard(order, 'open');
    container.appendChild(card);
  });
}

/**
 * Render finished orders
 */
function renderFinishedOrders(finishedOrders) {
  const container = finishedOrdersSection;
  
  // Remove existing order cards (keep title)
  const existingCards = container.querySelectorAll('.order-card');
  existingCards.forEach(card => card.remove());
  
  if (finishedOrders.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.textContent = 'Nenhuma ordem finalizada';
    emptyMessage.style.cssText = 'text-align: center; padding: 2rem; color: var(--neutral-60);';
    container.appendChild(emptyMessage);
    return;
  }
  
  finishedOrders.forEach(order => {
    const card = createOrderCard(order, 'finished');
    container.appendChild(card);
  });
}

/**
 * Create order card element
 */
function createOrderCard(order, type) {
  const card = document.createElement('div');
  card.className = 'order-card';
  card.dataset.orderId = order.id;
  
  // Get related data
  const table = tables.find(t => t.id === order.table_id);
  const user = users.find(u => u.id === order.user_id);
  const tableNumber = table ? table.table_number : '?';
  const userName = user ? user.username : 'Desconhecido';
  
  // Format price
  const price = order.total ? parseFloat(order.total).toFixed(2) : '0.00';
  
  // Get status label
  const statusLabel = getStatusLabel(order.status);
  const statusClass = type === 'open' ? 'status-open' : 'status-finished';
  
  // Build items description
  const itemsDescription = order.items && order.items.length > 0
    ? order.items.map(item => `${item.quantity}x ${item.product_name || 'Item'}`).join(', ')
    : 'Sem itens';
  
  // Get observations
  const observations = order.observations || 'Sem observações';
  
  card.innerHTML = `
    <div class="order-header">
      <h3 class="order-title">Ordem #${order.id.substring(0, 8)}</h3>
      <span class="order-status ${statusClass}">${statusLabel}</span>
      <span class="table-badge">${tableNumber}</span>
    </div>
    <div class="order-info">
      <p class="order-price">R$ ${price}</p>
      <p class="order-description">${itemsDescription}</p>
    </div>
    <div class="order-footer">
      <p class="order-obs">Obs: ${observations}</p>
      <button class="btn-waiter">${userName}</button>
    </div>
  `;
  
  // Add click handler to view details
  card.addEventListener('click', () => viewOrderDetails(order));
  
  return card;
}

/**
 * Get status label in Portuguese
 */
function getStatusLabel(status) {
  const labels = {
    'OPEN': 'Em aberto',
    'IN_PROGRESS': 'Em andamento',
    'CLOSED': 'Finalizado',
    'PAID': 'Pago'
  };
  return labels[status] || status;
}

/**
 * View order details (could open modal or navigate)
 */
async function viewOrderDetails(order) {
  try {
    // Fetch full order details with items
    const response = await fetch(`${API_BASE}/orders/${order.id}`);
    if (!response.ok) throw new Error('Erro ao carregar detalhes do pedido');
    
    const data = await response.json();
    const fullOrder = data.data;
    
    // Show details in modal or console
    console.log('Detalhes da ordem:', fullOrder);
    
    // You could implement a modal here to show full details
    showSuccess(`Ordem #${order.id.substring(0, 8)} - Status: ${getStatusLabel(order.status)}`);
    
  } catch (error) {
    console.error('Erro ao carregar detalhes:', error);
    showError('Erro ao carregar detalhes do pedido');
  }
}

/**
 * Setup header event listeners (dark mode, user, menu, logo)
 */
function setupHeaderListeners() {
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
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Search functionality
  searchInput.addEventListener('input', (e) => {
    searchTerm = e.target.value.trim();
    renderOrders();
  });
  
  // New order button
  newOrderButton.addEventListener('click', () => {
    // Navigate to table selection or create order page
    window.location.href = '/waiter_main/waiterMain.html';
  });
}

/**
 * Show success message
 */
function showSuccess(message) {
  const toast = document.createElement('div');
  toast.className = 'toast toast-success';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: #10b981;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    z-index: 9999;
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * Show error message
 */
function showError(message) {
  const toast = document.createElement('div');
  toast.className = 'toast toast-error';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: #ef4444;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    z-index: 9999;
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
  
  .order-card {
    cursor: pointer;
    transition: transform 0.2s ease;
  }
  
  .order-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
`;
document.head.appendChild(style);

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);
