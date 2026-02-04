import './style.css';
import { ApiService } from '../../services/apiService';
import { centsToReais, formatCurrency } from '../../utils/currency';
import { ModalService } from '../../utils/modalService';

// Interfaces
interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category_id: string;
  image_url?: string;
  active: boolean;
}

interface CartItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
}

interface OrderItem {
  id: string;
  product_id: string;
  product_name?: string;
  quantity: number;
  unit_price: number;
  total_item: number;
  created_at?: string;
  delivered_at?: string;
}

interface Order {
  id: string;
  table_id: string;
  status: string;
  items?: OrderItem[];
  observations?: string;
}

interface Table {
  id: string;
  number: string;
  status: string;
}

// State
let cart: CartItem[] = [];
let categories: Category[] = [];
let products: Product[] = [];
let currentTableId: string | null = null;
let currentTableNumber: string | null = null;
let currentOrderId: string | null = null;
let currentOrderStatus: string | null = null;
let existingOrderItems: OrderItem[] = [];
let existingObservation: string = '';

// DOM Elements
const productsContainer = document.getElementById('products-container') as HTMLElement;
const orderItemsList = document.getElementById('order-items-list') as HTMLElement;
const observationsTextarea = document.querySelector('.obs-textarea') as HTMLTextAreaElement;
const subtotalEl = document.getElementById('summary-subtotal') as HTMLElement;
const totalEl = document.getElementById('summary-total') as HTMLElement;
const tableNameDisplay = document.getElementById('table-name-display') as HTMLElement;

document.addEventListener('DOMContentLoaded', () => {
  init();
});

async function init() {
  initDarkMode();
  setupEventListeners();

  // Standard Auth Check
  if (!(await checkAuth())) return;

  const urlParams = new URLSearchParams(window.location.search);
  currentTableId = urlParams.get('table_id');
  currentOrderId = urlParams.get('order_id');

  if (!currentTableId) {
    showError('Mesa não identificada. Redirecionando...');
    setTimeout(() => (window.location.href = 'waiterMain.html'), 2000);
    return;
  }

  await loadTableDetails(currentTableId);
  updateTableDisplay();

  // Check if table already has an OPEN order
  if (!currentOrderId) {
    try {
      const allOrdersResp = await ApiService.get<{ data: Order[] }>('/orders');
      const openOrder = (allOrdersResp.data || []).find(o =>
        o.table_id === currentTableId && o.status === 'OPEN'
      );

      if (openOrder) {
        // console.warn('Mesa ocupada. Redirecionando para ordem existente:', openOrder.id);
        // Redirect to existing order
        window.location.href = `createOrder.html?table_id=${currentTableId}&order_id=${openOrder.id}`;
        return;
      }
    } catch (e) {
      // console.error('Erro ao verificar pedidos da mesa:', e);
    }
  }

  // [New Logic] Check if table already has an OPEN order
  if (!currentOrderId) {
    try {
      const allOrdersResp = await ApiService.get<{ data: Order[] }>('/orders');
      const openOrder = (allOrdersResp.data || []).find(
        (o) => o.table_id === currentTableId && o.status === 'OPEN',
      );

      if (openOrder) {
        // console.warn(
        //   'Mesa ocupada. Redirecionando para ordem existente:',
        //   openOrder.id,
        // );
        // Redirect to existing order
        window.location.href = `/pages/createOrder.html?table_id=${currentTableId}&order_id=${openOrder.id}`;
        return;
      }
    } catch (e) {
      // console.error('Erro ao verificar pedidos da mesa:', e);
    }
  }

  if (currentOrderId) {
    // console.log('Edit Mode: Order ID present', currentOrderId);
    await loadOrderDetails(currentOrderId);
  }

  await Promise.all([loadCategories(), loadProducts()]);

  renderProductsByCategory();
  renderOrderSummary();
  updateTotals();
  updateUIVisibility();
}

// --- Auth & Helpers ---

async function checkAuth(): Promise<boolean> {
  try {
    await ApiService.get('/auth/me');
    return true;
  } catch (error) {
    // console.error('Auth check failed:', error);
    window.location.href = 'landingPage.html';
    return false;
  }
}

function initDarkMode() {
  // Basic Dark Mode Logic if needed, usually global.js handles this
  const darkModeToggle = document.getElementById('darkModeToggle');
  if (darkModeToggle) {
    darkModeToggle.onclick = () => {
      document.body.classList.toggle('dark-mode');
    };
  }
}

// --- Business Logic ---

async function loadTableDetails(tableId: string) {
  try {
    try {
      const response = await ApiService.get<{ data: Table }>(`/tables/${tableId}`);
      if (response.data) currentTableNumber = response.data.number;
    } catch (e) {
      const allTabs = await ApiService.get<{ data: Table[] }>('/tables');
      const found = allTabs.data.find((t) => t.id === tableId);
      if (found) currentTableNumber = found.number;
    }
  } catch (e) {
    console.error('Error loading table details', e);
    currentTableNumber = '?';
  }
}

function updateTableDisplay() {
  if (tableNameDisplay) {
    tableNameDisplay.textContent = currentTableNumber ? `Mesa ${currentTableNumber}` : 'Mesa ?';
  }
}

async function loadOrderDetails(orderId: string) {
  try {
    const response = await ApiService.get<{ data: Order }>(`/orders/${orderId}`);
    if (response.data) {
      existingOrderItems = response.data.items || [];
      currentOrderStatus = response.data.status;
      existingObservation = response.data.observations || '';

      if (response.data.observations && observationsTextarea) {
        observationsTextarea.value = response.data.observations;
      }

      if (response.data.status === 'CLOSED') {
        if (observationsTextarea) {
          observationsTextarea.disabled = true;
        }
      }
    }
  } catch (error) {
    // console.error('Error loading order details', error);
    showError('Erro ao carregar detalhes do pedido');
  }
}

async function loadCategories() {
  try {
    const response = await ApiService.get<{ data: Category[] }>('/categories');
    categories = response.data || [];
  } catch (error) {
    showError('Erro ao carregar categorias');
  }
}

async function loadProducts() {
  try {
    const response = await ApiService.get<{ data: Product[] }>('/products/active');
    if (!response.data) {
      const allProdResponse = await ApiService.get<{ data: Product[] }>('/products');
      products = (allProdResponse.data || []).filter((p) => p.active);
    } else {
      products = response.data || [];
    }
  } catch (error) {
    try {
      // Fallback
      const allProdResponse = await ApiService.get<{ data: Product[] }>('/products');
      products = (allProdResponse.data || []).filter((p) => p.active);
    } catch (e) {
      showError('Erro ao carregar produtos');
    }
  }
}

function renderProductsByCategory() {
  if (!productsContainer) return;
  productsContainer.innerHTML = '';

  // Render Pending Items Logic Here (moved from sidebar)
  renderPendingItemsInMainArea();

  if (categories.length === 0 || products.length === 0) {
    productsContainer.innerHTML = '<div class="empty-message">Nenhum produto disponível.</div>';
    return;
  }

  categories.forEach((category) => {
    const categoryProducts = products.filter((p) => p.category_id === category.id);
    if (categoryProducts.length === 0) return;

    const section = document.createElement('section');
    section.className = 'category-section';
    section.innerHTML = `
        <h2 class="category-title">${category.name}</h2>
        <div class="products-grid"></div>
    `;

    const grid = section.querySelector('.products-grid') as HTMLElement;
    categoryProducts.forEach((product) => {
      const card = createProductCard(product);
      grid.appendChild(card);
    });

    productsContainer.appendChild(section);
  });
}

function createProductCard(product: Product): HTMLElement {
  const card = document.createElement('div');
  card.className = 'product-card';
  card.dataset.productId = product.id;

  const imageUrl = product.image_url || 'https://placehold.co/300x200/png?text=Product';

  card.innerHTML = `
        <div class="card-image" style="background-image: url('${imageUrl}');"></div>
        <div class="card-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-desc">${product.description || ''}</p>
            <div class="card-footer-row">
                <p class="product-price">R$ ${centsToReais(product.price)}</p>
                   <button class="btn-add-action" aria-label="Adicionar">
                     <span class="material-symbols-outlined" style="font-size: 18px;">add</span>
                   </button>
            </div>
        </div>
    `;

  // Card Click (Add to cart)
  card.addEventListener('click', (e) => {
    addToCart(product);
  });

  // Explicit Button Click (Add to cart + Animation)
  const addBtn = card.querySelector('.btn-add-action') as HTMLButtonElement;
  if (addBtn) {
    addBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent card click from firing
      addToCart(product);

      // Visual feedback
      addBtn.style.transform = 'scale(0.95)';
      setTimeout(() => addBtn.style.transform = '', 150);
    });
  }

  return card;
}

function addToCart(product: Product) {
  if (currentOrderStatus === 'CLOSED') {
    showError("Pedido fechado. Não é possível adicionar itens.");
    return;
  }
  const existingItem = cart.find((item) => item.product_id === product.id);
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({
      product_id: product.id,
      name: product.name,
      price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
      quantity: 1,
    });
  }
  renderOrderSummary();
  updateTotals();
}

function updateCartQuantity(index: number, delta: number) {
  const item = cart[index];
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    cart.splice(index, 1);
  }
  renderOrderSummary();
  updateTotals();
}

function renderOrderSummary() {
  if (!orderItemsList) return;
  orderItemsList.innerHTML = '';

  // Filter existing items
  const pendingItems = existingOrderItems.filter(i => !i.delivered_at); // Removed sort by created_at
  const deliveredItems = existingOrderItems.filter(i => i.delivered_at).sort((a, b) => new Date(b.delivered_at || 0).getTime() - new Date(a.delivered_at || 0).getTime());

  // 1. Section: A Entregar (Pending) moved to main area
  // See renderPendingItemsInMainArea function below

  // 2. Section: Adicionando (Cart)
  const cartHeader = document.createElement('div');
  cartHeader.innerHTML = `<h4 style="margin: 1rem 0 0.5rem 0; font-size: 0.9rem; color: #3b82f6; display:flex; align-items:center; gap:5px;"><span class="material-symbols-outlined" style="font-size:16px">shopping_cart</span> Adicionando...</h4>`;
  orderItemsList.appendChild(cartHeader);

  if (cart.length > 0) {
    cart.forEach((item, index) => {
      const el = document.createElement('div');
      el.className = 'cart-item-row';
      el.style.borderLeft = "3px solid #3b82f6";
      el.style.paddingLeft = "8px";
      el.innerHTML = `
                <div class="item-details">
                    <span class="item-title">${item.name}</span>
                    <span class="item-meta">${formatCurrency(item.price)}</span>
                </div>
                <div class="item-controls">
                     <button class="qty-btn btn-minus" data-index="${index}">-</button>
                     <span class="item-qty-display">${item.quantity}</span>
                     <button class="qty-btn btn-plus" data-index="${index}">+</button>
                </div>
            `;
      el.querySelector('.btn-minus')?.addEventListener('click', (e) => { e.stopPropagation(); updateCartQuantity(index, -1); });
      el.querySelector('.btn-plus')?.addEventListener('click', (e) => { e.stopPropagation(); updateCartQuantity(index, 1); });
      orderItemsList.appendChild(el);
    });
  } else {
    const emptyEl = document.createElement('div');
    emptyEl.innerHTML = '<div style="font-style:italic; color:#9ca3af; padding: 0.5rem; font-size: 0.9rem;">Selecione produtos...</div>';
    orderItemsList.appendChild(emptyEl);
  }

  // 3. Section: Entregues (History)
  if (deliveredItems.length > 0) {
    const dHeader = document.createElement('div');
    dHeader.innerHTML = `<h4 style="margin: 1.5rem 0 0.5rem 0; font-size: 0.9rem; color: #10b981; display:flex; align-items:center; gap:5px;"><span class="material-symbols-outlined" style="font-size:16px">done_all</span> Entregues</h4>`;
    orderItemsList.appendChild(dHeader);

    deliveredItems.forEach(item => {
      const el = document.createElement('div');
      el.className = 'cart-item-row';
      el.style.opacity = "0.8";
      el.innerHTML = `
            <div class="item-details">
                <span class="item-title" style="color:#374151;">${item.product_name || 'Produto'}</span>
                <span class="item-meta" style="font-size: 0.8rem;">Entregue às ${item.delivered_at ? new Date(item.delivered_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</span>
            </div>
            <div class="item-controls">
                 <span style="font-size: 0.9rem; font-weight: 600; color: #10b981;">${item.quantity}x ${formatCurrency(item.unit_price)}</span>
            </div>
        `;
      orderItemsList.appendChild(el);
    });
  }
}

function updateTotals() {


  const deliveredTotal = existingOrderItems
    .filter(i => i.delivered_at)
    .reduce((acc, item) => acc + (item.total_item || item.unit_price * item.quantity), 0);



  const grandTotal = deliveredTotal; // + cartTotal? No, keep strictly to delivered.

  if (subtotalEl) subtotalEl.textContent = formatCurrency(grandTotal);
  if (totalEl) totalEl.textContent = formatCurrency(grandTotal);
}

// --- API Actions ---

async function removeOrderItem(orderId: string, itemId: string, quantity?: number) {
  const confirmMessage = quantity ? `Tem certeza que deseja cancelar ${quantity} item(s)?` : 'Tem certeza que deseja cancelar este item?';

  showConfirmationModal('Cancelar Item', confirmMessage, async () => {
    try {
      let url = `/orders/${orderId}/items/${itemId}`;
      if (quantity) {
        url += `?quantity=${quantity}`;
      }
      await ApiService.delete(url);
      showSuccess('Item cancelado com sucesso!');
      await loadOrderDetails(orderId);
      renderOrderSummary(); // Re-render sidebar
      renderProductsByCategory(); // Re-render main area to update pending list
      updateTotals();
    } catch (error: any) {
      // console.error('Erro ao remover item:', error);
      showError('Erro ao remover item');
    }
  });
}
//...


async function deliverItem(orderId: string, itemId: string, quantity?: number) {
  try {
    await ApiService.put(`/orders/${orderId}/items/${itemId}/deliver`, { quantity });
    showSuccess('Item entregue!');
    await loadOrderDetails(orderId);
    renderOrderSummary();
    renderProductsByCategory(); // Update pending list
    updateTotals();
  } catch (error: any) {
    showError('Erro ao entregar item');
  }
}

async function saveItems() {
  if (cart.length === 0 && !currentOrderId) {
    showError('Adicione produto ao pedido');
    return;
  }

  const sendBtn = document.querySelector('.btn-send') as HTMLButtonElement | null;
  if (sendBtn) {
    sendBtn.disabled = true;
    sendBtn.textContent = 'Processando...';
  }

  try {
    let orderId = currentOrderId;

    // Create order if not exists
    if (!orderId) {
      const orderResponse = await ApiService.post<{ data: Order }>('/orders', {
        table_id: currentTableId,
        user_id: getUserIdFromSession(),
      });
      orderId = orderResponse.data.id;
    }

    // Add items
    if (cart.length > 0) {
      for (const item of cart) {
        await ApiService.post(`/orders/${orderId}/items`, {
          product_id: item.product_id,
          quantity: item.quantity,
        });
      }
    }

    // Update observations
    if (observationsTextarea) {
      const obs = observationsTextarea.value.trim();
      const existingObs = existingObservation || '';
      // Simple logic: if obs changed, update. 
      // Note: If reusing same text field, this logic assumes the user edited it.
      if (obs !== existingObs) {
        await ApiService.put(`/orders/${orderId}`, { observations: obs });
      }
    }

    showSuccess(currentOrderId ? 'Pedido atualizado!' : 'Pedido criado com sucesso!');
    cart = [];

    // Stay on page logic
    currentOrderId = orderId;

    // Update URL if new order
    const url = new URL(window.location.href);
    if (!url.searchParams.has('order_id')) {
      url.searchParams.set('order_id', orderId);
      window.history.pushState({}, '', url);
    }

    // Refresh UI
    await loadOrderDetails(orderId);
    renderOrderSummary();
    renderProductsByCategory();

    // Re-enable button
    if (sendBtn) {
      sendBtn.disabled = false;
      sendBtn.textContent = 'Salvar / Adicionar';
    }

  } catch (error: any) {
    // console.error('Erro ao salvar:', error);
    showError(error.message || 'Erro ao processar pedido.');
    if (sendBtn) {
      sendBtn.disabled = false;
      sendBtn.textContent = 'Criar Pedido';
    }
  }
}

async function finalizeOrder() {
  if (!currentOrderId) {
    showError('Salve o pedido antes de finalizar.');
    return;
  }

  // Validation: Check for pending items (not delivered)
  const pendingItems = existingOrderItems.filter(i => !i.delivered_at);
  if (pendingItems.length > 0) {
    showError('Não é possível finalizar: Existem itens pendentes de entrega.');
    return;
  }

  if (cart.length > 0) {
    if (!confirm("Existem itens no carrinho não enviados. Deseja descartá-los e finalizar?")) return;
  }


  window.location.href = `closeOrder.html?order_id=${currentOrderId}&table_id=${currentTableId}`;
}


// --- Utils & Events ---

function setupEventListeners() {
  // Header Back
  const headerBackBtn = document.getElementById('headerBackBtn');
  if (headerBackBtn) {
    headerBackBtn.addEventListener('click', () => {
      window.location.href = '../pages/waiterMain.html';
    });
  }

  // Logo Click
  const logoImage = document.getElementById('logoImage');
  if (logoImage) {
    logoImage.addEventListener('click', () => {
      window.location.href = '../pages/waiterMain.html';
    });
  }

  // Logout Button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await ApiService.post("/auth/logout", {});
      } catch (e) {
        console.error("Logout error", e);
      } finally {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '../pages/landingPage.html';
      }
    });
  }

  // User Profile Click
  const userBtn = document.getElementById("userBtn");
  const headerActions = document.querySelector(".header-actions") as HTMLElement;

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


  // Primary Action (Send/Save)
  const sendBtn = document.querySelector('.btn-send') as HTMLButtonElement | null;
  if (sendBtn) sendBtn.onclick = saveItems;

  // Finalize
  const finalizeBtn = document.querySelector('.btn-finalize') as HTMLButtonElement | null;
  if (finalizeBtn) finalizeBtn.onclick = finalizeOrder;

  // Toggle Summary
  const bgHeader = document.querySelector('.order-card-header');
  if (bgHeader) {
    bgHeader.addEventListener('click', () => {
      const body = document.querySelector('.order-card-body') as HTMLElement;
      const icon = bgHeader.querySelector('.toggle-icon');
      if (body.style.display === 'none') {
        body.style.display = 'flex';
        if (icon) icon.textContent = 'expand_less';
      } else {
        body.style.display = 'none';
        if (icon) icon.textContent = 'expand_more';
      }
    });
  }

  // Regex Limit for Observations
  if (observationsTextarea) {
    observationsTextarea.addEventListener('input', function () {
      // Regex to keep only the first 150 characters
      const regexLimit = /^(.{0,100})[\s\S]*$/;
      this.value = this.value.replace(regexLimit, '$1');
    });
  }
}

function updateUIVisibility() {
  const sendBtn = document.querySelector('.btn-send') as HTMLButtonElement | null;
  const finalizeBtn = document.querySelector('.btn-finalize') as HTMLButtonElement | null;

  if (currentOrderId && currentOrderStatus !== 'CLOSED') {
    if (finalizeBtn) finalizeBtn.style.display = 'block';
    if (sendBtn) sendBtn.textContent = "Salvar / Adicionar";
  }

  if (currentOrderStatus === 'CLOSED') {
    if (sendBtn) sendBtn.style.display = 'none';
    if (finalizeBtn) finalizeBtn.style.display = 'none';
    const products = document.querySelectorAll('.product-card');
    products.forEach(p => (p as HTMLElement).style.pointerEvents = 'none');
    if (observationsTextarea) observationsTextarea.disabled = true;
  }
}

function getUserIdFromSession() {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      return user.id;
    } catch (e) { }
  }
  return '140e6988-51f7-418b-96c2-05452d3999e5';
}

function showSuccess(message: string) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.className = 'toast toast-success';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function showError(message: string) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.className = 'toast toast-error';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// --- Profile Popover Logic ---

function toggleProfilePopover(btn: HTMLElement) {
  closePopovers(); // Close others
  let popover = document.getElementById("profilePopover");

  if (!popover) {
    popover = document.createElement("div");
    popover.id = "profilePopover";
    popover.className = "popover";


    let user: User | null = null;
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try { user = JSON.parse(userStr); } catch (e) { }
    }

    if (user) {
      popover.innerHTML = `
        <div class="popover-header">Perfil de Usuário</div>
        <div class="popover-body">
          <div class="user-info-card">
            <div class="user-name">${user.name}</div>
            <div class="user-username">@${user.username}</div>
            <div class="user-role-badge">
              <span class="role-badge ${user.role.toLowerCase()}">${user.role}</span>
            </div>
          </div>
        </div>
      `;
    } else {
      popover.innerHTML = `<div class="popover-body">Usuário não identificado</div>`;
    }

    // Append to header-actions
    const headerActions = document.querySelector(".header-actions");
    if (headerActions) headerActions.appendChild(popover);

    // Prevent close on click inside
    popover.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  popover.classList.toggle("active");
}

function closePopovers() {
  document
    .querySelectorAll(".popover")
    .forEach((p) => p.classList.remove("active"));
}


function renderPendingItemsInMainArea() {
  // Filter existing items
  const pendingItems = existingOrderItems.filter(i => !i.delivered_at).sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());

  if (pendingItems.length === 0) return;

  const section = document.createElement('section');
  section.className = 'category-section';
  section.style.marginBottom = "2rem";
  section.innerHTML = `
        <h2 class="category-title delivery-section-header">
            <span class="material-symbols-outlined">schedule</span> 
            Aguardando Entrega (${pendingItems.length})
        </h2>
        <div class="products-grid"></div>
    `;

  const grid = section.querySelector('.products-grid') as HTMLElement;

  pendingItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'product-card product-card-pending';
    card.innerHTML = `
            <div class="card-info card-info-row">
                <div>
                    <h3 class="product-name">${item.product_name || 'Produto'}</h3>
                    <p class="product-desc product-desc-pending">
                        Pedido às: <strong>${item.created_at ? new Date(item.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</strong>
                    </p>
                </div>
                <div class="card-footer-row">
                    <p class="product-price">${item.quantity}x ${formatCurrency(item.unit_price)}</p>
                    <div class="btn-actions-wrapper">
                         <button class="btn-add-action btn-deliver-main btn-deliver-custom" aria-label="Entregar">
                           <span class="material-symbols-outlined">check</span>
                         </button>
                         <button class="btn-add-action btn-cancel-main btn-cancel-custom" aria-label="Cancelar">
                           <span class="material-symbols-outlined">delete</span>
                         </button>
                    </div>
                </div>
            </div>
        `;

    card.querySelector('.btn-deliver-main')?.addEventListener('click', () => {
      if (item.quantity > 1) {
        // Show simple prompt for now (or a custom modal if preferred, but prompt is easiest for partial logic)
        // User asked for "selecionar", let's use a browser prompt first, then upgrade if needed for aesthetics.
        // Actually, "Design Aesthetics" rule says avoid simple things. Let's create a dynamic modal.
        showQuantityModal(item, (qty) => {
          deliverItem(currentOrderId!, item.id, qty);
        });
      } else {
        deliverItem(currentOrderId!, item.id);
      }
    });

    card.querySelector('.btn-cancel-main')?.addEventListener('click', () => {
      if (item.quantity > 1) {
        showCancelQuantityModal(item, (qty) => {
          removeOrderItem(currentOrderId!, item.id, qty);
        });
      } else {
        removeOrderItem(currentOrderId!, item.id);
      }
    });

    grid.appendChild(card);
  });

  productsContainer.prepend(section);
}

// Helper Modal for Quantity
function showQuantityModal(item: OrderItem, onConfirm: (qty: number) => void) {
  const modal = document.createElement('div');
  modal.className = 'quantity-modal-overlay active';
  modal.innerHTML = `
        <div class="quantity-modal-content glass">
            <h3 class="modal-title">Confirmar Entrega</h3>
            <p class="modal-desc">
               Quantos <strong>${item.product_name}</strong> foram entregues?
            </p>
            <div class="modal-controls">
                <button id="qty-minus" class="btn-icon modal-qty-btn">-</button>
                <span id="qty-display" class="modal-qty-display">1</span>
                <button id="qty-plus" class="btn-icon modal-qty-btn">+</button>
            </div>
            
            <div class="modal-actions">
                <button id="cancel-qty" class="btn btn-cancel-modal">Cancelar</button>
                <button id="confirm-qty" class="btn btn-primary" style="flex: 1;">Confirmar</button>
            </div>
        </div>
    `;

  document.body.appendChild(modal);

  let currentQty = 1;
  const display = modal.querySelector('#qty-display')!;

  modal.querySelector('#qty-minus')?.addEventListener('click', () => {
    if (currentQty > 1) {
      currentQty--;
      display.textContent = currentQty.toString();
    }
  });

  modal.querySelector('#qty-plus')?.addEventListener('click', () => {
    if (currentQty < item.quantity) {
      currentQty++;
      display.textContent = currentQty.toString();
    }
  });

  modal.querySelector('#confirm-qty')?.addEventListener('click', () => {
    onConfirm(currentQty);
    document.body.removeChild(modal);
  });

  modal.querySelector('#cancel-qty')?.addEventListener('click', () => {
    document.body.removeChild(modal);
  });
}


// Helper Modal for Quantity (Generic or Specific)
function showCancelQuantityModal(item: OrderItem, onConfirm: (qty: number) => void) {
  const modal = document.createElement('div');
  modal.className = 'quantity-modal-overlay active';
  modal.innerHTML = `
        <div class="quantity-modal-content glass">
            <h3 class="modal-title">Cancelar Item</h3>
            <p class="modal-desc">
               Quantos <strong>${item.product_name}</strong> deseja cancelar?
            </p>
            <div class="modal-controls">
                <button id="qty-minus" class="btn-icon modal-qty-btn">-</button>
                <span id="qty-display" class="modal-qty-display">1</span>
                <button id="qty-plus" class="btn-icon modal-qty-btn">+</button>
            </div>
            
            <div class="modal-actions">
                <button id="cancel-qty" class="btn btn-cancel-modal">Voltar</button>
                <button id="confirm-qty" class="btn btn-primary btn-cancel-main" style="flex: 1; background-color: #ef4444;">Cancelar</button>
            </div>
        </div>
    `;

  document.body.appendChild(modal);

  let currentQty = 1;
  const display = modal.querySelector('#qty-display')!;

  modal.querySelector('#qty-minus')?.addEventListener('click', () => {
    if (currentQty > 1) {
      currentQty--;
      display.textContent = currentQty.toString();
    }
  });

  modal.querySelector('#qty-plus')?.addEventListener('click', () => {
    if (currentQty < item.quantity) {
      currentQty++;
      display.textContent = currentQty.toString();
    }
  });

  modal.querySelector('#confirm-qty')?.addEventListener('click', () => {
    onConfirm(currentQty);
    document.body.removeChild(modal);
  });

  modal.querySelector('#cancel-qty')?.addEventListener('click', () => {
    document.body.removeChild(modal);
  });
}

// Helper Modal for Confirmation
function showConfirmationModal(title: string, message: string, onConfirm: () => void) {
  const modal = document.createElement('div');
  modal.className = 'quantity-modal-overlay active'; // Confirm reuse of same overlay style
  modal.innerHTML = `
        <div class="quantity-modal-content glass">
            <h3 class="modal-title">${title}</h3>
            <p class="modal-desc">${message}</p>
            
            <div class="modal-actions">
                <button id="cancel-confirm" class="btn btn-cancel-modal">Não</button>
                <button id="confirm-action" class="btn btn-primary" style="flex: 1;">Sim</button>
            </div>
        </div>
    `;

  document.body.appendChild(modal);

  const close = () => document.body.removeChild(modal);

  modal.querySelector('#confirm-action')?.addEventListener('click', () => {
    onConfirm();
    close();
  });

  modal.querySelector('#cancel-confirm')?.addEventListener('click', () => {
    close();
  });
}

interface User {
  id: string;
  name: string;
  username: string;
  role: string;
}

