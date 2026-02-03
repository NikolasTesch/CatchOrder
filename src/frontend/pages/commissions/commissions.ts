import '../../styles/index.js'; // Global styles
import './style.css'; // Page styles
import { ApiService } from '../../services/apiService';
import { User } from '../../../shared/types/user';
import { OrderDTO as Order } from '../../../shared/dtos/orderDto';

let allUsers: User[] = [];
let allOrders: Order[] = [];

async function init() {
  setupEventListeners();
  await loadData();
}

function setupEventListeners() {
  const closeModalBtn = document.getElementById('closeCommissionModal');
  const modalOverlay = document.getElementById('commissionModal');
  const darkModeToggle = document.getElementById('darkModeToggle');

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeCommissionModal);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeCommissionModal();
    });
  }

  // Dark Mode
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const isDark = document.body.classList.contains('dark-mode');
      localStorage.setItem('darkMode', isDark ? 'true' : 'false');
      updateDarkModeIcon();
    });
  }
  
  // Init Dark Mode
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
  }
  updateDarkModeIcon();
}

function updateDarkModeIcon() {
    const btn = document.getElementById('darkModeToggle');
    if(btn) {
        const icon = btn.querySelector('.material-symbols-outlined');
        if(icon) icon.textContent = document.body.classList.contains('dark-mode') ? 'dark_mode' : 'light_mode';
    }
}

async function loadData() {
  const loadingMsg = document.getElementById('loadingMessage');
  const grid = document.getElementById('waiters-grid');
  
  try {
    const [usersRes, ordersRes] = await Promise.all([
      ApiService.get<{ data: User[] }>('/users'),
      ApiService.get<{ data: Order[] }>('/orders')
    ]);

    allUsers = usersRes.data || [];
    allOrders = ordersRes.data || [];

    if (loadingMsg) loadingMsg.style.display = 'none';
    if (grid) grid.style.display = 'grid';
    
    renderWaiters();

  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    if (loadingMsg) loadingMsg.textContent = 'Erro ao carregar dados. Tente novamente.';
  }
}

function renderWaiters() {
  const grid = document.getElementById('waiters-grid');
  if (!grid) return;

  // Filter for waiters (case insensitive check just in case)
  const waiters = allUsers.filter(u => u.role && u.role.toUpperCase() === 'WAITER');

  if (waiters.length === 0) {
    grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">Nenhum garçom encontrado.</p>';
    return;
  }

  grid.innerHTML = waiters.map(waiter => `
    <div class="waiter-card glass" data-user-id="${waiter.id}" data-user-name="${waiter.name}">
      <div class="waiter-avatar">
        <span class="material-symbols-outlined">person</span>
      </div>
      <div class="waiter-info">
        <h3 class="waiter-name">${waiter.name}</h3>
        <span class="waiter-role">${waiter.username}</span>
      </div>
    </div>
  `).join('');

  // Add click listeners
  grid.querySelectorAll('.waiter-card').forEach(card => {
    card.addEventListener('click', () => {
      const userId = (card as HTMLElement).dataset.userId;
      const userName = (card as HTMLElement).dataset.userName;
      if (userId && userName) {
        openWaiterDetails(userId, userName);
      }
    });
  });
}

function openWaiterDetails(userId: string, userName: string) {
  const modal = document.getElementById('commissionModal');
  const title = document.getElementById('modalWaiterName');
  const tbody = document.getElementById('commissionTableBody');
  const totalEl = document.getElementById('modalTotalSales');

  if (!modal || !tbody || !totalEl) return;

  // Set Title
  if (title) title.textContent = userName;

  // Filter Orders: User's orders that are CLOSED
  const waiterOrders = allOrders.filter(o => 
    o.user_id === userId && o.status === 'CLOSED'
  );

  // Sort by date desc
  waiterOrders.sort((a, b) => {
    const da = a.closed_at ? new Date(a.closed_at).getTime() : 0;
    const db = b.closed_at ? new Date(b.closed_at).getTime() : 0;
    return db - da;
  });

  // Calculate Total
  const totalSales = waiterOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);

  // Render Table
  if (waiterOrders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 2rem;">Nenhuma venda finalizada encontrada.</td></tr>';
  } else {
    tbody.innerHTML = waiterOrders.map(order => {
        const dateStr = order.closed_at 
            ? new Date(order.closed_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) 
            : '-';
        return `
        <tr>
            <td>#${order.id.slice(0, 8)}</td>
            <td>${dateStr}</td>
            <td>${formatCurrency(order.total || 0)}</td>
        </tr>
        `;
    }).join('');
  }

  // Update Total
  totalEl.textContent = formatCurrency(totalSales);

  // Show Modal
  modal.classList.add('active');
}

function closeCommissionModal() {
  const modal = document.getElementById('commissionModal');
  if (modal) modal.classList.remove('active');
}

function formatCurrency(value: number | string): string {
    const num = Number(value);
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
}

// Initializer
document.addEventListener('DOMContentLoaded', init);
