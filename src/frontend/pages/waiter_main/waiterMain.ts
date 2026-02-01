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
    status: 'OPEN' | 'CLOSED' | 'CANCELLED';
    total: number;
    created_at: string;
}


// DOM Elements
const sidebar = document.getElementById('sidebar');
const menuBtn = document.getElementById('menuBtn');
const logoutBtn = document.getElementById('logoutBtn');
const darkModeToggle = document.getElementById("darkModeToggle");

function init() {
    // Check authentication
    if (!checkAuth()) return;

    initDarkMode();
    setupEventListeners();
    loadTables();
    loadSummary();

    // Auto-refresh every 30 seconds
    setInterval(() => {
        loadTables();
        loadSummary();
    }, 30000);

    console.log('WaiterMain page initialized (TS)');
}

function checkAuth(): boolean {
    const userStr = localStorage.getItem('user');
    // Basic check, real auth is via cookie/API 401
    if (!userStr) {
        // window.location.href = '/pages/landingPage.html';
        // return false; 
    }
    return true;
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
        newOrderBtn.addEventListener('click', openTableSelectionModal);
    }

    // Modal Close
    const closeTableModal = document.getElementById('closeTableModal');
    const modalOverlay = document.getElementById('tableModalOverlay');
    if (closeTableModal && modalOverlay) {
        closeTableModal.addEventListener('click', () => {
            modalOverlay.classList.remove('active');
        });
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) modalOverlay.classList.remove('active');
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
            console.log('User profile clicked');
        });
    }

    // Sidebar Navigation Links
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
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

        renderOccupiedTables(tables.filter(t => t.status === 'OCCUPIED'));
        renderAllTables(tables);
        renderAvailableTables(tables.filter(t => t.status === 'AVAILABLE'));
    } catch (error) {
        console.error('Error loading tables:', error);
    }
}

function renderOccupiedTables(tables: Table[]) {
    const container = document.querySelector('.occupied-scroll');
    if (!container) return;

    if (tables.length === 0) {
        container.innerHTML = '<p class="empty-message">Nenhuma mesa ocupada</p>';
        return;
    }

    container.innerHTML = tables.map(table => `
        <button class="table-card occupied" data-table-id="${table.id}" aria-label="Mesa ${table.number}">
          <span class="table-number">${table.number}</span>
        </button>
    `).join('');

    container.querySelectorAll('.table-card').forEach(card => {
        (card as HTMLElement).addEventListener('click', () => {
            handleTableClick((card as HTMLElement).dataset.tableId!);
        });
    });
}

function renderAllTables(tables: Table[]) {
    const container = document.querySelector('.tables-grid');
    if (!container) return;

    // Filter out OCCUPIED tables from "All Tables" or show them with status?
    // Current requirement implies showing all. Let's keep it.
    container.innerHTML = tables.map(table => `
    <button class="table-card ${table.status.toLowerCase()}" data-table-id="${table.id}" aria-label="Mesa ${table.number}">
      <span class="table-number">${table.number}</span>
    </button>
  `).join('');

    container.querySelectorAll('.table-card').forEach(card => {
        (card as HTMLElement).addEventListener('click', () => {
            // If occupied -> open order
            // If available -> open new order (same flow as modal?)
            // For now, keep existing behavior: redirect to createOrder which handles both?
            // Actually, createOrder needs table_id. If occupied, it likely has an order. 
            // If available, it starts new.
            handleTableClick((card as HTMLElement).dataset.tableId!);
        });
    });
}

function handleTableClick(tableId: string) {
    // Navigate to Create Order Page
    window.location.href = `createOrder.html?table_id=${tableId}`;
}

// Modal Functions
function openTableSelectionModal() {
    const modal = document.getElementById('tableModalOverlay');
    if (modal) {
        modal.classList.add('active');
        loadTables();
    }
}

function renderAvailableTables(tables: Table[]) {
    const container = document.getElementById('availableTablesGrid');
    if (!container) return;

    if (tables.length === 0) {
        container.innerHTML = '<p class="empty-message">Nenhuma mesa disponível</p>';
        return;
    }

    container.innerHTML = tables.map(table => `
        <button class="table-card available" data-table-id="${table.id}" aria-label="Mesa ${table.number}">
          <span class="table-number">${table.number}</span>
        </button>
    `).join('');

    container.querySelectorAll('.table-card').forEach(card => {
        (card as HTMLElement).addEventListener('click', () => {
            // Navigate to Create Order with selected table
            window.location.href = `createOrder.html?table_id=${(card as HTMLElement).dataset.tableId}`;
        });
    });
}

async function loadSummary() {
    try {
        // Reusing loadOrders from orders service might be better but for now direct fetch
        const response = await ApiService.get<{ data: Order[] }>('/orders');
        const orders = response.data || [];

        const today = new Date().toDateString();
        const todayOrders = orders.filter(o => {
            const orderDate = new Date(o.created_at).toDateString();
            return orderDate === today && o.status === 'CLOSED';
        });

        const total = todayOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);

        const valueEl = document.querySelector('.summary-value');
        const subtitleEl = document.querySelector('.summary-subtitle');

        if (valueEl) valueEl.textContent = `R$ ${total.toFixed(2)}`;
        if (subtitleEl) subtitleEl.textContent = `${todayOrders.length} mesa${todayOrders.length !== 1 ? 's' : ''} atendida${todayOrders.length !== 1 ? 's' : ''} hoje`;

    } catch (error) {
        console.error('Error loading summary:', error);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', init);
