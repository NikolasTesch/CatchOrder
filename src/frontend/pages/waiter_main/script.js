// WaiterMain - JavaScript for waiter interface
// Integrates with existing backend API

const API_BASE = '/api';

// Load tables from backend
async function loadTables() {
  try {
    const response = await fetch(`${API_BASE}/tables`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      console.error('Error loading tables');
      return;
    }
    
    const data = await response.json();
    const tables = data.data || [];
    
    // Render occupied tables
    renderOccupiedTables(tables.filter(t => t.status === 'OCCUPIED'));
    
    // Render all tables
    renderAllTables(tables);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

function renderOccupiedTables(tables) {
  const container = document.querySelector('.occupied-scroll');
  if (!container) return;
  
  container.innerHTML = tables.length > 0
    ? tables.map(table => `
        <div class="table-card occupied" data-table-id="${table.id}">
          <span class="table-number">${table.number}</span>
        </div>
      `).join('')
    : '<p class="empty-message">Nenhuma mesa ocupada</p>';
}

function renderAllTables(tables) {
  const container = document.querySelector('.tables-grid');
  if (!container) return;
  
  container.innerHTML = tables.map(table => `
    <div class="table-card ${table.status.toLowerCase()}" data-table-id="${table.id}">
      <span class="table-number">${table.number}</span>
    </div>
  `).join('');
  
  // Add click listeners
  container.querySelectorAll('.table-card').forEach(card => {
    card.addEventListener('click', () => handleTableClick(card.dataset.tableId));
  });
}

function handleTableClick(tableId) {
  // TODO: Implement table selection and order management
  console.log('Table clicked:', tableId);
}

// Load summary data
async function loadSummary() {
  try {
    const response = await fetch(`${API_BASE}/orders`, {
      credentials: 'include'
    });
    
    if (!response.ok) return;
    
    const data = await response.json();
    const orders = data.data || [];
    
    // Calculate today's total
    const today = new Date().toDateString();
    const todayOrders = orders.filter(o => {
      const orderDate = new Date(o.created_at).toDateString();
      return orderDate === today && o.status === 'CLOSED';
    });
    
    const total = todayOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    
    // Update UI
    const valueEl = document.querySelector('.summary-value');
    const subtitleEl = document.querySelector('.summary-subtitle');
    
    if (valueEl) valueEl.textContent = `R$ ${total.toFixed(2)}`;
    if (subtitleEl) subtitleEl.textContent = `${todayOrders.length} mesas atendidas hoje`;
    
  } catch (error) {
    console.error('Error loading summary:', error);
  }
}

// New order button
document.querySelector('.btn-new-order')?.addEventListener('click', () => {
  // TODO: Navigate to order creation or open modal
  console.log('New order clicked');
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadTables();
  loadSummary();
  
  // Refresh every 30 seconds
  setInterval(() => {
    loadTables();
    loadSummary();
  }, 30000);
});
