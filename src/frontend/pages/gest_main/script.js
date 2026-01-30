require ('./style.css');
// ========================================
// CONFIGURATION
// ========================================
const API_BASE = window.location.origin;
const API_PREFIX = '/api';

// ========================================
// STATE MANAGEMENT
// ========================================
let currentSection = 'dashboard';
let categories = [];
let users = [];
let products = [];
let tables = [];
let orders = [];

// ========================================
// DOM ELEMENTS
// ========================================
const sidebar = document.getElementById('sidebar');
const menuBtn = document.getElementById('menuBtn');
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.content-section');
const modal = document.getElementById('formModal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const closeModalBtn = document.getElementById('closeModal');
const logoutBtn = document.getElementById('logoutBtn');
const darkModeToggle = document.getElementById("darkModeToggle");

// ========================================
// DARK MODE
// ========================================
/**
 * Initialize dark mode
 * Checks localStorage and system preferences
 * Must be called first on page load
 */
function initDarkMode() {
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
    document.body.classList.add("dark-mode");
    updateDarkModeIcon(true);
  } else {
    updateDarkModeIcon(false);
  }
}

/**
 * Toggle dark mode on/off
 */
function toggleDarkMode() {
  const isDark = document.body.classList.toggle("dark-mode");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  updateDarkModeIcon(isDark);
}

/**
 * Update dark mode toggle icon
 * @param {boolean} isDark - Whether dark mode is active
 */
function updateDarkModeIcon(isDark) {
  const icon = darkModeToggle?.querySelector(".material-symbols-outlined");
  if (icon) {
    icon.textContent = isDark ? "dark_mode" : "light_mode";
  }
}

// ========================================
// API HELPERS
// ========================================
async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${API_PREFIX}${endpoint}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = "/login.html";
        return null;
      }
      const error = await response.json();
      throw new Error(error.message || "Erro na requisição");
    }

    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    showToast(error.message, "error");
    throw error;
  }
}

// ========================================
// TOAST NOTIFICATIONS
// ========================================
function showToast(message, type = "info") {
  const toast = document.getElementById("toast");
  const toastMessage = toast.querySelector(".toast-message");
  const toastIcon = toast.querySelector(".toast-icon");

  toast.className = `toast ${type} active`;
  toastMessage.textContent = message;

  if (type === "success") {
    toastIcon.textContent = "check_circle";
  } else if (type === "error") {
    toastIcon.textContent = "error";
  } else {
    toastIcon.textContent = "info";
  }

  setTimeout(() => {
    toast.classList.remove("active");
  }, 4000);
}

// ========================================
// NAVIGATION
// ========================================
function switchSection(sectionName) {
  // Update navigation
  navItems.forEach((item) => {
    if (item.dataset.section === sectionName) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  // Update sections
  sections.forEach((section) => {
    if (section.id === `${sectionName}-section`) {
      section.classList.add("active");
    } else {
      section.classList.remove("active");
    }
  });

  currentSection = sectionName;

  // Load section data
  loadSectionData(sectionName);

  // Close sidebar on mobile
  if (window.innerWidth <= 1024) {
    sidebar.classList.remove("active");
  }
}

function loadSectionData(sectionName) {
  switch (sectionName) {
    case "dashboard":
      loadDashboard();
      break;
    case "users":
      loadUsers();
      break;
    case "products":
      loadProducts();
      break;
    case "tables":
      loadTables();
      break;
    case "orders":
      loadOrders();
      break;
    case "categories":
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
        apiCall("/users"),
        apiCall("/products"),
        apiCall("/tables"),
        apiCall("/orders"),
      ],
    );

    // Update metrics
    document.getElementById("totalUsers").textContent =
      usersData.data?.length || 0;
    document.getElementById("totalProducts").textContent =
      productsData.data?.length || 0;
    document.getElementById("totalTables").textContent =
      tablesData.data?.length || 0;

    const openOrders =
      ordersData.data?.filter((o) => o.status === "OPEN") || [];
    document.getElementById("totalOrders").textContent = openOrders.length;

    // Tables by status
    const allTables = tablesData.data || [];
    const availableTables = allTables.filter(
      (t) => t.status === "AVAILABLE",
    ).length;
    const occupiedTables = allTables.filter(
      (t) => t.status === "OCCUPIED",
    ).length;
    const reservedTables = allTables.filter(
      (t) => t.status === "RESERVED",
    ).length;

    document.getElementById("availableTables").textContent = availableTables;
    document.getElementById("occupiedTables").textContent = occupiedTables;
    document.getElementById("reservedTables").textContent = reservedTables;

    // Recent orders
    renderRecentOrders(ordersData.data || []);
  } catch (error) {
    console.error("Error loading dashboard:", error);
  }
}

function renderRecentOrders(ordersData) {
  const container = document.getElementById("recentOrders");
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
          Mesa: ${order.table_id} | Total: R$ ${order.total?.toFixed(2) || "0.00"}
        </div>
      </div>
    `,
    )
    .join("");
}

// ========================================
// USERS MANAGEMENT
// ========================================
async function loadUsers() {
  try {
    const response = await apiCall("/users");
    users = response.data || [];
    renderUsers(users);
  } catch (error) {
    console.error("Error loading users:", error);
  }
}

function renderUsers(usersData) {
  const tbody = document.getElementById("usersTableBody");

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
        <td>${user.created_at ? new Date(user.created_at).toLocaleDateString("pt-BR") : "-"}</td>
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
    .join("");
}

function showUserForm(userId = null) {
  const user = userId ? users.find((u) => u.id === userId) : null;
  const isEdit = !!userId;

  modalTitle.textContent = isEdit ? "Editar Usuário" : "Novo Usuário";
  modalBody.innerHTML = `
    <form id="userForm" onsubmit="submitUserForm(event, ${isEdit ? `'${userId}'` : "null"})">
      <div class="form-group">
        <label class="form-label">Nome</label>
        <input type="text" class="form-input" name="name" value="${user?.name || ""}" required>
      </div>
      <div class="form-group">
        <label class="form-label">Username</label>
        <input type="text" class="form-input" name="username" value="${user?.username || ""}" required>
      </div>
      ${
        !isEdit
          ? `
      <div class="form-group">
        <label class="form-label">Senha</label>
        <input type="password" class="form-input" name="password" required>
      </div>
      `
          : ""
      }
      <div class="form-group">
        <label class="form-label">Função</label>
        <select class="form-select" name="role" required>
          <option value="admin" ${user?.role === "admin" ? "selected" : ""}>Admin</option>
          <option value="manager" ${user?.role === "manager" ? "selected" : ""}>Manager</option>
          <option value="waiter" ${user?.role === "waiter" ? "selected" : ""}>Waiter</option>
        </select>
      </div>
      <div class="form-actions">
        <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn-primary">${isEdit ? "Atualizar" : "Criar"}</button>
      </div>
    </form>
  `;

  modal.classList.add("active");
}

async function submitUserForm(event, userId) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData);

  try {
    if (userId) {
      await apiCall(`/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      showToast("Usuário atualizado com sucesso", "success");
    } else {
      await apiCall("/users", {
        method: "POST",
        body: JSON.stringify(data),
      });
      showToast("Usuário criado com sucesso", "success");
    }

    closeModal();
    loadUsers();
  } catch (error) {
    console.error("Error submitting user:", error);
  }
}

async function deleteUser(userId) {
  if (!confirm("Tem certeza que deseja deletar este usuário?")) return;

  try {
    await apiCall(`/users/${userId}`, { method: "DELETE" });
    showToast("Usuário deletado com sucesso", "success");
    loadUsers();
  } catch (error) {
    console.error("Error deleting user:", error);
  }
}

window.editUser = showUserForm;
window.deleteUser = deleteUser;
window.submitUserForm = submitUserForm;

// ========================================
// PRODUCTS MANAGEMENT
// ========================================
async function loadProducts() {
  try {
    const [productsRes, categoriesRes] = await Promise.all([
      apiCall("/products"),
      apiCall("/categories"),
    ]);

    products = productsRes.data || [];
    categories = categoriesRes.data || [];

    // Populate category filter
    const categoryFilter = document.getElementById("categoryFilter");
    categoryFilter.innerHTML =
      '<option value="">Todas Categorias</option>' +
      categories
        .map((cat) => `<option value="${cat.id}">${cat.name}</option>`)
        .join("");

    renderProducts(products);
  } catch (error) {
    console.error("Error loading products:", error);
  }
}

function renderProducts(productsData) {
  const grid = document.getElementById("productsGrid");

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
            <div class="product-category">${category?.name || "Sem categoria"}</div>
          </div>
          <span class="active-badge ${product.is_active ? "active" : "inactive"}">
            ${product.is_active ? "Ativo" : "Inativo"}
          </span>
        </div>
        <p class="product-description">${product.description || "Sem descrição"}</p>
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
    .join("");
}

function showProductForm(productId = null) {
  const product = productId ? products.find((p) => p.id === productId) : null;
  const isEdit = !!productId;

  modalTitle.textContent = isEdit ? "Editar Produto" : "Novo Produto";
  modalBody.innerHTML = `
    <form id="productForm" onsubmit="submitProductForm(event, ${isEdit ? `'${productId}'` : "null"})">
      <div class="form-group">
        <label class="form-label">Nome</label>
        <input type="text" class="form-input" name="name" value="${product?.name || ""}" required>
      </div>
      <div class="form-group">
        <label class="form-label">Categoria</label>
        <select class="form-select" name="category_id" required>
          <option value="">Selecione...</option>
          ${categories
            .map(
              (cat) => `
            <option value="${cat.id}" ${product?.category_id === cat.id ? "selected" : ""}>
              ${cat.name}
            </option>
          `,
            )
            .join("")}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Descrição</label>
        <textarea class="form-textarea" name="description">${product?.description || ""}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Preço (R$)</label>
        <input type="number" step="0.01" class="form-input" name="price" value="${product?.price || ""}" required>
      </div>
      <div class="form-group">
        <label class="form-label">Status</label>
        <select class="form-select" name="is_active">
          <option value="1" ${product?.is_active !== 0 ? "selected" : ""}>Ativo</option>
          <option value="0" ${product?.is_active === 0 ? "selected" : ""}>Inativo</option>
        </select>
      </div>
      <div class="form-actions">
        <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn-primary">${isEdit ? "Atualizar" : "Criar"}</button>
      </div>
    </form>
  `;

  modal.classList.add("active");
}

async function submitProductForm(event, productId) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData);
  data.price = parseFloat(data.price);
  data.is_active = parseInt(data.is_active);

  try {
    if (productId) {
      await apiCall(`/products/${productId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      showToast("Produto atualizado com sucesso", "success");
    } else {
      await apiCall("/products", {
        method: "POST",
        body: JSON.stringify(data),
      });
      showToast("Produto criado com sucesso", "success");
    }

    closeModal();
    loadProducts();
  } catch (error) {
    console.error("Error submitting product:", error);
  }
}

async function deleteProduct(productId) {
  if (!confirm("Tem certeza que deseja deletar este produto?")) return;

  try {
    await apiCall(`/products/${productId}`, { method: "DELETE" });
    showToast("Produto deletado com sucesso", "success");
    loadProducts();
  } catch (error) {
    console.error("Error deleting product:", error);
  }
}

window.editProduct = showProductForm;
window.deleteProduct = deleteProduct;
window.submitProductForm = submitProductForm;

// ========================================
// TABLES MANAGEMENT
// ========================================
async function loadTables() {
  try {
    const response = await apiCall("/tables");
    tables = response.data || [];
    renderTables(tables);
  } catch (error) {
    console.error("Error loading tables:", error);
  }
}

function renderTables(tablesData) {
  const grid = document.getElementById("tablesGrid");

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
    .join("");
}

function translateStatus(status) {
  const translations = {
    AVAILABLE: "Disponível",
    OCCUPIED: "Ocupada",
    RESERVED: "Reservada",
  };
  return translations[status] || status;
}

function showTableForm(tableId = null) {
  const table = tableId ? tables.find((t) => t.id === tableId) : null;
  const isEdit = !!tableId;

  modalTitle.textContent = isEdit ? "Editar Mesa" : "Nova Mesa";
  modalBody.innerHTML = `
    <form id="tableForm" onsubmit="submitTableForm(event, ${isEdit ? `'${tableId}'` : "null"})">
      <div class="form-group">
        <label class="form-label">Número da Mesa</label>
        <input type="number" class="form-input" name="number" value="${table?.number || ""}" required min="1">
      </div>
      <div class="form-group">
        <label class="form-label">Status</label>
        <select class="form-select" name="status" required>
          <option value="AVAILABLE" ${table?.status === "AVAILABLE" ? "selected" : ""}>Disponível</option>
          <option value="OCCUPIED" ${table?.status === "OCCUPIED" ? "selected" : ""}>Ocupada</option>
          <option value="RESERVED" ${table?.status === "RESERVED" ? "selected" : ""}>Reservada</option>
        </select>
      </div>
      <div class="form-actions">
        <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn-primary">${isEdit ? "Atualizar" : "Criar"}</button>
      </div>
    </form>
  `;

  modal.classList.add("active");
}

async function submitTableForm(event, tableId) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData);
  data.number = parseInt(data.number);

  try {
    if (tableId) {
      await apiCall(`/tables/${tableId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      showToast("Mesa atualizada com sucesso", "success");
    } else {
      await apiCall("/tables", {
        method: "POST",
        body: JSON.stringify(data),
      });
      showToast("Mesa criada com sucesso", "success");
    }

    closeModal();
    loadTables();
  } catch (error) {
    console.error("Error submitting table:", error);
  }
}

async function deleteTable(tableId) {
  if (!confirm("Tem certeza que deseja deletar esta mesa?")) return;

  try {
    await apiCall(`/tables/${tableId}`, { method: "DELETE" });
    showToast("Mesa deletada com sucesso", "success");
    loadTables();
  } catch (error) {
    console.error("Error deleting table:", error);
  }
}

window.editTable = showTableForm;
window.deleteTable = deleteTable;
window.submitTableForm = submitTableForm;

// ========================================
// ORDERS MANAGEMENT
// ========================================
async function loadOrders() {
  try {
    const response = await apiCall("/orders");
    orders = response.data || [];
    renderOrders(orders);
  } catch (error) {
    console.error("Error loading orders:", error);
  }
}

function renderOrders(ordersData) {
  const tbody = document.getElementById("ordersTableBody");

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
        <td>R$ ${order.total?.toFixed(2) || "0.00"}</td>
        <td>${order.created_at ? new Date(order.created_at).toLocaleDateString("pt-BR") : "-"}</td>
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
    .join("");
}

async function viewOrder(orderId) {
  try {
    const response = await apiCall(`/orders/${orderId}`);
    const order = response.data;

    modalTitle.textContent = `Pedido #${orderId.substring(0, 8)}`;
    modalBody.innerHTML = `
      <div style="margin-bottom: 20px;">
        <p><strong>Mesa:</strong> ${order.table_id}</p>
        <p><strong>Status:</strong> <span class="status-pill ${order.status.toLowerCase()}">${order.status}</span></p>
        <p><strong>Total:</strong> R$ ${order.total?.toFixed(2) || "0.00"}</p>
        <p><strong>Data:</strong> ${order.created_at ? new Date(order.created_at).toLocaleString("pt-BR") : "-"}</p>
      </div>
      <div class="form-actions">
        <button type="button" class="btn-secondary" onclick="closeModal()">Fechar</button>
      </div>
    `;

    modal.classList.add("active");
  } catch (error) {
    console.error("Error viewing order:", error);
  }
}

window.viewOrder = viewOrder;

// ========================================
// CATEGORIES MANAGEMENT
// ========================================
async function loadCategories() {
  try {
    const response = await apiCall("/categories");
    categories = response.data || [];
    renderCategories(categories);
  } catch (error) {
    console.error("Error loading categories:", error);
  }
}

function renderCategories(categoriesData) {
  const grid = document.getElementById("categoriesGrid");

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
    .join("");
}

function showCategoryForm(categoryId = null) {
  const category = categoryId
    ? categories.find((c) => c.id === categoryId)
    : null;
  const isEdit = !!categoryId;

  modalTitle.textContent = isEdit ? "Editar Categoria" : "Nova Categoria";
  modalBody.innerHTML = `
    <form id="categoryForm" onsubmit="submitCategoryForm(event, ${isEdit ? `'${categoryId}'` : "null"})">
      <div class="form-group">
        <label class="form-label">Nome</label>
        <input type="text" class="form-input" name="name" value="${category?.name || ""}" required>
      </div>
      <div class="form-group">
        <label class="form-label">Slug</label>
        <input type="text" class="form-input" name="slug" value="${category?.slug || ""}" required>
      </div>
      <div class="form-actions">
        <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn-primary">${isEdit ? "Atualizar" : "Criar"}</button>
      </div>
    </form>
  `;

  modal.classList.add("active");
}

async function submitCategoryForm(event, categoryId) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData);

  try {
    if (categoryId) {
      await apiCall(`/categories/${categoryId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      showToast("Categoria atualizada com sucesso", "success");
    } else {
      await apiCall("/categories", {
        method: "POST",
        body: JSON.stringify(data),
      });
      showToast("Categoria criada com sucesso", "success");
    }

    closeModal();
    loadCategories();
  } catch (error) {
    console.error("Error submitting category:", error);
  }
}

async function deleteCategory(categoryId) {
  if (!confirm("Tem certeza que deseja deletar esta categoria?")) return;

  try {
    await apiCall(`/categories/${categoryId}`, { method: "DELETE" });
    showToast("Categoria deletada com sucesso", "success");
    loadCategories();
  } catch (error) {
    console.error("Error deleting category:", error);
  }
}

window.editCategory = showCategoryForm;
window.deleteCategory = deleteCategory;
window.submitCategoryForm = submitCategoryForm;

// ========================================
// MODAL CONTROL
// ========================================
function closeModal() {
  modal.classList.remove("active");
}

window.closeModal = closeModal;

// ========================================
// SEARCH & FILTERS
// ========================================
document.getElementById("searchUsers")?.addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase();
  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(query) ||
      u.username.toLowerCase().includes(query),
  );
  renderUsers(filtered);
});

document.getElementById("searchProducts")?.addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase();
  applyProductFilters();
});

document
  .getElementById("categoryFilter")
  ?.addEventListener("change", applyProductFilters);
document
  .getElementById("statusFilter")
  ?.addEventListener("change", applyProductFilters);

function applyProductFilters() {
  const searchQuery = document
    .getElementById("searchProducts")
    .value.toLowerCase();
  const categoryId = document.getElementById("categoryFilter").value;
  const status = document.getElementById("statusFilter").value;

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

  if (status !== "") {
    const isActive = parseInt(status);
    filtered = filtered.filter((p) => (p.is_active ? 1 : 0) === isActive);
  }

  renderProducts(filtered);
}

document
  .getElementById("tableStatusFilter")
  ?.addEventListener("change", (e) => {
    const status = e.target.value;
    const filtered = status
      ? tables.filter((t) => t.status === status)
      : tables;
    renderTables(filtered);
  });

document
  .getElementById("orderStatusFilter")
  ?.addEventListener("change", (e) => {
    const status = e.target.value;
    const filtered = status
      ? orders.filter((o) => o.status === status)
      : orders;
    renderOrders(filtered);
  });

// ========================================
// EVENT LISTENERS
// ========================================
menuBtn.addEventListener("click", () => {
  sidebar.classList.toggle("active");
});

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    const section = item.dataset.section;
    switchSection(section);
  });
});

closeModalBtn.addEventListener("click", closeModal);

modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    closeModal();
  }
});

document
  .getElementById("addUserBtn")
  ?.addEventListener("click", () => showUserForm());
document
  .getElementById("addProductBtn")
  ?.addEventListener("click", () => showProductForm());
document
  .getElementById("addTableBtn")
  ?.addEventListener("click", () => showTableForm());
document
  .getElementById("addCategoryBtn")
  ?.addEventListener("click", () => showCategoryForm());

logoutBtn.addEventListener("click", async () => {
  try {
    await apiCall("/auth/logout", { method: "POST" });
    window.location.href = "/login.html";
  } catch (error) {
    console.error("Logout error:", error);
  }
});

// Dark mode toggle
if (darkModeToggle) {
  darkModeToggle.addEventListener("click", toggleDarkMode);
}

// ========================================
// INITIALIZATION
// ========================================
document.addEventListener("DOMContentLoaded", () => {
  initDarkMode();

  // Load dashboard data
  loadDashboard();
});
