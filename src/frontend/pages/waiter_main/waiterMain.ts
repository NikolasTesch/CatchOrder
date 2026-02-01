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
  created_at: string;
}

interface User {
  id: string;
  name: string;
  username: string;
  role: string;
}

// State
const API_BASE =
  window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : window.location.pathname.includes('/server09/')
      ? '/server09/api'
      : '/api';
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
  loadSummary();

  // Auto-refresh every 30 seconds
  setInterval(() => {
    loadTables();
    loadSummary();
  }, 30000);

  console.log('WaiterMain page initialized (TS)');
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
    console.error('Failed to load user:', error);
    window.location.href = '/pages/landingPage.html';
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
    darkModeToggle.addEventListener('click', toggleDarkMode);
  }

  // Sidebar Toggle
  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('active');
    });
  }

  // New Order Button
  const newOrderBtn = document.getElementById('newOrderBtn');
  if (newOrderBtn) {
    newOrderBtn.addEventListener('click', () => {
      window.location.href = 'createOrder.html';
    });
  }

  // Logout
  const logoutBtnHeader = document.getElementById('logoutBtn');
  if (logoutBtnHeader) {
    logoutBtnHeader.addEventListener('click', handleLogout);
  }

  // Logo Click
  const logoImage = document.getElementById('logoImage');
  if (logoImage) {
    logoImage.addEventListener('click', () => {
      window.location.href = 'waiterMain.html';
    });
  }

  // User Profile Click
  const userBtn = document.getElementById('userBtn');
  if (userBtn) {
    userBtn.addEventListener('click', () => {
      // Maybe go to profile page or show specialized modal
      console.log('User profile clicked');
    });
  }

  // Sidebar Navigation Links
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      const dest = (item as HTMLElement).dataset.href;
      if (dest) window.location.href = dest;
    });
  });
}

async function handleLogout() {
  try {
    await ApiService.post('/auth/logout', {});
  } catch (e) {
    console.error('Logout error', e);
  } finally {
    localStorage.removeItem('user');
    window.location.href = 'landingPage.html';
  }
}

// Data Loading
async function loadTables() {
  try {
    const response = await ApiService.get<{ data: Table[] }>('/tables');
    const tables = response.data || [];

    renderOccupiedTables(tables);
    renderAvailableTables(tables);
  } catch (error) {
    console.error('Error loading tables:', error);
  }
}

function renderOccupiedTables(tables: Table[]) {
  const container = document.querySelector('.occupied-scroll');
  if (!container) return;

  const occupiedTables = tables.filter((t) => t.status === 'OCCUPIED');

  if (occupiedTables.length === 0) {
    container.innerHTML = '<p class="empty-message">Nenhuma mesa ocupada</p>';
    return;
  }

  container.innerHTML = occupiedTables
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

  const availableTables = tables.filter((t) => t.status === 'AVAILABLE');

  if (availableTables.length === 0) {
    container.innerHTML =
      '<p class="empty-message">Nenhuma mesa disponível</p>';
    return;
  }

  container.innerHTML = availableTables
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

function handleTableClick(tableId: string) {
  // Navigate to orders page filtering by this table or creating new order for it
  // Or go to createOrder directly?
  // Based on user flow, maybe 'orders.html' is a list, but 'createOrder.html' is the detail
  // Let's go to createOrder which seems to be the main "Order Interaction" page
  window.location.href = `createOrder.html?table_id=${tableId}`;
}

async function loadSummary() {
  try {
    if (!currentUser) return;

    const response = await ApiService.get<{ data: Order[] }>('/orders');
    const orders = response.data || [];

    const today = new Date().toDateString();
    const todayOrders = orders.filter((o) => {
      const orderDate = new Date(o.created_at).toDateString();
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
    console.error('Error loading summary:', error);
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', init);
