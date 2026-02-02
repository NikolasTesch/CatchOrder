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
const infoBar = document.querySelector('.info-bar') as HTMLElement;
// Updated selector from .page-wrapper to .content-wrapper
const categoryContainer = document.querySelector(
  '.content-wrapper',
) as HTMLElement;
const observationsTextarea = document.querySelector(
  '.obs-textarea',
) as HTMLTextAreaElement;

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

  // [New Logic] Check if table already has an OPEN order
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
  updateInfoBar();
  updateUIVisibility();
}

// --- Auth & Helpers (Standard Pattern) ---

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

// --- UI Logic from Products Page (Sidebar, Modal) ---

function toggleSidebar() {
  document.body.classList.toggle('sidebar-open');
}

function closeSidebar() {
  document.body.classList.remove('sidebar-open');
}

function openUserModal() {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      const nameEl = document.getElementById('modalUserName');
      const roleEl = document.getElementById('modalUserRole');
      if (nameEl) nameEl.textContent = user.name || 'Usuário';
      if (roleEl) roleEl.textContent = formatRole(user.role || '');
      document.body.classList.add('user-modal-open');
    } catch (error) {
      // console.error('Error parsing user data:', error);
    }
  }
}

function closeUserModal() {
  document.body.classList.remove('user-modal-open');
}

function handleLogout() {
  ModalService.confirm('Sair', 'Tem certeza que deseja sair?', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'landingPage.html';
  });
}

function formatRole(role: string): string {
  const roleMap: { [key: string]: string } = {
    admin: 'Administrador',
    manager: 'Gerente',
    waiter: 'Garçom',
    kitchen: 'Cozinha',
  };
  return roleMap[role] || role;
}

// --- Business Logic ---

async function loadTableDetails(tableId: string) {
  try {
    try {
      const response = await ApiService.get<{ data: Table }>(
        `/tables/${tableId}`,
      );
      if (response.data) currentTableNumber = response.data.number;
    } catch (e) {
      const allTabs = await ApiService.get<{ data: Table[] }>('/tables');
      const found = allTabs.data.find((t) => t.id === tableId);
      if (found) currentTableNumber = found.number;
    }
  } catch (e) {
    // console.error('Error loading table details', e);
    currentTableNumber = 'Unknown';
  }
}

async function loadOrderDetails(orderId: string) {
  try {
    const response = await ApiService.get<{ data: Order }>(
      `/orders/${orderId}`,
    );
    if (response.data) {
      existingOrderItems = response.data.items || [];
      currentOrderStatus = response.data.status;
      existingObservation = response.data.observations || '';

      renderExistingItems();

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
    const response = await ApiService.get<{ data: Product[] }>(
      '/products/active',
    );
    if (!response.data) {
      const allProdResponse = await ApiService.get<{ data: Product[] }>(
        '/products',
      );
      products = (allProdResponse.data || []).filter((p) => p.active);
    } else {
      products = response.data || [];
    }
  } catch (error) {
    try {
      const allProdResponse = await ApiService.get<{ data: Product[] }>(
        '/products',
      );
      products = (allProdResponse.data || []).filter((p) => p.active);
    } catch (e) {
      showError('Erro ao carregar produtos');
    }
  }
}

function renderProductsByCategory() {
  const existingSections = document.querySelectorAll('.category-section');
  existingSections.forEach((section) => section.remove());

  const obsSection = document.querySelector('.observations-section');

  if (categories.length === 0 || products.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.textContent = 'Nenhum produto disponível no momento.';
    emptyMessage.style.cssText =
      'text-align: center; padding: 2rem; color: var(--text-secondary);';
    if (categoryContainer && obsSection) {
      categoryContainer.insertBefore(emptyMessage, obsSection);
    }
    return;
  }

  categories.forEach((category) => {
    const categoryProducts = products.filter(
      (p) => p.category_id === category.id,
    );
    if (categoryProducts.length === 0) return;

    const section = document.createElement('section');
    section.className = 'category-section';
    section.innerHTML = `
            <h2 class="category-title">${category.name} <span class="arrow">→</span></h2>
            <div class="products-grid"></div>
        `;

    const grid = section.querySelector('.products-grid') as HTMLElement;
    categoryProducts.forEach((product) => {
      const card = createProductCard(product);
      grid.appendChild(card);
    });

    const productsContainer = document.getElementById('products-container');
    if (productsContainer) {
      productsContainer.appendChild(section);
    } else if (categoryContainer && obsSection) {
      // Fallback
      categoryContainer.insertBefore(section, obsSection);
    }
  });
}

function createProductCard(product: Product): HTMLElement {
  const card = document.createElement('div');
  card.className = 'product-card';
  card.dataset.productId = product.id;

  const imageUrl = product.image_url || 'https://placehold.co/150';

  card.innerHTML = `
        <div class="card-image" style="background-image: url('${imageUrl}');"></div>
        <div class="card-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-desc">${product.description || ''}</p>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto;">
                <p class="product-price">R$ ${centsToReais(product.price)}</p>
                <div class="btn-group">
                   <button class="btn-add-action" aria-label="Adicionar">Adicionar</button>
                </div>
            </div>
        </div>
    `;

  card.addEventListener('click', (e) => {
    addToCart(product);
  });

  return card;
}

function addToCart(product: Product) {
  const existingItem = cart.find((item) => item.product_id === product.id);
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({
      product_id: product.id,
      name: product.name,
      price:
        typeof product.price === 'string'
          ? parseFloat(product.price)
          : product.price,
      quantity: 1,
    });
  }
  updateInfoBar();
  renderCartItems();
  showSuccess(`${product.name} adicionado ao pedido`);
}

function updateInfoBar() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const displayTable = currentTableNumber
    ? `Mesa ${currentTableNumber}`
    : currentTableId || 'Mesa ?';

  if (infoBar) {
    infoBar.innerHTML = `
        <div class="info-item">
          <span class="info-label">${totalItems} Produto${totalItems !== 1 ? 's' : ''} (Novo)</span>
        </div>
        <div class="info-item">
          <span class="info-label">${displayTable}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Total (+${formatCurrency(totalPrice)})</span>
        </div>
      `;
  }
}

function renderExistingItems() {
  let existingSection = document.getElementById('existing-items-section');
  if (!existingSection) {
    existingSection = document.createElement('section');
    existingSection.id = 'existing-items-section';
    existingSection.className = 'card';
    existingSection.style.cssText =
      'margin-bottom: 2rem; padding: 1rem; background: var(--bg-card); border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 4px solid var(--color-primary);';

    const infoBarEl = document.querySelector('.info-bar');
    if (infoBarEl && infoBarEl.nextSibling) {
      categoryContainer.insertBefore(existingSection, infoBarEl.nextSibling);
    } else if (categoryContainer) {
      categoryContainer.prepend(existingSection);
    }
  }

  if (existingOrderItems.length === 0) {
    existingSection.style.display = 'none';
    return;
  }

  existingSection.style.display = 'block';
  const totalExisting = existingOrderItems.reduce(
    (acc, item) => acc + (item.total_item || item.unit_price * item.quantity),
    0,
  );

  existingSection.innerHTML = `
        <h3 style="color: var(--color-primary); margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid var(--border-light); padding-bottom: 0.5rem;">
            <span>Já no Pedido (${existingOrderItems.length})</span>
            <span style="font-size: 0.9rem; font-weight: normal;">Total: ${formatCurrency(totalExisting)}</span>
        </h3>
        <ul style="list-style: none; padding: 0;">
            ${existingOrderItems
      .map(
        (item) => `
                <li style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid var(--border-light);">
                    <div style="flex: 1;">
                         <div style="font-weight: bold; color: var(--color-primary);">
                            ${item.quantity}x <span style="font-weight: normal;">${item.product_name || 'Produto'}</span>
                         </div>
                         <div style="font-size: 0.85rem; color: var(--text-secondary);">
                            Vl. Unit: ${formatCurrency(item.unit_price)}
                         </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 1rem;">
                         <strong style="color: var(--color-primary);">${formatCurrency(item.total_item || item.unit_price * item.quantity)}</strong>
                         ${currentOrderStatus !== 'CLOSED'
            ? `
                         <button class="btn-remove-item" data-id="${item.id}" style="background: #fee2e2; color: #ef4444; border: 1px solid #fecaca; padding: 6px; border-radius: 6px; cursor: pointer; transition: all 0.2s;" title="Deletar Item Salvo">
                            <span class="material-symbols-outlined" style="font-size: 20px;">delete</span>
                         </button>
                         `
            : ''
          }
                    </div>
                </li>
            `,
      )
      .join('')}
        </ul>
        ${existingObservation ? `
            <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px dashed var(--border-light);">
                <strong style="color: var(--text-primary); display: block; margin-bottom: 0.25rem;">Observações:</strong>
                <p style="color: var(--text-secondary); font-style: italic;">${existingObservation}</p>
            </div>
            ` : ''}
    `;

  existingSection.querySelectorAll('.btn-remove-item').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const btnEl = e.currentTarget as HTMLElement;
      if (btnEl.style.opacity === '0.5') return;
      const itemId = btnEl.dataset.id;
      if (itemId && currentOrderId) {
        ModalService.confirm('Remover Item', 'Tem certeza que deseja remover este item?', async () => {
          btnEl.style.opacity = '0.5';
          await removeOrderItem(currentOrderId!, itemId);
        });
      }
    });
  });
}

function renderCartItems() {
  let cartSection = document.getElementById('cart-items-section');
  if (!cartSection) {
    cartSection = document.createElement('section');
    cartSection.id = 'cart-items-section';
    cartSection.className = 'card';
    cartSection.style.cssText =
      'margin-bottom: 2rem; padding: 1rem; background: var(--bg-card); border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 4px solid #10b981;';

    const existingSection = document.getElementById('existing-items-section');
    if (existingSection && existingSection.nextSibling) {
      categoryContainer.insertBefore(cartSection, existingSection.nextSibling);
    } else {
      const infoBarEl = document.querySelector('.info-bar');
      if (infoBarEl && infoBarEl.nextSibling) {
        categoryContainer.insertBefore(cartSection, infoBarEl.nextSibling);
      } else {
        const obsSection = document.querySelector('.observations-section');
        if (obsSection) categoryContainer.insertBefore(cartSection, obsSection);
      }
    }
  }

  if (cart.length === 0) {
    cartSection.style.display = 'none';
    return;
  }
  cartSection.style.display = 'block';

  const totalCart = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  cartSection.innerHTML = `
        <h3 style="color: #10b981; margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid var(--border-light); padding-bottom: 0.5rem;">
            <span>Novos Itens (A Enviar)</span>
            <span style="font-size: 0.9rem; font-weight: normal;">Total: ${formatCurrency(totalCart)}</span>
            <button id="btn-clear-cart" style="background:none; border:none; color: #ef4444; font-size: 0.8rem; cursor: pointer;">Limpar</button>
        </h3>
        <ul style="list-style: none; padding: 0;">
            ${cart
      .map(
        (item, index) => `
                <li style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid var(--border-light);">
                    <div style="flex: 1;">
                         <div style="font-weight: bold; color: var(--text-primary);">
                            ${item.quantity}x <span style="font-weight: normal;">${item.name}</span>
                         </div>
                         <div style="font-size: 0.85rem; color: var(--text-secondary);">
                            Vl. Unit: R$ ${centsToReais(item.price)}
                         </div>
                    </div>
                    <button class="btn-remove-new" data-index="${index}" style="color: #ef4444; background: none; border: none; cursor: pointer;">
                        <span class="material-symbols-outlined">delete</span>
                    </button>
                </li>
            `,
      )
      .join('')}
        </ul>
    `;

  // Add event listeners for remove buttons
  cartSection.querySelectorAll('.btn-remove-new').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent bubbling if needed
      const index = parseInt(
        (e.currentTarget as HTMLElement).dataset.index || '0',
      );
      removeFromCart(index);
    });
  });

  const clearBtn = document.getElementById('btn-clear-cart');
  if (clearBtn) {
    clearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      cart = [];
      updateInfoBar();
      renderCartItems();
    });
  }
}

function removeFromCart(index: number) {
  cart.splice(index, 1);
  updateInfoBar();
  renderCartItems();
}

async function removeOrderItem(orderId: string, itemId: string) {
  try {
    await ApiService.delete(`/orders/${orderId}/items/${itemId}`);
    showSuccess('Item removido com sucesso!');
    await loadOrderDetails(orderId);
  } catch (error: any) {
    // console.error('Erro ao remover item:', error);
    showError('Erro ao remover item');
  }
}

async function saveItems() {
  if (cart.length === 0 && !currentOrderId) {
    showError('Adicione produto ao pedido');
    return;
  }

  const sendBtn = document.querySelector(
    '.btn-send',
  ) as HTMLButtonElement | null;
  if (sendBtn) {
    sendBtn.disabled = true;
    sendBtn.textContent = 'Enviando...';
  }

  try {
    let orderId = currentOrderId;

    if (!orderId) {
      const orderResponse = await ApiService.post<{ data: Order }>('/orders', {
        table_id: currentTableId,
        user_id: getUserIdFromSession(),
      });
      orderId = orderResponse.data.id;
    }

    if (cart.length > 0) {
      for (const item of cart) {
        await ApiService.post(`/orders/${orderId}/items`, {
          product_id: item.product_id,
          quantity: item.quantity,
        });
      }
    }

    if (observationsTextarea) {
      const obs = observationsTextarea.value.trim();
      if (obs) {
        await ApiService.put(`/orders/${orderId}`, { observations: obs });
      }
    }

    showSuccess(
      currentOrderId ? 'Pedido atualizado!' : 'Pedido criado com sucesso!',
    );
    cart = [];

    setTimeout(() => {
      window.location.href = `createOrder.html?table_id=${currentTableId}&order_id=${orderId}`;
    }, 1500);
  } catch (error: any) {
    // console.error('Erro ao salvar:', error);
    showError(error.message || 'Erro ao processar pedido.');
    if (sendBtn) {
      sendBtn.disabled = false;
      sendBtn.textContent = 'Salvar / Atualizar Itens';
    }
  }
}

async function finalizeOrder() {
  if (!currentOrderId) {
    showError('Salve o pedido antes de finalizar.');
    return;
  }

  // Salvar itens pendentes antes de redirecionar
  if (cart.length > 0) {
    try {
      await saveItems();
    } catch (error) {
      showError('Erro ao salvar itens. Tente novamente.');
      return;
    }
  }

  // Redirecionar para página de fechamento de comanda
  window.location.href = `closeOrder.html?order_id=${currentOrderId}&table_id=${currentTableId}`;
}

// --- Utils ---

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
  toast.className = 'toast-success';
  toast.style.cssText =
    'position:fixed;top:80px;right:20px;background:#10b981;color:white;padding:1rem;border-radius:8px;z-index:9999';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function showError(message: string) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText =
    'position:fixed;top:80px;right:20px;background:#ef4444;color:white;padding:1rem;border-radius:8px;z-index:9999';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function updateUIVisibility() {
  const sendBtn = document.querySelector(
    '.btn-send',
  ) as HTMLButtonElement | null;
  const finalizeBtn = document.querySelector(
    '.btn-finalize',
  ) as HTMLButtonElement | null;

  if (currentOrderId) {
    if (currentOrderStatus === 'CLOSED') {
      if (sendBtn) sendBtn.style.display = 'none';
      if (finalizeBtn) finalizeBtn.style.display = 'none';

      // Disable product cards
      const products = document.querySelectorAll('.product-card');
      products.forEach(
        (p) => ((p as HTMLElement).style.pointerEvents = 'none'),
      );

      // Show a closed message
      let msg = document.getElementById('closed-msg');
      if (!msg) {
        msg = document.createElement('div');
        msg.id = 'closed-msg';
        msg.className = 'alert alert-info';
        msg.textContent = 'Este pedido já está fechado.';
        msg.style.cssText =
          'background: #e0f2fe; color: #0369a1; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; text-align: center; font-weight: bold; width: 100%;';
        if (categoryContainer) categoryContainer.prepend(msg);
      }
    } else {
      if (sendBtn) {
        sendBtn.textContent = 'Salvar / Atualizar Itens';
        sendBtn.style.display = 'block';
      }
      if (finalizeBtn) {
        finalizeBtn.style.display = 'block';
      }
    }
  } else {
    if (sendBtn) {
      sendBtn.textContent = 'Criar Pedido';
      sendBtn.style.display = 'block';
    }
    if (finalizeBtn) finalizeBtn.style.display = 'none';
  }
}

function setupEventListeners() {
  const sendBtn = document.querySelector(
    '.btn-send',
  ) as HTMLButtonElement | null;
  if (sendBtn) sendBtn.onclick = saveItems;

  const headerBackBtn = document.getElementById('headerBackBtn');
  if (headerBackBtn) {
    headerBackBtn.addEventListener('click', () => {
      window.location.href = 'waiterMain.html';
    });
  }

  const finalizeBtn = document.querySelector(
    '.btn-finalize',
  ) as HTMLButtonElement | null;
  if (finalizeBtn) finalizeBtn.onclick = finalizeOrder;

  const darkModeToggle = document.getElementById('darkModeToggle');
  if (darkModeToggle) {
    darkModeToggle.onclick = toggleDarkMode;
  }

  // Sidebar & Navigation
  const menuBtn = document.getElementById('menuBtn');
  const sidebar = document.getElementById('sidebar');
  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', toggleSidebar);
  }

  const closeSidebarBtn = document.getElementById('closeSidebar');
  if (closeSidebarBtn) {
    closeSidebarBtn.addEventListener('click', closeSidebar);
  }

  const sidebarOverlay = document.getElementById('sidebarOverlay');
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeSidebar);
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

  // Sidebar Links
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      const dest = (item as HTMLElement).dataset.href;
      if (dest) window.location.href = dest;
    });
  });

  const logo = document.getElementById('logoImage');
  if (logo) {
    logo.addEventListener('click', () => {
      window.location.href = 'waiterMain.html';
    });
  }

  const userBtn = document.getElementById('userBtn');
  if (userBtn) {
    userBtn.addEventListener('click', openUserModal);
  }
}

// --- Dark Mode (Shared Logic) ---
function initDarkMode() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.body.classList.add('dark-mode');
    updateDarkModeIcon(true);
  } else {
    document.body.classList.remove('dark-mode');
    updateDarkModeIcon(false);
  }
}
function toggleDarkMode() {
  const isDark = document.body.classList.toggle('dark-mode');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  updateDarkModeIcon(isDark);
}
function updateDarkModeIcon(isDark: boolean) {
  const toggle = document.getElementById('darkModeToggle');
  if (toggle) {
    const icon = toggle.querySelector('.material-symbols-outlined');
    if (icon) icon.textContent = isDark ? 'dark_mode' : 'light_mode';
  }
}
