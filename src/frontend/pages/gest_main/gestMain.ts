export {};
import './style.css';
// ========================================
// INTERFACES
// ========================================
interface User {
  id: string;
  name: string;
  username: string;
  role: 'admin' | 'manager' | 'waiter';
  created_at?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category_id: string;
  is_active: number | boolean; // API might return 0/1, treating as boolean or number
}

interface Table {
  id: string;
  number: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
}

interface Order {
  id: string;
  table_id: number; // or string depending on API, script calls it table_id but renders table_id directly
  status: 'OPEN' | 'CLOSED' | 'CANCELLED';
  total: number;
  created_at?: string;
  items?: any[];
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

// Global Window Augmentation
declare global {
  interface Window {
    editUser: (id: string) => void;
    deleteUser: (id: string) => void;
    submitUserForm: (event: Event, id: string | null) => Promise<void>;
    editProduct: (id: string) => void;
    deleteProduct: (id: string) => void;
    submitProductForm: (event: Event, id: string | null) => Promise<void>;
    editTable: (id: string) => void;
    deleteTable: (id: string) => void;
    submitTableForm: (event: Event, id: string | null) => Promise<void>;
    viewOrder: (id: string) => void;
    editCategory: (id: string) => void;
    deleteCategory: (id: string) => void;
    submitCategoryForm: (event: Event, id: string | null) => Promise<void>;
    closeModal: () => void;
  }
}

// ========================================
// CONFIGURATION
// ========================================
const API_BASE = window.location.origin;
const API_PREFIX = '/api';

// ========================================
// STATE MANAGEMENT
// ========================================
let currentSection = 'dashboard';
let categories: Category[] = [];
let users: User[] = [];
let products: Product[] = [];
let tables: Table[] = [];
let orders: Order[] = [];

// ========================================
// DOM ELEMENTS
// ========================================
// Elements are fetched dynamically where possible to avoid null checks on init if elements are missing from partial views,
// but for the main shell, we can fetch them.
const sidebar = document.getElementById('sidebar');
const menuBtn = document.getElementById('menuBtn');
const modal = document.getElementById('formModal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const closeModalBtn = document.getElementById('closeModal');
const logoutBtn = document.getElementById('logoutBtn');
const darkModeToggle = document.getElementById('darkModeToggle');

// ========================================
// DARK MODE
// ========================================
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

// ========================================
// API HELPERS
// ========================================
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE}${API_PREFIX}${endpoint}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = '/pages/landingPage.html';
        return {} as T; // Unreachable due to redirect
      }
      const error = await response.json();
      throw new Error(error.message || 'Erro na requisição');
    }

    return await response.json();
  } catch (error: any) {
    console.error('API Error:', error);
    showToast(error.message, 'error');
    throw error;
  }
}

// ========================================
// TOAST NOTIFICATIONS
// ========================================
function showToast(
  message: string,
  type: 'info' | 'success' | 'error' = 'info',
) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  const toastMessage = toast.querySelector('.toast-message');
  const toastIcon = toast.querySelector('.toast-icon');

  toast.className = `toast ${type} active`;
  if (toastMessage) toastMessage.textContent = message;

  if (toastIcon) {
    if (type === 'success') {
      toastIcon.textContent = 'check_circle';
    } else if (type === 'error') {
      toastIcon.textContent = 'error';
    } else {
      toastIcon.textContent = 'info';
    }
  }

  setTimeout(() => {
    toast.classList.remove('active');
  }, 4000);
}

// ========================================
// NAVIGATION
// ========================================
function switchSection(sectionName: string) {
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.content-section');

  // Update navigation
  navItems.forEach((item) => {
    if ((item as HTMLElement).dataset.section === sectionName) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Update sections
  sections.forEach((section) => {
    if (section.id === `${sectionName}-section`) {
      section.classList.add('active');
    } else {
      section.classList.remove('active');
    }
  });

  currentSection = sectionName;

  // Load section data
  loadSectionData(sectionName);

  // Close sidebar on mobile
  if (window.innerWidth <= 1024 && sidebar) {
    sidebar.classList.remove('active');
  }
}

function loadSectionData(sectionName: string) {
  switch (sectionName) {
    case 'dashboard':
      loadDashboard();
      break;
    case 'users':
      loadUsers();
      break;
    case 'products':
      loadProducts();
      break;
    case 'tables':
      loadTables();
      break;
    case 'orders':
      loadOrders();
      break;
    case 'categories':
      loadCategories();
      break;
  }
}

// ========================================
// DASHBOARD
// ========================================
async function loadDashboard() {
  try {
    // Load metrics in parallel
    const [usersData, productsData, tablesData, ordersData] = await Promise.all(
      [
        apiCall<ApiResponse<User[]>>('/users'),
        apiCall<ApiResponse<Product[]>>('/products'),
        apiCall<ApiResponse<Table[]>>('/tables'),
        apiCall<ApiResponse<Order[]>>('/orders'),
      ],
    );

    // Update metrics
    const totalUsersEl = document.getElementById('totalUsers');
    if (totalUsersEl)
      totalUsersEl.textContent = (usersData.data?.length || 0).toString();

    const totalProductsEl = document.getElementById('totalProducts');
    if (totalProductsEl)
      totalProductsEl.textContent = (productsData.data?.length || 0).toString();

    const totalTablesEl = document.getElementById('totalTables');
    if (totalTablesEl)
      totalTablesEl.textContent = (tablesData.data?.length || 0).toString();

    const openOrders =
      ordersData.data?.filter((o) => o.status === 'OPEN') || [];
    const totalOrdersEl = document.getElementById('totalOrders');
    if (totalOrdersEl) totalOrdersEl.textContent = openOrders.length.toString();

    // Tables by status
    const allTables = tablesData.data || [];
    const availableTables = allTables.filter(
      (t) => t.status === 'AVAILABLE',
    ).length;
    const occupiedTables = allTables.filter(
      (t) => t.status === 'OCCUPIED',
    ).length;
    const reservedTables = allTables.filter(
      (t) => t.status === 'RESERVED',
    ).length;

    const availableTablesEl = document.getElementById('availableTables');
    if (availableTablesEl)
      availableTablesEl.textContent = availableTables.toString();

    const occupiedTablesEl = document.getElementById('occupiedTables');
    if (occupiedTablesEl)
      occupiedTablesEl.textContent = occupiedTables.toString();

    const reservedTablesEl = document.getElementById('reservedTables');
    if (reservedTablesEl)
      reservedTablesEl.textContent = reservedTables.toString();

    // Recent orders
    renderRecentOrders(ordersData.data || []);
  } catch (error) {
    console.error('Error loading dashboard:', error);
  }
}

function renderRecentOrders(ordersData: Order[]) {
  const container = document.getElementById('recentOrders');
  if (!container) return;

  const recentOrders = ordersData.slice(0, 5);

  if (recentOrders.length === 0) {
    container.innerHTML =
      '<p class="loading-text">Nenhum pedido encontrado</p>';
    return;
  }

  container.innerHTML = recentOrders
    .map(
      (order) => `
      <div class="recent-item">
        <div class="recent-item-header">
          <span class="recent-item-id">Pedido #${order.id.substring(0, 8)}</span>
          <span class="recent-item-status">${order.status}</span>
        </div>
        <div class="recent-item-info">
          Mesa: ${order.table_id} | Total: R$ ${order.total?.toFixed(2) || '0.00'}
        </div>
      </div>
    `,
    )
    .join('');
}

// ========================================
// USERS MANAGEMENT
// ========================================
async function loadUsers() {
  try {
    const response = await apiCall<ApiResponse<User[]>>('/users');
    users = response.data || [];
    renderUsers(users);
  } catch (error) {
    console.error('Error loading users:', error);
  }
}

function renderUsers(usersData: User[]) {
  const tbody = document.getElementById('usersTableBody');
  if (!tbody) return;

  if (usersData.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="5" class="loading-cell">Nenhum usuário encontrado</td></tr>';
    return;
  }

  tbody.innerHTML = usersData
    .map(
      (user) => `
      <tr>
        <td>${user.name}</td>
        <td>${user.username}</td>
        <td><span class="role-badge ${user.role.toLowerCase()}">${user.role}</span></td>
        <td>${user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : '-'}</td>
        <td>
          <div class="action-btns">
            <button class="btn-icon" onclick="editUser('${user.id}')" title="Editar">
              <span class="material-symbols-outlined">edit</span>
            </button>
            <button class="btn-icon btn-danger" onclick="deleteUser('${user.id}')" title="Deletar">
              <span class="material-symbols-outlined">delete</span>
            </button>
          </div>
        </td>
      </tr>
    `,
    )
    .join('');
}

function showUserForm(userId: string | null = null) {
  const user = userId ? users.find((u) => u.id === userId) : null;
  const isEdit = !!userId;

  if (modalTitle)
    modalTitle.textContent = isEdit ? 'Editar Usuário' : 'Novo Usuário';
  if (modalBody) {
    modalBody.innerHTML = `
    <form id="userForm" onsubmit="submitUserForm(event, ${isEdit ? `'${userId}'` : 'null'})">
      <div class="form-group">
        <label class="form-label">Nome</label>
        <input type="text" class="form-input" name="name" value="${user?.name || ''}" required>
      </div>
      <div class="form-group">
        <label class="form-label">Username</label>
        <input type="text" class="form-input" name="username" value="${user?.username || ''}" required>
      </div>
      ${
        !isEdit
          ? `
      <div class="form-group">
        <label class="form-label">Senha</label>
        <input type="password" class="form-input" name="password" required>
      </div>
      `
          : ''
      }
      <div class="form-group">
        <label class="form-label">Função</label>
        <select class="form-select" name="role" required>
          <option value="admin" ${user?.role === 'admin' ? 'selected' : ''}>Admin</option>
          <option value="manager" ${user?.role === 'manager' ? 'selected' : ''}>Manager</option>
          <option value="waiter" ${user?.role === 'waiter' ? 'selected' : ''}>Waiter</option>
        </select>
      </div>
      <div class="form-actions">
        <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn-primary">${isEdit ? 'Atualizar' : 'Criar'}</button>
      </div>
    </form>
  `;
  }

  modal?.classList.add('active');
}

async function submitUserForm(event: Event, userId: string | null) {
  event.preventDefault();
  const formData = new FormData(event.target as HTMLFormElement);
  const data: any = {};
  formData.forEach((value, key) => (data[key] = value));

  try {
    if (userId) {
      await apiCall(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      showToast('Usuário atualizado com sucesso', 'success');
    } else {
      await apiCall('/users', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      showToast('Usuário criado com sucesso', 'success');
    }

    closeModal();
    loadUsers();
  } catch (error) {
    console.error('Error submitting user:', error);
  }
}

async function deleteUser(userId: string) {
  if (!confirm('Tem certeza que deseja deletar este usuário?')) return;

  try {
    await apiCall(`/users/${userId}`, { method: 'DELETE' });
    showToast('Usuário deletado com sucesso', 'success');
    loadUsers();
  } catch (error) {
    console.error('Error deleting user:', error);
  }
}

// ========================================
// PRODUCTS MANAGEMENT
// ========================================
async function loadProducts() {
  try {
    const [productsRes, categoriesRes] = await Promise.all([
      apiCall<ApiResponse<Product[]>>('/products'),
      apiCall<ApiResponse<Category[]>>('/categories'),
    ]);

    products = productsRes.data || [];
    categories = categoriesRes.data || [];

    // Populate category filter
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
      categoryFilter.innerHTML =
        '<option value="">Todas Categorias</option>' +
        categories
          .map((cat) => `<option value="${cat.id}">${cat.name}</option>`)
          .join('');
    }

    renderProducts(products);
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

function renderProducts(productsData: Product[]) {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  if (productsData.length === 0) {
    grid.innerHTML = '<p class="loading-text">Nenhum produto encontrado</p>';
    return;
  }

  grid.innerHTML = productsData
    .map((product) => {
      const category = categories.find((c) => c.id === product.category_id);
      return `
      <div class="product-card">
        <div class="product-header">
          <div>
            <div class="product-title">${product.name}</div>
            <div class="product-category">${category?.name || 'Sem categoria'}</div>
          </div>
          <span class="active-badge ${userIsActive(product) ? 'active' : 'inactive'}">
            ${userIsActive(product) ? 'Ativo' : 'Inativo'}
          </span>
        </div>
        <p class="product-description">${product.description || 'Sem descrição'}</p>
        <div class="product-footer">
          <span class="product-price">R$ ${product.price.toFixed(2)}</span>
           <div class="product-actions">
            <button class="btn-icon" onclick="editProduct('${product.id}')" title="Editar">
              <span class="material-symbols-outlined">edit</span>
            </button>
            <button class="btn-icon btn-danger" onclick="deleteProduct('${product.id}')" title="Deletar">
              <span class="material-symbols-outlined">delete</span>
            </button>
          </div>
        </div>
      </div>
    `;
    })
    .join('');
}

function userIsActive(product: Product): boolean {
  // Helper to handle 1/0 or true/false API responses for boolean fields
  return product.is_active === 1 || product.is_active === true;
}

function showProductForm(productId: string | null = null) {
  const product = productId ? products.find((p) => p.id === productId) : null;
  const isEdit = !!productId;

  if (modalTitle)
    modalTitle.textContent = isEdit ? 'Editar Produto' : 'Novo Produto';
  if (modalBody) {
    modalBody.innerHTML = `
    <form id="productForm" onsubmit="submitProductForm(event, ${isEdit ? `'${productId}'` : 'null'})">
      <div class="form-group">
        <label class="form-label">Nome</label>
        <input type="text" class="form-input" name="name" value="${product?.name || ''}" required>
      </div>
      <div class="form-group">
        <label class="form-label">Categoria</label>
        <select class="form-select" name="category_id" required>
          <option value="">Selecione...</option>
          ${categories
            .map(
              (cat) => `
            <option value="${cat.id}" ${product?.category_id === cat.id ? 'selected' : ''}>
              ${cat.name}
            </option>
          `,
            )
            .join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Descrição</label>
        <textarea class="form-textarea" name="description">${product?.description || ''}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Preço (R$)</label>
        <input type="number" step="0.01" class="form-input" name="price" value="${product?.price || ''}" required>
      </div>
      <div class="form-group">
        <label class="form-label">Status</label>
        <select class="form-select" name="is_active">
          <option value="1" ${userIsActive(product || ({ is_active: 1 } as Product)) ? 'selected' : ''}>Ativo</option>
          <option value="0" ${!userIsActive(product || ({ is_active: 1 } as Product)) ? 'selected' : ''}>Inativo</option>
        </select>
      </div>
      <div class="form-actions">
        <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn-primary">${isEdit ? 'Atualizar' : 'Criar'}</button>
      </div>
    </form>
  `;
  }

  modal?.classList.add('active');
}

async function submitProductForm(event: Event, productId: string | null) {
  event.preventDefault();
  const formData = new FormData(event.target as HTMLFormElement);
  const data: any = {};
  formData.forEach((value, key) => (data[key] = value));
  data.price = parseFloat(data.price);
  data.is_active = parseInt(data.is_active);

  try {
    if (productId) {
      await apiCall(`/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      showToast('Produto atualizado com sucesso', 'success');
    } else {
      await apiCall('/products', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      showToast('Produto criado com sucesso', 'success');
    }

    closeModal();
    loadProducts();
  } catch (error) {
    console.error('Error submitting product:', error);
  }
}

async function deleteProduct(productId: string) {
  if (!confirm('Tem certeza que deseja deletar este produto?')) return;

  try {
    await apiCall(`/products/${productId}`, { method: 'DELETE' });
    showToast('Produto deletado com sucesso', 'success');
    loadProducts();
  } catch (error) {
    console.error('Error deleting product:', error);
  }
}

// ========================================
// TABLES MANAGEMENT
// ========================================
async function loadTables() {
  try {
    const response = await apiCall<ApiResponse<Table[]>>('/tables');
    tables = response.data || [];
    renderTables(tables);
  } catch (error) {
    console.error('Error loading tables:', error);
  }
}

function renderTables(tablesData: Table[]) {
  const grid = document.getElementById('tablesGrid');
  if (!grid) return;

  if (tablesData.length === 0) {
    grid.innerHTML = '<p class="loading-text">Nenhuma mesa encontrada</p>';
    return;
  }

  grid.innerHTML = tablesData
    .map(
      (table) => `
      <div class="table-card-grid">
        <div class="table-number-display">${table.number}</div>
        <div class="table-status-display ${table.status}">${translateStatus(table.status)}</div>
        <div class="product-actions" style="justify-content: center;">
          <button class="btn-icon" onclick="editTable('${table.id}')" title="Editar">
            <span class="material-symbols-outlined">edit</span>
          </button>
          <button class="btn-icon btn-danger" onclick="deleteTable('${table.id}')" title="Deletar">
            <span class="material-symbols-outlined">delete</span>
          </button>
        </div>
      </div>
    `,
    )
    .join('');
}

function translateStatus(status: string) {
  const translations: { [key: string]: string } = {
    AVAILABLE: 'Disponível',
    OCCUPIED: 'Ocupada',
    RESERVED: 'Reservada',
    OPEN: 'Aberto',
    CLOSED: 'Fechado',
    CANCELLED: 'Cancelado',
  };
  return translations[status] || status;
}

function showTableForm(tableId: string | null = null) {
  const table = tableId ? tables.find((t) => t.id === tableId) : null;
  const isEdit = !!tableId;

  if (modalTitle) modalTitle.textContent = isEdit ? 'Editar Mesa' : 'Nova Mesa';
  if (modalBody) {
    modalBody.innerHTML = `
    <form id="tableForm" onsubmit="submitTableForm(event, ${isEdit ? `'${tableId}'` : 'null'})">
      <div class="form-group">
        <label class="form-label">Número da Mesa</label>
        <input type="number" class="form-input" name="number" value="${table?.number || ''}" required min="1">
      </div>
      <div class="form-group">
        <label class="form-label">Status</label>
        <select class="form-select" name="status" required>
          <option value="AVAILABLE" ${table?.status === 'AVAILABLE' ? 'selected' : ''}>Disponível</option>
          <option value="OCCUPIED" ${table?.status === 'OCCUPIED' ? 'selected' : ''}>Ocupada</option>
          <option value="RESERVED" ${table?.status === 'RESERVED' ? 'selected' : ''}>Reservada</option>
        </select>
      </div>
      <div class="form-actions">
        <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn-primary">${isEdit ? 'Atualizar' : 'Criar'}</button>
      </div>
    </form>
  `;
  }

  modal?.classList.add('active');
}

async function submitTableForm(event: Event, tableId: string | null) {
  event.preventDefault();
  const formData = new FormData(event.target as HTMLFormElement);
  const data: any = {};
  formData.forEach((value, key) => (data[key] = value));
  data.number = parseInt(data.number);

  try {
    if (tableId) {
      await apiCall(`/tables/${tableId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      showToast('Mesa atualizada com sucesso', 'success');
    } else {
      await apiCall('/tables', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      showToast('Mesa criada com sucesso', 'success');
    }

    closeModal();
    loadTables();
  } catch (error) {
    console.error('Error submitting table:', error);
  }
}

async function deleteTable(tableId: string) {
  if (!confirm('Tem certeza que deseja deletar esta mesa?')) return;

  try {
    await apiCall(`/tables/${tableId}`, { method: 'DELETE' });
    showToast('Mesa deletada com sucesso', 'success');
    loadTables();
  } catch (error) {
    console.error('Error deleting table:', error);
  }
}

// ========================================
// ORDERS MANAGEMENT
// ========================================
async function loadOrders() {
  try {
    const response = await apiCall<ApiResponse<Order[]>>('/orders');
    orders = response.data || [];
    renderOrders(orders);
  } catch (error) {
    console.error('Error loading orders:', error);
  }
}

function renderOrders(ordersData: Order[]) {
  const tbody = document.getElementById('ordersTableBody');
  if (!tbody) return;

  if (ordersData.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="6" class="loading-cell">Nenhum pedido encontrado</td></tr>';
    return;
  }

  tbody.innerHTML = ordersData
    .map(
      (order) => `
      <tr>
        <td>#${order.id.substring(0, 8)}</td>
        <td>Mesa ${order.table_id}</td>
        <td><span class="status-pill ${order.status.toLowerCase()}">${order.status}</span></td>
        <td>R$ ${order.total?.toFixed(2) || '0.00'}</td>
        <td>${order.created_at ? new Date(order.created_at).toLocaleDateString('pt-BR') : '-'}</td>
        <td>
          <div class="action-btns">
            <button class="btn-icon" onclick="viewOrder('${order.id}')" title="Visualizar">
              <span class="material-symbols-outlined">visibility</span>
            </button>
          </div>
        </td>
      </tr>
    `,
    )
    .join('');
}

async function viewOrder(orderId: string) {
  try {
    const response = await apiCall<ApiResponse<Order>>(`/orders/${orderId}`);
    const order = response.data;

    if (modalTitle)
      modalTitle.textContent = `Pedido #${orderId.substring(0, 8)}`;
    if (modalBody) {
      modalBody.innerHTML = `
      <div style="margin-bottom: 20px;">
        <p><strong>Mesa:</strong> ${order.table_id}</p>
        <p><strong>Status:</strong> <span class="status-pill ${order.status.toLowerCase()}">${order.status}</span></p>
        <p><strong>Total:</strong> R$ ${order.total?.toFixed(2) || '0.00'}</p>
        <p><strong>Data:</strong> ${order.created_at ? new Date(order.created_at).toLocaleString('pt-BR') : '-'}</p>
      </div>
      <div class="form-actions">
        <button type="button" class="btn-secondary" onclick="closeModal()">Fechar</button>
      </div>
    `;
    }

    modal?.classList.add('active');
  } catch (error) {
    console.error('Error viewing order:', error);
  }
}

// ========================================
// CATEGORIES MANAGEMENT
// ========================================
async function loadCategories() {
  try {
    const response = await apiCall<ApiResponse<Category[]>>('/categories');
    categories = response.data || [];
    renderCategories(categories);
  } catch (error) {
    console.error('Error loading categories:', error);
  }
}

function renderCategories(categoriesData: Category[]) {
  const grid = document.getElementById('categoriesGrid');
  if (!grid) return;

  if (categoriesData.length === 0) {
    grid.innerHTML = '<p class="loading-text">Nenhuma categoria encontrada</p>';
    return;
  }

  grid.innerHTML = categoriesData
    .map(
      (category) => `
      <div class="category-card">
        <div class="product-header">
          <div>
            <div class="product-title">${category.name}</div>
            <div class="product-category">${category.slug}</div>
          </div>
        </div>
        <div class="product-footer" style="margin-top: 20px;">
          <div></div>
          <div class="product-actions">
            <button class="btn-icon" onclick="editCategory('${category.id}')" title="Editar">
              <span class="material-symbols-outlined">edit</span>
            </button>
            <button class="btn-icon btn-danger" onclick="deleteCategory('${category.id}')" title="Deletar">
              <span class="material-symbols-outlined">delete</span>
            </button>
          </div>
        </div>
      </div>
    `,
    )
    .join('');
}

function showCategoryForm(categoryId: string | null = null) {
  const category = categoryId
    ? categories.find((c) => c.id === categoryId)
    : null;
  const isEdit = !!categoryId;

  if (modalTitle)
    modalTitle.textContent = isEdit ? 'Editar Categoria' : 'Nova Categoria';
  if (modalBody) {
    modalBody.innerHTML = `
    <form id="categoryForm" onsubmit="submitCategoryForm(event, ${isEdit ? `'${categoryId}'` : 'null'})">
      <div class="form-group">
        <label class="form-label">Nome</label>
        <input type="text" class="form-input" name="name" value="${category?.name || ''}" required>
      </div>
      <div class="form-group">
        <label class="form-label">Slug</label>
        <input type="text" class="form-input" name="slug" value="${category?.slug || ''}" required>
      </div>
      <div class="form-actions">
        <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn-primary">${isEdit ? 'Atualizar' : 'Criar'}</button>
      </div>
    </form>
  `;
  }

  modal?.classList.add('active');
}

async function submitCategoryForm(event: Event, categoryId: string | null) {
  event.preventDefault();
  const formData = new FormData(event.target as HTMLFormElement);
  const data: any = {};
  formData.forEach((value, key) => (data[key] = value));

  try {
    if (categoryId) {
      await apiCall(`/categories/${categoryId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      showToast('Categoria atualizada com sucesso', 'success');
    } else {
      await apiCall('/categories', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      showToast('Categoria criada com sucesso', 'success');
    }

    closeModal();
    loadCategories();
  } catch (error) {
    console.error('Error submitting category:', error);
  }
}

async function deleteCategory(categoryId: string) {
  if (!confirm('Tem certeza que deseja deletar esta categoria?')) return;

  try {
    await apiCall(`/categories/${categoryId}`, { method: 'DELETE' });
    showToast('Categoria deletada com sucesso', 'success');
    loadCategories();
  } catch (error) {
    console.error('Error deleting category:', error);
  }
}

// ========================================
// MODAL CONTROL
// ========================================
function closeModal() {
  modal?.classList.remove('active');
}

// ========================================
// GLOBAL BINDINGS
// ========================================
window.editUser = showUserForm;
window.deleteUser = deleteUser;
window.submitUserForm = submitUserForm;
window.editProduct = showProductForm;
window.deleteProduct = deleteProduct;
window.submitProductForm = submitProductForm;
window.editTable = showTableForm;
window.deleteTable = deleteTable;
window.submitTableForm = submitTableForm;
window.viewOrder = viewOrder;
window.editCategory = showCategoryForm;
window.deleteCategory = deleteCategory;
window.submitCategoryForm = submitCategoryForm;
window.closeModal = closeModal;

// ========================================
// SEARCH & FILTERS
// ========================================

function applyProductFilters() {
  const searchInput = document.getElementById(
    'searchProducts',
  ) as HTMLInputElement;
  const categoryInput = document.getElementById(
    'categoryFilter',
  ) as HTMLSelectElement;
  const statusInput = document.getElementById(
    'statusFilter',
  ) as HTMLSelectElement;

  const searchQuery = searchInput?.value.toLowerCase() || '';
  const categoryId = categoryInput?.value || '';
  const status = statusInput?.value || '';

  let filtered = [...products];

  if (searchQuery) {
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery) ||
        p.description?.toLowerCase().includes(searchQuery),
    );
  }

  if (categoryId) {
    filtered = filtered.filter((p) => p.category_id === categoryId);
  }

  if (status !== '') {
    const isActive = parseInt(status);
    filtered = filtered.filter((p) => {
      // Safe integer conversion handled by userIsActive logic if needed,
      // but here we are comparing against 0 or 1 from the filter.
      // Ensure product.is_active is normalized.
      const productStatus = userIsActive(p) ? 1 : 0;
      return productStatus === isActive;
    });
  }

  renderProducts(filtered);
}

// ========================================
// INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', () => {
  initDarkMode();

  // Event Listeners
  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('active');
    });
  }

  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      const section = (item as HTMLElement).dataset.section;
      if (section) switchSection(section);
    });
  });

  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  document
    .getElementById('addUserBtn')
    ?.addEventListener('click', () => showUserForm());
  document
    .getElementById('addProductBtn')
    ?.addEventListener('click', () => showProductForm());
  document
    .getElementById('addTableBtn')
    ?.addEventListener('click', () => showTableForm());
  document
    .getElementById('addCategoryBtn')
    ?.addEventListener('click', () => showCategoryForm());

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await apiCall('/auth/logout', { method: 'POST' });
        window.location.href = '/pages/landingPage.html';
      } catch (error) {
        console.error('Logout error:', error);
      }
    });
  }

  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', toggleDarkMode);
  }

  // Filter Listeners
  document.getElementById('searchUsers')?.addEventListener('input', (e) => {
    const query = (e.target as HTMLInputElement).value.toLowerCase();
    const filtered = users.filter(
      (u) =>
        u.name.toLowerCase().includes(query) ||
        u.username.toLowerCase().includes(query),
    );
    renderUsers(filtered);
  });

  document
    .getElementById('searchProducts')
    ?.addEventListener('input', applyProductFilters);
  document
    .getElementById('categoryFilter')
    ?.addEventListener('change', applyProductFilters);
  document
    .getElementById('statusFilter')
    ?.addEventListener('change', applyProductFilters);

  document
    .getElementById('tableStatusFilter')
    ?.addEventListener('change', (e) => {
      const status = (e.target as HTMLInputElement).value;
      const filtered = status
        ? tables.filter((t) => t.status === status)
        : tables;
      renderTables(filtered);
    });

  document
    .getElementById('orderStatusFilter')
    ?.addEventListener('change', (e) => {
      const status = (e.target as HTMLInputElement).value;
      const filtered = status
        ? orders.filter((o) => o.status === status)
        : orders;
      renderOrders(filtered);
    });

  // Load initial data
  loadDashboard();
});
