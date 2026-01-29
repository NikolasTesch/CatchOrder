// Close Order Page - JavaScript Functionality
// Displays order details and allows closing the order

const API_BASE = '/api';

// State management
let currentOrder = null;
let orderItems = [];
let currentTableId = null;

// DOM Elements
const pageTitle = document.querySelector('.page-title');
const consumedList = document.querySelector('.consumed-list');
const totalLabel = document.querySelector('.total-label');
const addItemButton = document.querySelector('.btn-secondary');
const closeOrderButton = document.querySelector('.btn-primary');
const cartButton = document.querySelector('.cart-btn');

/**
 * Initialize page
 */
async function init() {
  // Get order_id from URL params (e.g., ?order_id=123)
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('order_id');
  
  if (!orderId) {
    showError('Pedido não identificado. Redirecionando...');
    setTimeout(() => window.location.href = '/waiter_main/waiterMain.html', 2000);
    return;
  }

  await loadOrderDetails(orderId);
  renderOrderItems();
  updateTotal();
  setupEventListeners();
}

/**
 * Load order details from API
 */
async function loadOrderDetails(orderId) {
  try {
    const response = await fetch(`${API_BASE}/orders/${orderId}`);
    if (!response.ok) throw new Error('Erro ao carregar pedido');
    
    const data = await response.json();
    currentOrder = data.data;
    orderItems = currentOrder.items || [];
    currentTableId = currentOrder.table_id;
    
    // Update page title with table number
    if (currentOrder.table_number) {
      pageTitle.textContent = `Comanda da mesa ${currentOrder.table_number}`;
    } else {
      const tableResponse = await fetch(`${API_BASE}/tables/${currentTableId}`);
      if (tableResponse.ok) {
        const tableData = await tableResponse.json();
        pageTitle.textContent = `Comanda da mesa ${tableData.data.table_number}`;
      }
    }
    
  } catch (error) {
    console.error('Erro ao carregar pedido:', error);
    showError('Erro ao carregar pedido');
  }
}

/**
 * Render order items in the consumed list
 */
function renderOrderItems() {
  // Clear existing items (keep only the container)
  consumedList.innerHTML = '';
  
  if (orderItems.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.textContent = 'Nenhum item no pedido';
    emptyMessage.style.cssText = 'text-align: center; padding: 2rem; color: var(--neutral-60);';
    consumedList.appendChild(emptyMessage);
    return;
  }
  
  orderItems.forEach(item => {
    const itemElement = createItemElement(item);
    consumedList.appendChild(itemElement);
  });
}

/**
 * Create item element
 */
function createItemElement(item) {
  const itemDiv = document.createElement('div');
  itemDiv.className = 'consumed-item';
  itemDiv.dataset.itemId = item.id;
  
  const price = parseFloat(item.unit_price || item.price || 0);
  const quantity = parseInt(item.quantity || 1);
  const totalPrice = (price * quantity).toFixed(2);
  const productName = item.product_name || item.name || 'Item';
  
  itemDiv.innerHTML = `
    <div class="item-header">
      <span class="item-price">R$ ${totalPrice}</span>
    </div>
    <div class="item-details">
      <span class="item-name">${quantity}x ${productName}</span>
    </div>
    <div class="item-divider"></div>
  `;
  
  return itemDiv;
}

/**
 * Update total value
 */
function updateTotal() {
  const total = orderItems.reduce((sum, item) => {
    const price = parseFloat(item.unit_price || item.price || 0);
    const quantity = parseInt(item.quantity || 1);
    return sum + (price * quantity);
  }, 0);
  
  totalLabel.textContent = `R$ ${total.toFixed(2)}`;
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Add item button - navigate to create order page
  addItemButton.addEventListener('click', () => {
    if (currentOrder && currentTableId) {
      window.location.href = `/create_order/createOrder.html?table_id=${currentTableId}&order_id=${currentOrder.id}`;
    }
  });
  
  // Close order button
  closeOrderButton.addEventListener('click', handleCloseOrder);
  
  // Cart button - could show cart modal or navigate
  cartButton.addEventListener('click', () => {
    showSuccess('Carrinho: ' + orderItems.length + ' itens');
  });
}

/**
 * Handle closing the order
 */
async function handleCloseOrder() {
  if (!currentOrder) {
    showError('Nenhum pedido carregado');
    return;
  }
  
  if (orderItems.length === 0) {
    showError('Adicione pelo menos um item antes de fechar a comanda');
    return;
  }
  
  // Confirm closure
  const confirmed = confirm('Deseja realmente fechar esta comanda?');
  if (!confirmed) return;
  
  closeOrderButton.disabled = true;
  closeOrderButton.textContent = 'Fechando...';
  
  try {
    // Call close order endpoint
    const response = await fetch(`${API_BASE}/orders/${currentOrder.id}/close`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao fechar comanda');
    }
    
    const data = await response.json();
    
    showSuccess(`Comanda fechada com sucesso! Total: R$ ${data.total || totalLabel.textContent}`);
    
    // Redirect to payment page or orders list after 2 seconds
    setTimeout(() => {
      window.location.href = `/payment_page/payment.html?order_id=${currentOrder.id}`;
    }, 2000);
    
  } catch (error) {
    console.error('Erro ao fechar comanda:', error);
    showError(error.message || 'Erro ao fechar comanda. Tente novamente.');
    closeOrderButton.disabled = false;
    closeOrderButton.textContent = 'Fechar comanda';
  }
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
`;
document.head.appendChild(style);

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);
