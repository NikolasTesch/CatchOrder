require("./style.css");
// API Configuration
const API_BASE = "http://localhost:3000/api";

/**
 * Check if user is authenticated
 */
function checkAuth() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/pages/landingPage.html";
    return false;
  }
  return true;
}

/**
 * Get authorization headers
 */
function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Handle API errors
 */
function handleApiError(error, response) {
  console.error("API Error:", error);

  if (response && response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/pages/landingPage.html";
    return;
  }

  // Show error message to user
  showNotification("Erro ao carregar dados. Tente novamente.", "error");
}

/**
 * Show notification
 */
function showNotification(message, type = "info") {
  // TODO: Implement a proper notification system
  console.log(`[${type.toUpperCase()}] ${message}`);
}

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

function toggleDarkMode() {
  const isDark = document.body.classList.toggle("dark-mode");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  updateDarkModeIcon(isDark);
}

function updateDarkModeIcon(isDark) {
  const darkModeToggle = document.getElementById("darkModeToggle");
  if (darkModeToggle) {
    const icon = darkModeToggle.querySelector(".material-symbols-outlined");
    if (icon) {
      icon.textContent = isDark ? "dark_mode" : "light_mode";
    }
  }
}

/**
 * Setup UI event listeners
 */
function setupEventListeners() {
  // Dark mode toggle
  const darkModeToggle = document.getElementById("darkModeToggle");
  if (darkModeToggle) {
    darkModeToggle.addEventListener("click", toggleDarkMode);
  }

  // Sidebar elements
  const sidebar = document.getElementById("sidebar");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const sidebarClose = document.getElementById("sidebarClose");
  const sidebarLogout = document.getElementById("sidebarLogout");

  // Menu button - open sidebar
  const menuBtn = document.getElementById("menuBtn");
  if (menuBtn && sidebar) {
    menuBtn.addEventListener("click", () => {
      sidebar.classList.add("active");
      sidebarOverlay.classList.add("active");
    });
  }

  // Close sidebar on overlay click
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", closeSidebar);
  }

  // Close sidebar button
  if (sidebarClose) {
    sidebarClose.addEventListener("click", closeSidebar);
  }

  // Sidebar logout button
  if (sidebarLogout) {
    sidebarLogout.addEventListener("click", handleLogout);
  }

  // User dropdown elements
  const userBtn = document.getElementById("userBtn");
  const userDropdown = document.getElementById("userDropdown");

  // User button - toggle dropdown
  if (userBtn && userDropdown) {
    userBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle("active");
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!userDropdown.contains(e.target) && !userBtn.contains(e.target)) {
        userDropdown.classList.remove("active");
      }
    });
  }

  // Logo click - go to home
  const logoImage = document.getElementById("logoImage");
  if (logoImage) {
    logoImage.addEventListener("click", () => {
      window.location.href = "/pages/waiterMain.html";
    });
  }

  // New order button
  const newOrderBtn = document.getElementById("newOrderBtn");
  if (newOrderBtn) {
    newOrderBtn.addEventListener("click", () => {
      window.location.href = "/pages/createOrder.html";
    });
  }

  // Logout functionality (dropdown)
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }
}

/**
 * Close sidebar
 */
function closeSidebar() {
  const sidebar = document.getElementById("sidebar");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  if (sidebar) sidebar.classList.remove("active");
  if (sidebarOverlay) sidebarOverlay.classList.remove("active");
}

/**
 * Handle user logout
 */
function handleLogout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/pages/landingPage.html";
}

// Load tables from backend
async function loadTables() {
  try {
    const response = await fetch(`${API_BASE}/tables`, {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      handleApiError(new Error("Failed to load tables"), response);
      return;
    }

    const data = await response.json();
    const tables = data.data || [];

    // Render occupied tables
    renderOccupiedTables(tables.filter((t) => t.status === "OCCUPIED"));

    // Render all tables
    renderAllTables(tables);
  } catch (error) {
    handleApiError(error, null);
  }
}

function renderOccupiedTables(tables) {
  const container = document.querySelector(".occupied-scroll");
  if (!container) return;

  container.innerHTML =
    tables.length > 0
      ? tables
          .map(
            (table) => `
        <button class="table-card occupied" data-table-id="${table.id}" aria-label="Mesa ${table.number}">
          <span class="table-number">${table.number}</span>
        </button>
      `,
          )
          .join("")
      : '<p class="empty-message">Nenhuma mesa ocupada</p>';

  container.querySelectorAll(".table-card").forEach((card) => {
    card.addEventListener("click", () =>
      handleTableClick(card.dataset.tableId),
    );
  });
}

function renderAllTables(tables) {
  const container = document.querySelector(".tables-grid");
  if (!container) return;

  container.innerHTML = tables
    .map(
      (table) => `
    <button class="table-card ${table.status.toLowerCase()}" data-table-id="${table.id}" aria-label="Mesa ${table.number}">
      <span class="table-number">${table.number}</span>
    </button>
  `,
    )
    .join("");

  // Add click listeners
  container.querySelectorAll(".table-card").forEach((card) => {
    card.addEventListener("click", () =>
      handleTableClick(card.dataset.tableId),
    );
  });
}

function handleTableClick(tableId) {
  console.log("Table clicked:", tableId);
  // Navigate to orders page with table filter
  window.location.href = `/pages/orders.html?tableId=${tableId}`;
}

// Load summary data
async function loadSummary() {
  try {
    const response = await fetch(`${API_BASE}/orders`, {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      handleApiError(new Error("Failed to load summary"), response);
      return;
    }

    const data = await response.json();
    const orders = data.data || [];

    // Calculate today's total
    const today = new Date().toDateString();
    const todayOrders = orders.filter((o) => {
      const orderDate = new Date(o.created_at).toDateString();
      return orderDate === today && o.status === "CLOSED";
    });

    const total = todayOrders.reduce(
      (sum, order) => sum + (order.total || 0),
      0,
    );

    // Update UI
    const valueEl = document.querySelector(".summary-value");
    const subtitleEl = document.querySelector(".summary-subtitle");

    if (valueEl) valueEl.textContent = `R$ ${total.toFixed(2)}`;
    if (subtitleEl)
      subtitleEl.textContent = `${todayOrders.length} mesa${todayOrders.length !== 1 ? "s" : ""} atendida${todayOrders.length !== 1 ? "s" : ""} hoje`;
  } catch (error) {
    handleApiError(error, null);
  }
}

/**
 * Display user info in dropdown
 */
function displayUserInfo() {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      console.log("Logged in as:", user.username);

      // Update user name in dropdown
      const userName = document.getElementById("userName");
      const userRole = document.getElementById("userRole");

      if (userName) {
        userName.textContent = user.name || user.username;
      }
      if (userRole) {
        const roleLabels = {
          admin: "Administrador",
          manager: "Gerente",
          waiter: "Garçom",
        };
        userRole.textContent = roleLabels[user.role] || user.role;
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
  }
}

function init() {
  // Check authentication first
  if (!checkAuth()) {
    return;
  }

  displayUserInfo();
  initDarkMode();
  setupEventListeners();
  loadTables();
  loadSummary();

  // Auto-refresh every 30 seconds
  setInterval(() => {
    loadTables();
    loadSummary();
  }, 30000);

  console.log("WaiterMain page initialized");
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
