import './style.css';
import { ApiService } from '../../services/apiService';

// Interfaces
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
  opened_at: string;
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
const sidebar = document.getElementById('sidebar');
const menuBtn = document.getElementById('menuBtn');
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
  loadTables();
  loadSummary();

  // Check for action param
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

  // Sidebar Toggle
  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('active');
    });

    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
      if (
        sidebar.classList.contains('active') &&
        !sidebar.contains(e.target as Node) &&
        !menuBtn.contains(e.target as Node)
      ) {
        sidebar.classList.remove('active');
      }
    });

    // Close button inside sidebar
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    if (closeSidebarBtn) {
      closeSidebarBtn.addEventListener('click', () => {
        sidebar.classList.remove('active');
      });
    }
  }

  // New Order Button - opens modal if it exists, otherwise redirects
  const newOrderBtn = document.getElementById("newOrderBtn");
  if (newOrderBtn) {
    const modalOverlay = document.getElementById("tableModalOverlay");
    if (modalOverlay) {
      newOrderBtn.addEventListener("click", openTableSelectionModal);
    } else {
      newOrderBtn.addEventListener("click", () => {
        window.location.href = "createOrder.html";
      });
    }
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
        </div>
      `;
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
        <button class="table-card occupied" data-table-id="${table.id}" aria-label="Mesa ${table.number}">
          <span class="table-number">${table.number}</span>
        </button>
    `,
    )
    .join('');

  container.querySelectorAll('.table-card').forEach((card) => {
    (card as HTMLElement).addEventListener('click', () => {
      handleTableClick((card as HTMLElement).dataset.tableId!);
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
    <button class="table-card available" data-table-id="${table.id}" aria-label="Mesa ${table.number}">
      <span class="table-number">${table.number}</span>
    </button>
  `,
    )
    .join('');

  container.querySelectorAll('.table-card').forEach((card) => {
    (card as HTMLElement).addEventListener('click', () => {
      handleTableClick((card as HTMLElement).dataset.tableId!);
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

function handleTableClick(tableId: string) {
  // Navigate to Create Order Page
  window.location.href = `createOrder.html?table_id=${tableId}`;
}

async function loadSummary() {
  try {
    if (!currentUser) return;

    const response = await ApiService.get<{ data: Order[] }>('/orders');
    const orders = response.data || [];

    const today = new Date().toDateString();
    const todayOrders = orders.filter((o) => {
      // Use opened_at which matches the database field
      if (!o.opened_at) return false;

      const orderDate = new Date(o.opened_at).toDateString();
      return (
        orderDate === today &&
        o.status === 'CLOSED' &&
        o.user_id === currentUser!.id
      );
    });

    // Calculate tips in cents, then convert to reais
    const totalTipsCents = todayOrders.reduce(
      (sum, order) => sum + (Number(order.tip) || 0),
      0,
    );

    const valueEl = document.querySelector('.summary-value');
    const subtitleEl = document.querySelector('.summary-subtitle');

    if (valueEl) valueEl.textContent = formatCurrency(totalTipsCents);
    if (subtitleEl)
      subtitleEl.textContent = `${todayOrders.length} mesa${todayOrders.length !== 1 ? 's' : ''} atendida${todayOrders.length !== 1 ? 's' : ''} hoje`;
  } catch (error) {
    // console.error('Error loading summary:', error);
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', init);
