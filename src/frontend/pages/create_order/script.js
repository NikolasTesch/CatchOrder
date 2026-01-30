require('./style.css');
// Create Order Page - JavaScript Functionality
// Integrates with backend API to create orders with products

const API_BASE = '/api';

// State management
let cart = [];
let categories = [];
let products = [];
let currentOrder = null;
let currentTableId = null;

// DOM Elements
const infoBar = document.querySelector('.info-bar');
const categoryContainer = document.querySelector('.page-wrapper');
const observationsTextarea = document.querySelector('.obs-textarea');
const finalizeButton = document.querySelector('.btn-finalize');

/**
 * Initialize page
 */
async function init() {
  initDarkMode();
  setupEventListeners();
  const urlParams = new URLSearchParams(window.location.search);
  currentTableId = urlParams.get("table_id");

  if (!currentTableId) {
    showError("Mesa não identificada. Redirecionando...");
    setTimeout(
      () => (window.location.href = "/waiter_main/waiterMain.html"),
      2000,
    );
    return;
  }

  await loadCategories();
  await loadProducts();
  renderProductsByCategory();
  updateInfoBar();
}

async function loadCategories() {
  try {
    const response = await fetch(`${API_BASE}/categories`);
    if (!response.ok) throw new Error("Erro ao carregar categorias");

    const data = await response.json();
    categories = data.data || [];
  } catch (error) {
    console.error("Erro ao carregar categorias:", error);
    showError("Erro ao carregar categorias");
  }
}

async function loadProducts() {
  try {
    const response = await fetch(`${API_BASE}/products/active`);
    if (!response.ok) throw new Error("Erro ao carregar produtos");

    const data = await response.json();
    products = data.data || [];
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
    showError("Erro ao carregar produtos");
  }
}


function renderProductsByCategory() {
  const existingSections = document.querySelectorAll(".category-section");
  existingSections.forEach((section) => section.remove());

  const obsSection = document.querySelector(".observations-section");

  if (categories.length === 0 || products.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.textContent = "Nenhum produto disponível no momento.";
    emptyMessage.style.textAlign = "center";
    emptyMessage.style.padding = "2rem";
    emptyMessage.style.color = "var(--neutral-60)";
    categoryContainer.insertBefore(emptyMessage, obsSection);
    return;
  }

  // Group products by category
  categories.forEach((category) => {
    const categoryProducts = products.filter(
      (p) => p.category_id === category.id,
    );

    if (categoryProducts.length === 0) return; // Skip empty categories

    const section = document.createElement("section");
    section.className = "category-section";
    section.innerHTML = `
      <h2 class="category-title">${category.name} <span class="arrow">→</span></h2>
      <div class="products-grid"></div>
    `;

    const grid = section.querySelector(".products-grid");

    categoryProducts.forEach((product) => {
      const card = createProductCard(product);
      grid.appendChild(card);
    });

    categoryContainer.insertBefore(section, obsSection);
  });
}

/**
 * Create a product card element
 */
function createProductCard(product) {
  const card = document.createElement("div");
  card.className = "product-card";
  card.dataset.productId = product.id;

  const imageUrl = product.image_url || "/img/placeholder-product.png";
  const price = parseFloat(product.price).toFixed(2);

  card.innerHTML = `
    <div class="product-image" style="background-image: url('${imageUrl}');"></div>
    <div class="product-info">
      <h3 class="product-name">${product.name}</h3>
      <p class="product-desc">${product.description || ""}</p>
      <p class="product-price">R$ ${price}</p>
    </div>
  `;

  card.addEventListener("click", () => addToCart(product));

  return card;
}

/**
 * Add product to cart
 */
function addToCart(product) {
  const existingItem = cart.find((item) => item.product_id === product.id);

  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({
      product_id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      quantity: 1,
    });
  }

  updateInfoBar();
  showSuccess(`${product.name} adicionado ao pedido`);
}

/**
 * Update info bar with cart summary
 */
function updateInfoBar() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  infoBar.innerHTML = `
    <div class="info-item">
      <span class="info-label">${totalItems} Produto${totalItems !== 1 ? "s" : ""}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Mesa: ${currentTableId}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Total: R$ ${totalPrice.toFixed(2)}</span>
    </div>
  `;
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  finalizeButton.addEventListener("click", finalizeOrder);

  // Dark mode toggle
  const darkModeToggle = document.getElementById("darkModeToggle");
  if (darkModeToggle) {
    darkModeToggle.addEventListener("click", toggleDarkMode);
  }

  // Menu button
  const menuBtn = document.getElementById("menuBtn");
  if (menuBtn) {
    menuBtn.addEventListener("click", () => {
      showSuccess("Menu em desenvolvimento");
      // TODO: Implement menu navigation
    });
  }

  // User button
  const userBtn = document.getElementById("userBtn");
  if (userBtn) {
    userBtn.addEventListener("click", () => {
      showSuccess("Perfil do usuário em desenvolvimento");
      // TODO: Navigate to user profile or show user menu
    });
  }

  // Logo click (optional: can navigate to home or toggle dark mode)
  const logoImage = document.getElementById("logoImage");
  if (logoImage) {
    logoImage.addEventListener("click", () => {
      // Optional: navigate to home
      // window.location.href = '/';
    });
  }
}

/**
 * Initialize dark mode based on user preference
 */
function initDarkMode() {
  // Check localStorage for saved preference
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

  // Save preference to localStorage
  localStorage.setItem("theme", isDark ? "dark" : "light");

  // Update icon
  updateDarkModeIcon(isDark);

  showSuccess(isDark ? "Modo escuro ativado" : "Modo claro ativado");
}

/**
 * Update dark mode toggle button icon
 */
function updateDarkModeIcon(isDark) {
  const darkModeToggle = document.getElementById("darkModeToggle");
  if (darkModeToggle) {
    const icon = darkModeToggle.querySelector(".material-symbols-outlined");
    if (icon) {
      icon.textContent = isDark ? "dark_mode" : "light_mode";
    }
  }
}

// Add CSS animations
const style = document.createElement("style");
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
document.addEventListener("DOMContentLoaded", init);

async function finalizeOrder() {
  if (cart.length === 0) {
    showError('Adicione pelo menos um produto ao pedido');
    return;
  }

  finalizeButton.disabled = true;
  finalizeButton.textContent = 'Finalizando...';

  try {
    // Step 1: Create order
    const orderResponse = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        table_id: currentTableId,
        user_id: getUserIdFromSession() // Get from session/JWT
      })
    });

    if (!orderResponse.ok) throw new Error('Erro ao criar pedido');

    const orderData = await orderResponse.json();
    currentOrder = orderData.data;

    // Step 2: Add items to order
    for (const item of cart) {
      const itemResponse = await fetch(`${API_BASE}/orders/${currentOrder.id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: item.product_id,
          quantity: item.quantity
        })
      });

      if (!itemResponse.ok) {
        throw new Error(`Erro ao adicionar item: ${item.name}`);
      }
    }

    // Step 3: Add observations if any
    const observations = observationsTextarea.value.trim();
    if (observations && currentOrder.id) {
      // Note: If there's an observations field in order model, update it here
      await fetch(`${API_BASE}/orders/${currentOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ observations })
      });
    }

    showSuccess('Pedido criado com sucesso!');

    // Redirect to orders page or waiter main after 2 seconds
    setTimeout(() => {
      window.location.href = '/waiter_main/waiterMain.html';
    }, 2000);

  } catch (error) {
    console.error('Erro ao finalizar pedido:', error);
    showError('Erro ao finalizar pedido. Tente novamente.');
    finalizeButton.disabled = false;
    finalizeButton.textContent = 'Finalizar Pedido';
  }
}

/**
 * Get user ID from session (JWT or localStorage)
 * This should match your auth implementation
 */
function getUserIdFromSession() {
  // Try to get from JWT stored in cookie or localStorage
  // For now, return a placeholder - adjust based on your auth implementation
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.id || null;
}

/**
 * Show success message
 */
function showSuccess(message) {
  // Create toast notification
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



// Initialize on page load
document.addEventListener('DOMContentLoaded', init);
