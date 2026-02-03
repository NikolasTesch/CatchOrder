import '../../styles/global.css';
import './style.css';
import { ApiService } from '../../services/apiService';
import { initHamburgerMenu } from '../../components/hamburgerMenu/hamburgerMenu';

// Interfaces
interface OrderItem {
  product_id: string;
  product_name?: string;
  name?: string;
  quantity: number;
  price?: number;
}

interface Table {
  id: string;
  number: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
}

interface Order {
  id: string;
  table_id: string;
  user_id: string;
  status: 'OPEN' | 'CLOSED' | 'CANCELLED';
  total: number;
  tip: number;
  created_at?: string;
  opened_at?: string;
  items?: OrderItem[];
}

interface User {
  id: string;
  name: string;
  username: string;
  role: string;
}

// State
let currentUser: User | null = null;

// DOM Elements
const logoutBtn = document.getElementById('logoutBtn');
const darkModeToggle = document.getElementById('darkModeToggle');

async function init() {
  // Check authentication and load user data
  const user = await loadCurrentUser();
  if (!user) return;

  initDarkMode();
  setupEventListeners();
  updateDateDisplay();
  loadTables();
  loadSummary();
  loadActiveOrders(); // NEW

  // Check for auto-open modal
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('action') === 'new_order') {
    openTableSelectionModal();
    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  // Auto-refresh every 30 seconds
  setInterval(() => {
    loadTables();
    loadSummary();
    loadActiveOrders(); // NEW
  }, 30000);

  // console.log('WaiterMain page initialized (TS)');
}

// Utility Functions
function formatCurrentDate(): string {
  const days = [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
  ];
  const months = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];

  const now = new Date();
  const dayOfWeek = days[now.getDay()];
  const day = now.getDate();
  const month = months[now.getMonth()];
  const year = now.getFullYear();

  return `${dayOfWeek}, ${day} de ${month} de ${year}`;
}

function formatCurrency(cents: number): string {
  const reais = cents / 100;
  return reais.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function updateDateDisplay() {
  const titleEl = document.querySelector('.summary-title');
  if (titleEl) {
    titleEl.textContent = formatCurrentDate();
  }
}

async function loadCurrentUser(): Promise<User | null> {
  try {
    const response = await ApiService.get<{ user: User }>('/auth/me');
    currentUser = response.user;
    return currentUser;
  } catch (error) {
    // console.error('Failed to load user:', error);
    window.location.href = 'landingPage.html';
    return null;
  }
}

// Dark Mode
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

function updateDarkModeIcon(isDark: boolean) {
  const icon = darkModeToggle?.querySelector('.material-symbols-outlined');
  if (icon) {
    icon.textContent = isDark ? 'dark_mode' : 'light_mode';
  }
}

// Event Listeners
function setupEventListeners() {
  // Dark mode
  if (darkModeToggle) {
    darkModeToggle.addEventListener("click", toggleDarkMode);
  }

  // Hamburger menu (centralized component)
  initHamburgerMenu();

  // New Order Button - Scroll to Available Tables
  const newOrderBtn = document.getElementById("newOrderBtn");
  if (newOrderBtn) {
    newOrderBtn.addEventListener("click", () => {
      const availableSection = document.getElementById("availableTablesSection");
      if (availableSection) {
        availableSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Modal Close
  const closeTableModal = document.getElementById("closeTableModal");
  const modalOverlay = document.getElementById("tableModalOverlay");
  if (closeTableModal && modalOverlay) {
    closeTableModal.addEventListener("click", () => {
      modalOverlay.classList.remove("active");
    });
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) modalOverlay.classList.remove("active");
    });
  }

  // Logout
  const logoutBtnHeader = document.getElementById("logoutBtn");
  if (logoutBtnHeader) {
    logoutBtnHeader.addEventListener("click", handleLogout);
  }

  // Logo Click
  const logoImage = document.getElementById("logoImage");
  if (logoImage) {
    logoImage.addEventListener("click", () => {
      window.location.href = "waiterMain.html";
    });
  }

  // User Profile Click
  const userBtn = document.getElementById("userBtn");
  const headerActions = document.querySelector(
    ".header-actions",
  ) as HTMLElement;

  if (headerActions) {
    headerActions.style.position = "relative";
  }

  if (userBtn) {
    userBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleProfilePopover(userBtn);
    });
  }

  // Close popovers on click outside
  document.addEventListener("click", () => {
    closePopovers();
  });

  // Sidebar Navigation Links
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const dest = (item as HTMLElement).dataset.href;
      if (dest) window.location.href = dest;
    });
  });
}

async function handleLogout() {
  try {
    await ApiService.post("/auth/logout", {});
  } catch (e) {
    // console.error("Logout error", e);
  } finally {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "landingPage.html";
  }
}

function toggleProfilePopover(btn: HTMLElement) {
  closePopovers(); // Close others
  let popover = document.getElementById("profilePopover");

  if (!popover) {
    popover = document.createElement("div");
    popover.id = "profilePopover";
    popover.className = "popover";

    if (currentUser) {
      // Logic to handle potential different role format if needed
      const createdDate =
        "created_at" in currentUser && currentUser.created_at
          ? new Date(currentUser.created_at as string).toLocaleDateString(
            "pt-BR",
          )
          : "-";

      popover.innerHTML = `
        <div class="popover-header">Perfil de Usuário</div>
        <div class="popover-body">
          <div class="user-info-card">
            <div class="user-name">${currentUser.name}</div>
            <div class="user-username">@${currentUser.username}</div>
            <div class="user-role-badge">
              <span class="role-badge ${currentUser.role.toLowerCase()}">${currentUser.role}</span>
            </div>
          </div>
          <div class="popover-footer" style="padding-top: 1rem; border-top: 1px solid var(--border-light); margin-top: 1rem;">
            <button class="btn btn-danger btn-full btn-sm" id="popoverLogoutBtn">
              <span class="material-symbols-outlined" style="font-size: 18px; margin-right: 8px;">logout</span>
              Sair
            </button>
          </div>
        </div>
      `;

      // Attach listener to new button
      const popoverBtn = popover.querySelector("#popoverLogoutBtn");
      if (popoverBtn) {
        popoverBtn.addEventListener("click", handleLogout);
      }

    } else {
      popover.innerHTML = `<div class="popover-body">Carregando perfil...</div>`;
    }

    // Append to header-actions
    const headerActions = document.querySelector(".header-actions");
    if (headerActions) headerActions.appendChild(popover);
  }

  popover.classList.toggle("active");
}

function closePopovers() {
  document
    .querySelectorAll(".popover")
    .forEach((p) => p.classList.remove("active"));
}

// Data Loading
async function loadTables() {
  try {
    const response = await ApiService.get<{ data: Table[] }>('/tables');
    const tables = response.data || [];

    renderOccupiedTables(tables.filter((t) => t.status === 'OCCUPIED'));
    renderAvailableTables(tables.filter((t) => t.status === 'AVAILABLE'));

    // If modal exists, also render modal tables
    const modalGrid = document.getElementById('availableTablesGrid');
    if (modalGrid) {
      renderModalAvailableTables(
        tables.filter((t) => t.status === 'AVAILABLE'),
      );
    }
  } catch (error) {
    // console.error('Error loading tables:', error);
  }
}

function renderOccupiedTables(tables: Table[]) {
  const container = document.querySelector('.occupied-scroll');
  if (!container) return;

  if (tables.length === 0) {
    container.innerHTML = '<p class="empty-message">Nenhuma mesa ocupada</p>';
    return;
  }

  container.innerHTML = tables
    .map(
      (table) => `
        <button class="table-card occupied" data-table-id="${table.id}" data-status="OCCUPIED">
          <div class="card-header">
             <span class="table-number">${table.number < 10 ? '0' + table.number : table.number}</span>
             <span class="table-label">MESA</span>
          </div>
          <div class="card-body">
             <span class="material-symbols-outlined">group</span>
             <span>4 pessoas</span>
          </div>
          <div class="card-footer">
             <span class="status-badge status-waiting">Aguardando Pedido</span>
          </div>
        </button>
    `,
    )
    .join('');

  container.querySelectorAll('.table-card').forEach((card) => {
    (card as HTMLElement).addEventListener('click', () => {
      handleTableClick((card as HTMLElement).dataset.tableId!, 'OCCUPIED');
    });
  });
}

function renderAvailableTables(tables: Table[]) {
  const container = document.querySelector('.available-tables-grid');
  if (!container) return;

  if (tables.length === 0) {
    container.innerHTML =
      '<p class="empty-message">Nenhuma mesa disponível</p>';
    return;
  }

  container.innerHTML = tables
    .map(
      (table) => `
    <button class="table-card available" data-table-id="${table.id}" data-status="AVAILABLE">
      <div class="card-header">
         <span class="table-number">${table.number < 10 ? '0' + table.number : table.number}</span>
         <span class="table-label">MESA</span>
      </div>
      <div class="card-body">
         <span class="material-symbols-outlined">group</span>
         <span>-</span>
      </div>
      <div class="card-footer">
         <span class="status-badge status-free">Livre</span>
      </div>
    </button>
  `,
    )
    .join('');

  container.querySelectorAll('.table-card').forEach((card) => {
    (card as HTMLElement).addEventListener('click', () => {
      handleTableClick((card as HTMLElement).dataset.tableId!, 'AVAILABLE');
    });
  });
}

// Modal Functions
function openTableSelectionModal() {
  const modal = document.getElementById('tableModalOverlay');
  if (modal) {
    modal.classList.add('active');
    loadTables();
  }
}

function renderModalAvailableTables(tables: Table[]) {
  const container = document.getElementById('availableTablesGrid');
  if (!container) return;

  if (tables.length === 0) {
    container.innerHTML =
      '<p class="empty-message">Nenhuma mesa disponível</p>';
    return;
  }

  container.innerHTML = tables
    .map(
      (table) => `
    <button class="table-card available" data-table-id="${table.id}" aria-label="Mesa ${table.number}">
      <span class="table-number">${table.number}</span>
    </button>
  `,
    )
    .join('');

  container.querySelectorAll('.table-card').forEach((card) => {
    (card as HTMLElement).addEventListener('click', () => {
      // Navigate to Create Order with selected table
      window.location.href = `createOrder.html?table_id=${(card as HTMLElement).dataset.tableId}`;
    });
  });
}

function handleTableClick(tableId: string, status: string = 'OCCUPIED') {
  if (status === 'AVAILABLE') {
    window.location.href = `createOrder.html?table_id=${tableId}`;
  } else {
    window.location.href = `orders.html?tableId=${tableId}`;
  }
}

async function loadSummary() {
  try {
    if (!currentUser) return;
    const user = currentUser; // Capture user to ensure it's not null in callback

    const response = await ApiService.get<{ data: Order[] }>('/orders');
    const orders = response.data || [];

    const now = new Date();

    // Robust date parsing handles "YYYY-MM-DD HH:mm:ss" vs ISO
    const isToday = (dateStr?: string) => {
      if (!dateStr) return false;
      let d = new Date(dateStr);
      // Fallback for SQL-style timestamps
      if (isNaN(d.getTime())) {
        d = new Date(dateStr.replace(' ', 'T'));
      }
      if (isNaN(d.getTime())) return false;

      return d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear();
    };

    const todayOrders = orders.filter((o) => {
      // Robust logging for debugging
      // console.log('Checking order:', o); 

      // Check both probable date fields
      const orderDate = o.created_at || o.opened_at;
      const orderSameDay = isToday(orderDate);

      // Loose comparison for IDs (string vs number)
      const isMyOrder = (o.user_id == user.id || String(o.user_id) === String(user.id));
      const status = (o.status || '').toUpperCase();
      const isClosed = ['CLOSED', 'PAID'].includes(status);

      return orderSameDay && isMyOrder && isClosed;
    });

    const totalSales = todayOrders.reduce((sum, order) => {
      const val = typeof order.total === 'string' ? parseFloat(order.total) : order.total;
      return sum + (val || 0);
    }, 0);
    const totalTip = totalSales * 0.10;

    const valueEl = document.querySelector('.summary-value');
    const subtitleEl = document.querySelector('.summary-subtitle');
    const badgeEl = document.querySelector('.badge-today');

    if (badgeEl) badgeEl.textContent = 'Minhas Comissões (10%)';
    if (valueEl) valueEl.textContent = formatCurrency(totalTip); // formatCurrency expects cents
    if (subtitleEl)
      subtitleEl.textContent = `${todayOrders.length} mesa${todayOrders.length !== 1 ? 's' : ''} finalizada${todayOrders.length !== 1 ? 's' : ''} por mim`;
  } catch (error) {
    // console.error('Error loading summary:', error);
  }
}

// Active Orders
async function loadActiveOrders() {
  try {
    if (!currentUser) return;
    const user = currentUser;

    const response = await ApiService.get<{ data: Order[] }>('/orders');
    const orders = response.data || [];

    // Also load tables to resolve table numbers
    const tablesResponse = await ApiService.get<{ data: Table[] }>('/tables');
    const tables = tablesResponse.data || [];

    // Filter active orders for the current user
    const activeOrders = orders.filter((o) => {
      const isMyOrder = o.user_id === user.id;
      const isActive = ['OPEN', 'IN_PROGRESS'].includes(o.status);
      return isMyOrder && isActive;
    });

    renderActiveOrders(activeOrders, tables);
  } catch (error) {
    console.error('Error loading active orders:', error);
  }
}

function renderActiveOrders(orders: Order[], tables: Table[]) {
  const container = document.getElementById('activeOrdersGrid');
  if (!container) return;

  if (orders.length === 0) {
    container.innerHTML = '<p class="empty-message">Nenhum pedido em andamento</p>';
    return;
  }

  container.innerHTML = orders.map(order => {
    const table = tables.find(t => t.id === order.table_id);
    const tableNumber = table ? table.number : '?';
    const itemsDescription = order.items && order.items.length > 0
      ? order.items.map(i => `${i.quantity}x ${i.name || i.product_name}`).join(', ')
      : 'Sem itens';
    const total = order.total ? parseFloat(order.total.toString()) : 0;

    return `
      <div class="table-card active-order" data-order-id="${order.id}">
        <div class="card-header">
           <span class="table-number">${typeof tableNumber === 'number' && tableNumber < 10 ? '0' + tableNumber : tableNumber}</span>
           <span class="table-label">MESA</span>
        </div>
        <div class="card-body">
           <span class="material-symbols-outlined">receipt_long</span>
           <span class="items-summary">${itemsDescription}</span>
        </div>
        <div class="card-footer">
           <span class="order-total">${formatCurrency(total)}</span>
        </div>
      </div>
    `;
  }).join('');

  // Add click listeners
  container.querySelectorAll('.active-order').forEach(card => {
    card.addEventListener('click', () => {
      const orderId = (card as HTMLElement).dataset.orderId;
      if (orderId) {
        // Find the table id for this order
        const order = orders.find(o => o.id === orderId);
        if (order) {
          window.location.href = `createOrder.html?table_id=${order.table_id}&order_id=${order.id}`;
        }
      }
    });
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', init);
