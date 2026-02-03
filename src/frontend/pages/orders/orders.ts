import './style.css';
import { ApiService } from '../../services/apiService';
import { formatCurrency } from '../../utils/currency';

// Interfaces based on API responses
interface OrderItem {
  product_id: string;
  product_name?: string;
  name?: string;
  quantity: number;
  price?: number;
}

interface Order {
  id: string;
  table_id: string;
  user_id: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED' | 'PAID';
  total: string; // Decimal string from DB
  items?: OrderItem[];
  observations?: string;
  created_at: string;
  tip?: string;
}

interface Table {
  id: string;
  number: number;
}

interface User {
  id: string;
  username: string;
  name: string;
}

// State
let orders: Order[] = [];
let users: User[] = [];
let tables: Table[] = [];
let searchTerm = '';

// DOM Elements
const searchInput = document.querySelector('.search-input') as HTMLInputElement;
const newOrderButton = document.querySelector(
  '.btn-new-order',
) as HTMLButtonElement;
const openOrdersContainer = document.getElementById('open-orders-grid');
const finishedOrdersContainer = document.getElementById('finished-orders-grid');

document.addEventListener('DOMContentLoaded', () => {
  init();
});

async function init() {
  initDarkMode();
  setupHeaderListeners();
  setupEventListeners();

  // console.log('Orders page initializing...');

  await Promise.all([loadOrders(), loadUsers(), loadTables()]);

  renderOrders();

  // Auto-refresh every 30 seconds
  setInterval(async () => {
    await loadOrders();
    renderOrders();
  }, 30000);
}

// --- Data Loading ---

async function loadOrders() {
  try {
    const response = await ApiService.get<{ data: Order[] }>('/orders');
    orders = response.data || [];
    // console.log('Orders loaded:', orders.length);
  } catch (error) {
    // console.error('Erro ao carregar pedidos:', error);
  }
}

async function loadUsers() {
  try {
    const response = await ApiService.get<{ data: User[] }>('/users');
    users = response.data || [];
  } catch (error) {
    // console.error('Erro ao carregar usuários:', error);
  }
}

async function loadTables() {
  try {
    const response = await ApiService.get<{ data: Table[] }>('/tables');
    tables = response.data || [];
  } catch (error) {
    // console.error('Erro ao carregar mesas:', error);
  }
}

// --- Rendering ---

function renderOrders() {
  const filteredOrders = filterOrders();

  const sortByTable = (a: Order, b: Order) => {
    const tableA = tables.find((t) => t.id === a.table_id);
    const tableB = tables.find((t) => t.id === b.table_id);
    const numA = tableA ? Number(tableA.number) : 0;
    const numB = tableB ? Number(tableB.number) : 0;
    return numA - numB;
  };

  const openOrders = filteredOrders
    .filter(
      (order) => order.status === 'OPEN' || order.status === 'IN_PROGRESS',
    )
    .sort(sortByTable);

  const finishedOrders = filteredOrders
    .filter((order) => order.status === 'CLOSED' || order.status === 'PAID')
    .sort(sortByTable);

  renderOrderList(openOrdersContainer, openOrders, 'open');
  renderOrderList(finishedOrdersContainer, finishedOrders, 'finished');
}

function filterOrders(): Order[] {
  if (!searchTerm) return orders;

  return orders.filter((order) => {
    const table = tables.find((t) => t.id === order.table_id);
    // Search by table number
    return table && table.number.toString().includes(searchTerm);
  });
}

function renderOrderList(
  container: HTMLElement | null,
  orderList: Order[],
  type: 'open' | 'finished',
) {
  if (!container) return;

  container.innerHTML = '';

  if (orderList.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.textContent =
      type === 'open' ? 'Nenhuma ordem em aberto' : 'Nenhuma ordem finalizada';
    emptyMessage.style.cssText =
      'grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--text-secondary); opacity: 0.7;';
    container.appendChild(emptyMessage);
    return;
  }

  orderList.forEach((order) => {
    const card = createOrderCard(order, type);
    container.appendChild(card);
  });
}

function createOrderCard(order: Order, type: 'open' | 'finished'): HTMLElement {
  const card = document.createElement('div');
  card.className = 'order-card';
  card.dataset.orderId = order.id;

  // Get related data
  const table = tables.find((t) => t.id === order.table_id);
  const user = users.find((u) => u.id === order.user_id);

  const tableNumber = table ? table.number : '?';

  // Use name from backend JOIN or fallback to local mapping
  const userName =
    (order as any).user_name ||
    (user ? user.username || user.name : 'Garçom');

  // Format price
  const total = order.total ? parseFloat(order.total) : 0;
  
  // Status Label
  const statusLabel = getStatusLabel(order.status);
  const statusClass = type === 'open' ? 'status-open' : 'status-finished';

  // Date and Time formatting
  let dateTimeString = 'Data não disponível';
  if (order.created_at) {
    // Try standard constructor
    let timeDate = new Date(order.created_at);
    
    // If invalid, try SQL format (replace space with T for ISO)
    if (isNaN(timeDate.getTime())) {
      const fixedDate = order.created_at.replace(' ', 'T');
      timeDate = new Date(fixedDate);
    }

    if (!isNaN(timeDate.getTime())) {
      // Format: "25/01/2026 às 14:30"
      const dateStr = timeDate.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
      const timeStr = timeDate.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      dateTimeString = `${dateStr} às ${timeStr}`;
    }
  }

  // Items List Construction
  let itemsHtml = '<div class="order-items-container"><p class="empty-items-text">Sem itens</p></div>';
  
  if (order.items && order.items.length > 0) {
    const itemsList = order.items.map(item => {
      const itemPrice = item.price ? parseFloat(item.price.toString()) : 0;
      const totalItemPrice = itemPrice * item.quantity;
      
      return `
        <div class="order-item-row">
          <div class="item-qty-badge">${item.quantity}x</div>
          <div class="item-details">
            <span class="item-name">${item.name || item.product_name || 'Item'}</span>
          </div>
          <div class="item-price">${formatCurrency(totalItemPrice)}</div>
        </div>
      `;
    }).join('');
    
    itemsHtml = `<div class="order-items-container">${itemsList}</div>`;
  }

  // Observations
  const obsHtml = order.observations 
    ? `<div class="order-obs-section">
         <span class="material-symbols-outlined obs-icon">sticky_note_2</span>
         <span class="obs-text">${order.observations}</span>
       </div>` 
    : '';

  card.innerHTML = `
    <div class="card-header">
      <div class="header-top">
        <span class="table-indicator">Mesa ${tableNumber}</span>
        <span class="order-id">#${order.id.substring(0, 6)}</span>
      </div>
      <div class="header-status">
         <span class="status-badge ${statusClass}">${statusLabel}</span>
         <span class="order-time">${dateTimeString}</span>
      </div>
    </div>

    <div class="card-body">
      ${itemsHtml}
    </div>

    <div class="card-footer">
      ${obsHtml}
      <div class="footer-info">
        <div class="waiter-info">
          <span class="material-symbols-outlined waiter-icon">person</span>
          <span class="waiter-name">${userName}</span>
        </div>
        <div class="total-price-section">
          <span class="total-label">Total</span>
          <span class="total-value">${formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  `;

  card.addEventListener('click', () => {
    if (table) {
      window.location.href = `./createOrder.html?table_id=${table.id}&order_id=${order.id}`;
    } else {
      showError('Erro: Mesa não encontrada para este pedido.');
    }
  });

  return card;
}

function getStatusLabel(status: string): string {
  const labels: { [key: string]: string } = {
    OPEN: 'Em aberto',
    IN_PROGRESS: 'Em andamento',
    CLOSED: 'Finalizado',
    PAID: 'Pago',
  };
  return labels[status] || status;
}

// --- Initialization & UI ---

function initDarkMode() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  // console.log('Init Dark Mode:', { savedTheme, prefersDark });

  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.body.classList.add('dark-mode');
    updateDarkModeIcon(true);
  } else {
    document.body.classList.remove('dark-mode');
    updateDarkModeIcon(false);
  }
}

function updateDarkModeIcon(isDark: boolean) {
  const darkModeToggle = document.getElementById('darkModeToggle');
  if (darkModeToggle) {
    const icon = darkModeToggle.querySelector('.material-symbols-outlined');
    if (icon) {
      icon.textContent = isDark ? 'dark_mode' : 'light_mode';
    }
  }
}

function toggleDarkMode() {
  // console.log('Toggling Dark Mode');
  const isDark = document.body.classList.toggle('dark-mode');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  updateDarkModeIcon(isDark);
  // console.log('Dark Mode is now:', isDark);
}

function setupHeaderListeners() {
  const darkModeToggle = document.getElementById('darkModeToggle');
  if (darkModeToggle) darkModeToggle.addEventListener('click', toggleDarkMode);

  const menuBtn = document.getElementById('menuBtn');
  const sidebar = document.getElementById('sidebar');
  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('active');
    });
  }

  const userBtn = document.getElementById('userBtn');
  if (userBtn) {
    userBtn.addEventListener('click', () => {
      // Optional: Navigate to profile
      // console.log('User profile clicked');
    });
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await ApiService.post('/auth/logout', {});
      } catch (e) {
        // console.error('Logout error', e);
      } finally {
        localStorage.removeItem('user');
        window.location.href = 'landingPage.html';
      }
    });
  }

  // Sidebar Links
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      const dest = (item as HTMLElement).dataset.href;
      if (dest) window.location.href = dest;
    });
  });

  const logo = document.querySelector('.logo-image');
  if (logo) {
    logo.addEventListener('click', () => {
      window.location.href = '/pages/waiterMain.html';
    });
  }
}

function setupEventListeners() {
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      searchTerm = target.value.trim();
      renderOrders();
    });
  }

  if (newOrderButton) {
    newOrderButton.addEventListener('click', () => {
      window.location.href = 'waiterMain.html?action=new_order';
    });
  }
}

function showError(message: string) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText =
    'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#ef4444;color:#fff;padding:10px;border-radius:5px;z-index:9999';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
