import './style.css';
import { ApiService } from '../../services/apiService';

// Interfaces based on API responses
interface OrderItem {
    product_id: string;
    product_name?: string;
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
    table_number: number;
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
const newOrderButton = document.querySelector('.btn-new-order') as HTMLButtonElement;
const openOrdersSection = document.querySelector('.orders-section[aria-label="Ordens em aberto"]');
const finishedOrdersSection = document.querySelector('.orders-section[aria-label="Ordens finalizadas"]');

document.addEventListener('DOMContentLoaded', () => {
    init();
});

async function init() {
    initDarkMode();
    setupHeaderListeners();
    setupEventListeners();

    console.log('Orders page initializing...');

    await Promise.all([
        loadOrders(),
        loadUsers(),
        loadTables()
    ]);

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
        console.log('Orders loaded:', orders.length);
    } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
    }
}

async function loadUsers() {
    try {
        const response = await ApiService.get<{ data: User[] }>('/users');
        users = response.data || [];
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
    }
}

async function loadTables() {
    try {
        const response = await ApiService.get<{ data: Table[] }>('/tables');
        tables = response.data || [];
    } catch (error) {
        console.error('Erro ao carregar mesas:', error);
    }
}

// --- Rendering ---

function renderOrders() {
    const filteredOrders = filterOrders();

    const openOrders = filteredOrders.filter(order =>
        order.status === 'OPEN' || order.status === 'IN_PROGRESS'
    );

    const finishedOrders = filteredOrders.filter(order =>
        order.status === 'CLOSED' || order.status === 'PAID'
    );

    renderOrderList(openOrdersSection, openOrders, 'open');
    renderOrderList(finishedOrdersSection, finishedOrders, 'finished');
}

function filterOrders(): Order[] {
    if (!searchTerm) return orders;

    return orders.filter(order => {
        const table = tables.find(t => t.id === order.table_id);
        // Search by table number
        return table && table.table_number.toString().includes(searchTerm);
    });
}

function renderOrderList(container: Element | null, orderList: Order[], type: 'open' | 'finished') {
    if (!container) return;

    // Clear existing cards but keep the title (h2)
    const title = container.querySelector('.section-title');
    container.innerHTML = '';
    if (title) container.appendChild(title);

    if (orderList.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.textContent = type === 'open' ? 'Nenhuma ordem em aberto' : 'Nenhuma ordem finalizada';
        emptyMessage.style.cssText = 'text-align: center; padding: 2rem; color: var(--text-secondary); opacity: 0.7;';
        container.appendChild(emptyMessage);
        return;
    }

    orderList.forEach(order => {
        const card = createOrderCard(order, type);
        container.appendChild(card);
    });
}

function createOrderCard(order: Order, type: 'open' | 'finished'): HTMLElement {
    const card = document.createElement('div');
    card.className = 'order-card';
    card.dataset.orderId = order.id;

    // Get related data
    const table = tables.find(t => t.id === order.table_id);
    const user = users.find(u => u.id === order.user_id);

    const tableNumber = table ? table.table_number : '?';
    const userName = user ? (user.username || user.name) : 'Desconhecido';

    // Format price
    const price = order.total ? parseFloat(order.total).toFixed(2) : '0.00';

    // Status Label
    const statusLabel = getStatusLabel(order.status);
    const statusClass = type === 'open' ? 'status-open' : 'status-finished';

    // Items Summary
    const itemsDescription = order.items && order.items.length > 0
        ? `${order.items.length} itens`
        : 'Ver detalhes';

    // Observations
    const obs = order.observations || '';

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
      <p class="order-obs">${obs ? 'Obs: ' + obs : ''}</p>
      <button class="btn-waiter">${userName}</button>
    </div>
  `;

    card.addEventListener('click', () => {
        console.log(`Open details for order ${order.id}`);
        // TODO: Navigate to details or open modal
    });

    return card;
}

function getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
        'OPEN': 'Em aberto',
        'IN_PROGRESS': 'Em andamento',
        'CLOSED': 'Finalizado',
        'PAID': 'Pago'
    };
    return labels[status] || status;
}

// --- Initialization & UI ---

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
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateDarkModeIcon(isDark);
}

function setupHeaderListeners() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) darkModeToggle.addEventListener('click', toggleDarkMode);

    const menuBtn = document.getElementById('menuBtn');
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            console.log('Menu clicked');
        });
    }

    const userBtn = document.getElementById('userBtn');
    if (userBtn) {
        userBtn.addEventListener('click', () => {
            console.log('User profile clicked');
        });
    }

    const logo = document.querySelector('.logo-image');
    if (logo) {
        logo.addEventListener('click', () => {
            window.location.href = '/';
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
            window.location.href = '/pages/waiterMain.html';
        });
    }
}
