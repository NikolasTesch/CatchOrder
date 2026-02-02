import './style.css';
import { ApiService } from '../../services/apiService';
import { formatCurrency, centsToReais } from '../../utils/currency';

// Interfaces
interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_item: number;
}

interface Order {
  id: string;
  table_id: string;
  status: string;
  total: number;
  items: OrderItem[];
  observations?: string;
}

interface Table {
  id: string;
  number: number;
}

// State
let currentOrder: Order | null = null;
let orderId: string | null = null;
let tableId: string | null = null;
let tableNumber: string | null = null;

// DOM Elements
const tableNumberEl = document.getElementById('table-number') as HTMLElement;
const consumedList = document.getElementById('consumed-list') as HTMLElement;
const subtotalEl = document.getElementById('subtotal') as HTMLElement;
const tipEl = document.getElementById('tip-value') as HTMLElement;
const totalEl = document.getElementById('total-final') as HTMLElement;
const btnBack = document.getElementById('btn-back') as HTMLButtonElement;
const btnCloseOrder = document.getElementById(
  'btn-close-order',
) as HTMLButtonElement;

// Initialize
document.addEventListener('DOMContentLoaded', init);

async function init() {
  initDarkMode();
  setupHeaderListeners();

  // Get URL parameters
  const params = new URLSearchParams(window.location.search);
  orderId = params.get('order_id');
  tableId = params.get('table_id');

  if (!orderId) {
    showError('Pedido não encontrado');
    setTimeout(() => (window.location.href = 'waiterMain.html'), 2000);
    return;
  }

  await loadOrder();
  await loadTable();
  setupEventListeners();
}

async function loadOrder() {
  try {
    const response = await ApiService.get<{ data: Order }>(
      `/orders/${orderId}`,
    );
    currentOrder = response.data;

    renderOrderDetails();
  } catch (error) {
    console.error('Erro ao carregar pedido:', error);
    showError('Erro ao carregar pedido');
  }
}

async function loadTable() {
  if (!tableId) return;

  try {
    const response = await ApiService.get<{ data: Table }>(
      `/tables/${tableId}`,
    );
    tableNumber = response.data.number.toString();

    if (tableNumberEl) {
      tableNumberEl.textContent = tableNumber;
    }
  } catch (error) {
    console.error('Erro ao carregar mesa:', error);
  }
}

function renderOrderDetails() {
  if (!currentOrder) return;

  // Render items
  if (consumedList && currentOrder.items && currentOrder.items.length > 0) {
    consumedList.innerHTML = currentOrder.items
      .map(
        (item) => `
      <article class="consumed-item">
        <div class="item-header">
          <span class="item-quantity">${item.quantity}x</span>
          <span class="item-price">${formatCurrency(item.total_item)}</span>
        </div>
        <div class="item-details">
          <span class="item-name">${item.product_name}</span>
        </div>
        <div class="item-divider"></div>
      </article>
    `,
      )
      .join('');
  } else if (consumedList) {
    consumedList.innerHTML =
      '<p style="text-align: center; color: var(--text-secondary);">Nenhum item no pedido</p>';
  }

  // Calculate values
  const subtotal = currentOrder.total || 0;
  const tipAmount = Math.round(subtotal * 0.1); // 10% tip in cents
  const totalFinal = subtotal + tipAmount;

  // Update values on screen
  if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);
  if (tipEl) tipEl.textContent = formatCurrency(tipAmount);
  if (totalEl) totalEl.textContent = formatCurrency(totalFinal);
}

function setupEventListeners() {
  if (btnBack) {
    btnBack.addEventListener('click', () => {
      window.location.href = `createOrder.html?order_id=${orderId}&table_id=${tableId}`;
    });
  }

  if (btnCloseOrder) {
    btnCloseOrder.addEventListener('click', closeOrder);
  }
}

function closeOrder() {
  if (!currentOrder || !orderId) return;

  // Show custom confirmation modal
  showConfirmModal(
    'Fechar Comanda',
    'Deseja realmente fechar a comanda? A mesa será liberada e esta ação não pode ser desfeita.',
    async () => {
      try {
        // Calculate 10% tip
        const subtotal = currentOrder!.total || 0;
        const tipAmount = Math.round(subtotal * 0.1);

        // Close order on backend
        await ApiService.patch(`/orders/${orderId}/close`, { tip: tipAmount });

        showSuccess('Comanda fechada com sucesso!');

        // Redirect to waiterMain
        setTimeout(() => {
          window.location.href = 'waiterMain.html';
        }, 1500);
      } catch (error: any) {
        console.error('Erro ao fechar comanda:', error);
        showError(error.message || 'Erro ao fechar comanda');
      }
    },
  );
}

// Dark Mode Functions
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

// Header Listeners
function setupHeaderListeners() {
  const darkModeToggle = document.getElementById('darkModeToggle');
  if (darkModeToggle) darkModeToggle.addEventListener('click', toggleDarkMode);

  const menuBtn = document.getElementById('menuBtn');
  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      window.location.href = 'waiterMain.html';
    });
  }

  const userBtn = document.getElementById('userBtn');
  if (userBtn) {
    userBtn.addEventListener('click', () => {
      console.log('User profile clicked');
    });
  }

  const logoImage = document.getElementById('logoImage');
  if (logoImage) {
    logoImage.addEventListener('click', () => {
      window.location.href = 'waiterMain.html';
    });
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await ApiService.post('/auth/logout', {});
      } catch (e) {
        console.error('Logout error', e);
      } finally {
        localStorage.removeItem('user');
        window.location.href = 'landingPage.html';
      }
    });
  }
}

// Notification Functions
function showSuccess(message: string) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText =
    'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#28a745;color:#fff;padding:12px 24px;border-radius:8px;z-index:9999;box-shadow:0 4px 6px rgba(0,0,0,0.1);';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function showError(message: string) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText =
    'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#ef4444;color:#fff;padding:12px 24px;border-radius:8px;z-index:9999;box-shadow:0 4px 6px rgba(0,0,0,0.1);';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Confirmation Modal
function showConfirmModal(
  title: string,
  message: string,
  onConfirm: () => void,
) {
  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  // Create modal container
  const modal = document.createElement('div');
  modal.className = 'modal-container';

  modal.innerHTML = `
    <div class="modal-header">
      <h2 class="modal-title">${title}</h2>
    </div>
    <div class="modal-body">
      <p class="modal-message">${message}</p>
    </div>
    <div class="modal-footer">
      <button class="btn-modal btn-cancel" id="modal-cancel">Cancelar</button>
      <button class="btn-modal btn-confirm" id="modal-confirm">Confirmar</button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Add event listeners
  const btnCancel = document.getElementById('modal-cancel');
  const btnConfirm = document.getElementById('modal-confirm');

  const closeModal = () => {
    overlay.remove();
  };

  if (btnCancel) {
    btnCancel.addEventListener('click', closeModal);
  }

  if (btnConfirm) {
    btnConfirm.addEventListener('click', () => {
      closeModal();
      onConfirm();
    });
  }

  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeModal();
    }
  });

  // Close on ESC key
  const handleEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleEsc);
    }
  };
  document.addEventListener('keydown', handleEsc);
}
