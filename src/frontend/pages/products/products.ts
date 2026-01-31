// Make this file a module to avoid global scope contamination
export { };

import "./style.css";

// API Configuration
const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : (window.location.pathname.includes('/server09/') ? '/server09/api' : '/api');

interface Product {
  id: string;
  name: string;
  category_id: string;
  price: number;
  image_path?: string;
  is_active: boolean;
}

/**
 * Check if user is authenticated
 */
function checkAuth(): boolean {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "landingPage.html";
    return false;
  }
  return true;
}

/**
 * Get authorization headers
 */
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Get current user ID from localStorage
 */
function getUserId(): string | null {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      return user.id || null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  }
  return null;
}

/**
 * Toggle sidebar navigation
 */
function toggleSidebar(): void {
  document.body.classList.toggle("sidebar-open");
}

/**
 * Close sidebar navigation
 */
function closeSidebar(): void {
  document.body.classList.remove("sidebar-open");
}

/**
 * Open user modal and display user info
 */
function openUserModal(): void {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      const user = JSON.parse(userStr);

      // Update modal with user data
      const nameEl = document.getElementById("modalUserName");
      const roleEl = document.getElementById("modalUserRole");

      if (nameEl) nameEl.textContent = user.name || "Usuário";
      if (roleEl) roleEl.textContent = formatRole(user.role || "");

      document.body.classList.add("user-modal-open");
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
  }
}

/**
 * Close user modal
 */
function closeUserModal(): void {
  document.body.classList.remove("user-modal-open");
}

/**
 * Handle user logout
 */
/**
 * Handle user logout
 */
async function handleLogout(): Promise<void> {
  if (confirm('Tem certeza que deseja sair?')) {
    try {
      const response = await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
    } catch (e) {
      console.error("Logout API call failed", e);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = 'landingPage.html';
    }
  }
}

/**
 * Format role for display
 */
function formatRole(role: string): string {
  const roleMap: { [key: string]: string } = {
    admin: "Administrador",
    manager: "Gerente",
    waiter: "Garçom",
    kitchen: "Cozinha",
  };
  return roleMap[role] || role;
}

document.addEventListener("DOMContentLoaded", () => {
  const productsGrid = document.getElementById(
    "products-grid",
  ) as HTMLElement | null;
  const searchInput = document.querySelector(
    ".search-input",
  ) as HTMLInputElement | null;
  const btnAddProduct = document.getElementById(
    "addProductBtn",
  ) as HTMLButtonElement | null;

  let products: Product[] = [];

  init();

  function init(): void {
    // Check authentication first
    if (!checkAuth()) {
      return;
    }

    initDarkMode();
    setupEventListeners();
    fetchProducts();
  }

  function initDarkMode() {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      document.body.classList.add("dark-mode");
      updateDarkModeIcon(true);
    } else {
      updateDarkModeIcon(false);
    }
  }

  function toggleDarkMode() {
    const isDark = document.body.classList.toggle("dark-mode");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    updateDarkModeIcon(isDark);
  }

  function updateDarkModeIcon(isDark: boolean) {
    const darkModeToggle = document.getElementById("darkModeToggle");
    if (darkModeToggle) {
      const icon = darkModeToggle.querySelector(".material-symbols-outlined");
      if (icon) {
        icon.textContent = isDark ? "dark_mode" : "light_mode";
      }
    }
  }

  function setupEventListeners(): void {
    // Search & Products
    if (searchInput) {
      searchInput.addEventListener("input", handleSearch);
    }

    if (btnAddProduct) {
      btnAddProduct.addEventListener("click", navigateToCreate);
    }

    // Header & Navigation
    const darkModeToggle = document.getElementById("darkModeToggle");
    if (darkModeToggle) {
      darkModeToggle.addEventListener("click", toggleDarkMode);
    }

    const menuBtn = document.getElementById("menuBtn");
    if (menuBtn) {
      menuBtn.addEventListener("click", toggleSidebar);
    }

    // Sidebar close handlers
    const sidebarOverlay = document.getElementById("sidebarOverlay");
    if (sidebarOverlay) {
      sidebarOverlay.addEventListener("click", closeSidebar);
    }

    const closeSidebarBtn = document.getElementById("closeSidebar");
    if (closeSidebarBtn) {
      closeSidebarBtn.addEventListener("click", closeSidebar);
    }

    // ESC key to close sidebar
    document.addEventListener("keydown", (e) => {
      if (
        e.key === "Escape" &&
        document.body.classList.contains("sidebar-open")
      ) {
        closeSidebar();
      }
    });

    const userBtn = document.getElementById("userBtn");
    if (userBtn) {
      userBtn.addEventListener("click", openUserModal);
    }

    // User modal close handlers
    const userModalOverlay = document.getElementById("userModalOverlay");
    if (userModalOverlay) {
      userModalOverlay.addEventListener("click", closeUserModal);
    }

    const closeUserModalBtn = document.getElementById("closeUserModal");
    if (closeUserModalBtn) {
      closeUserModalBtn.addEventListener("click", closeUserModal);
    }

    // Logout button
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", handleLogout);
    }

    // ESC key listeners
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (document.body.classList.contains("sidebar-open")) {
          closeSidebar();
        }
        if (document.body.classList.contains("user-modal-open")) {
          closeUserModal();
        }
      }
    });

    const logoImage = document.getElementById("logoImage");
    if (logoImage) {
      logoImage.addEventListener("click", () => {
        window.location.href = "landingPage.html";
      });
    }
  }

  function navigateToCreate(): void {
    window.location.href = "createProducts.html";
  }

  async function fetchProducts(): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/products`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (response.ok) {
        products = data.data || [];
        renderProducts(products);
      } else {
        // Handle 401 Unauthorized
        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "landingPage.html";
          return;
        }
        console.error("Failed to fetch products:", data.message);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }

  function renderProducts(items: Product[]): void {
    if (!productsGrid) return;

    productsGrid.innerHTML = "";

    // Add "Add New" card
    const addCard = document.createElement("div");
    addCard.className = "product-card add-card";
    addCard.id = "btn-add-product-card";
    addCard.innerHTML =
      '<span class="material-symbols-outlined add-icon">add</span>';
    addCard.addEventListener("click", navigateToCreate);
    productsGrid.appendChild(addCard);

    items.forEach((product) => {
      const card = createProductCard(product);
      productsGrid.appendChild(card);
    });
  }

  function formatPrice(priceInCents: number): string {
    return (priceInCents / 100).toFixed(2);
  }

  function createProductCard(product: Product): HTMLElement {
    const card = document.createElement("div");
    card.className = "product-card";

    // Placeholder image if none
    const bgImage = product.image_path
      ? `url('${product.image_path}')`
      : "none";
    const bgColor = product.image_path ? "transparent" : "#eee";

    card.innerHTML = `
      <div class="card-image" style="background-image: ${bgImage}; background-color: ${bgColor};"></div>
      <div class="card-info">
        <h3 class="product-name">${product.name}</h3>
        <span class="product-category">R$ ${formatPrice(product.price)}</span>
      </div>
    `;
    return card;
  }

  function handleSearch(e: Event): void {
    const term = (e.target as HTMLInputElement).value.toLowerCase();
    const filtered = products.filter((p) =>
      p.name.toLowerCase().includes(term),
    );
    renderProducts(filtered);
  }
});
