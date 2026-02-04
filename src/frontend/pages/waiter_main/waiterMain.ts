import '../../styles/global.css';
import '../../utils/utils'; // Global utils (ThemeManager)
import './style.css';
import { ApiService } from '../../services/apiService';

declare global {
  interface Window {
    ThemeManager: {
      init: () => void;
    };
  }
}

// Interfaces
interface OrderItem {
  product_id: string;
  product_name?: string;
  name?: string;
  quantity: number;
  price?: number;
}

interface Table {
  id: string;
  number: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
}

interface Order {
  id: string;
  table_id: string;
  user_id: string;
  status: "OPEN" | "IN_PROGRESS" | "CLOSED" | "PAID" | "CANCELLED";
  total: number;
  tip: number;
  created_at?: string;
  opened_at?: string;
  closed_at?: string;
  items?: OrderItem[];
}

interface User {
  id: string;
  name: string;
  username: string;
  role: string;
}

// State
let currentUser: User | null = null;
let allTables: Table[] = [];
let allUsers: User[] = [];
let currentEditingOrderId: string | null = null;
let currentSection: string = "dashboard";
let searchTerm: string = "";

// DOM Elements
const sidebar = document.getElementById("sidebar");
const menuBtn = document.getElementById("menuBtn");
const logoutBtn = document.getElementById("logoutBtn");
const darkModeToggle = document.getElementById("darkModeToggle");

async function init() {
  // Check authentication and load user data
  const user = await loadCurrentUser();
  if (!user) return;

  // Use Global ThemeManager if available
  if (window.ThemeManager) {
    window.ThemeManager.init();
  }

  setupEventListeners();
  // updateDateDisplay(); // removed from header
  loadTables();
  loadSummary();
  loadTables();
  loadSummary();
  loadActiveOrders(); // NEW

  // Check for auto-open modal
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("action") === "new_order") {
    openTableSelectionModal();
    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  // Auto-refresh every 30 seconds
  setInterval(() => {
    loadTables();
    loadSummary();
    loadActiveOrders(); // NEW
  }, 30000);

  // console.log('WaiterMain page initialized (TS)');
}

// Utility Functions
function formatCurrentDate(): string {
  const days = [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
  ];
  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const now = new Date();
  const dayOfWeek = days[now.getDay()];
  const day = now.getDate();
  const month = months[now.getMonth()];
  const year = now.getFullYear();

  return `${dayOfWeek}, ${day} de ${month} de ${year}`;
}

function formatCurrency(cents: number): string {
  const reais = cents / 100;
  return reais.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function updateDateDisplay() {
  const titleEl = document.querySelector(".summary-title");
  if (titleEl) {
    titleEl.textContent = formatCurrentDate();
  }
}

function formatTimeElapsed(dateStr?: string): string {
  if (!dateStr) return "";
  const start = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 60) {
    return `Há ${diffMins} minutos`;
  } else {
    const hours = Math.floor(diffMins / 60);
    return `Há ${hours} horas`;
  }
}

async function loadCurrentUser(): Promise<User | null> {
  try {
    const response = await ApiService.get<{ user: User }>("/auth/me");
    currentUser = response.user;
    return currentUser;
  } catch (error) {
    // console.error('Failed to load user:', error);
    window.location.href = "landingPage.html";
    return null;
  }
}

// Event Listeners
function setupEventListeners() {
  // Dark mode toggle handled by ThemeManager in utils.js via event delegation

  // Sidebar Toggle
  if (menuBtn && sidebar) {
    menuBtn.addEventListener("click", () => {
      sidebar.classList.toggle("active");
    });
  }

  // Orders Search Input
  const ordersSearch = document.getElementById("ordersSearchInput");
  if (ordersSearch) {
    ordersSearch.addEventListener("input", (e) => {
      searchTerm = (e.target as HTMLInputElement).value;
      if (currentSection === "orders") loadOrdersView();
    });
  }

  // Modal Close
  const closeTableModal = document.getElementById("closeTableModal");
  const modalOverlay = document.getElementById("tableModalOverlay");
  if (closeTableModal && modalOverlay) {
    closeTableModal.addEventListener("click", () => {
      modalOverlay.classList.remove("active");
    });
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) modalOverlay.classList.remove("active");
    });
  }

  // Logout
  const logoutBtnHeader = document.getElementById("logoutBtn");
  if (logoutBtnHeader) {
    logoutBtnHeader.addEventListener("click", handleLogout);
  }

  // Logo Click
  const logoImage = document.getElementById("logoImage");
  if (logoImage) {
    logoImage.addEventListener("click", () => {
      window.location.href = "waiterMain.html";
    });
  }

  // User Profile Click
  const userBtn = document.getElementById("userBtn");
  const headerActions = document.querySelector(
    ".header-actions",
  ) as HTMLElement;

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

  // Sidebar Navigation Links
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      const sectionId = (item as HTMLElement).getAttribute("data-section");
      const href = (item as HTMLElement).getAttribute("data-href");

      if (sectionId) {
        e.preventDefault();
        handleSectionChange(sectionId);
      } else if (href) {
        window.location.href = href;
      }
    });
  });
}

async function handleLogout() {
  try {
    await ApiService.post("/auth/logout", {});
  } catch (e) {
    // console.error("Logout error", e);
  } finally {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "landingPage.html";
  }
}

function toggleProfilePopover(btn: HTMLElement) {
  closePopovers(); // Close others
  let popover = document.getElementById("profilePopover");

  if (!popover) {
    popover = document.createElement("div");
    popover.id = "profilePopover";
    popover.className = "popover";

    if (currentUser) {
      // Logic to handle potential different role format if needed
      const createdDate =
        "created_at" in currentUser && currentUser.created_at
          ? new Date(currentUser.created_at as string).toLocaleDateString(
            "pt-BR",
          )
          : "-";

      popover.innerHTML = `
        <div class="popover-header">Perfil de Usuário</div>
        <div class="popover-body">
          <div class="user-info-card">
            <div class="user-name">${currentUser.name}</div>
            <div class="user-username">@${currentUser.username}</div>
            <div class="user-role-badge">
              <span class="role-badge ${currentUser.role.toLowerCase()}">${currentUser.role}</span>
            </div>
          </div>
        </div>
      `;

      // Attach listener to new button
    } else {
      popover.innerHTML = `<div class="popover-body">Carregando perfil...</div>`;
    }

    // Append to header-actions
    const headerActions = document.querySelector(".header-actions");
    if (headerActions) headerActions.appendChild(popover);
  }

  popover.classList.toggle("active");
}

function closePopovers() {
  document
    .querySelectorAll(".popover")
    .forEach((p) => p.classList.remove("active"));
}

// Data Loading
async function loadTables() {
  try {
    const response = await ApiService.get<{ data: Table[] }>("/tables");
    allTables = response.data || [];
    const tables = allTables;

    renderOccupiedTables(tables.filter((t) => t.status === "OCCUPIED"));
    renderAvailableTables(tables.filter((t) => t.status === "AVAILABLE"));

    // If modal exists, also render modal tables
    const modalGrid = document.getElementById("availableTablesGrid");
    if (modalGrid) {
      renderModalAvailableTables(
        tables.filter((t) => t.status === "AVAILABLE"),
      );
    }
  } catch (error) {
    // console.error('Error loading tables:', error);
  }
}

function renderOccupiedTables(tables: Table[]) {
  const container = document.querySelector(".occupied-scroll");
  if (!container) return;

  if (tables.length === 0) {
    container.innerHTML = '<p class="empty-message">Nenhuma mesa ocupada</p>';
    return;
  }

  container.innerHTML = tables
    .map(
      (table) => `
        <button class="table-card occupied" data-table-id="${table.id}" data-status="OCCUPIED">
          <div class="card-header">
             <span class="table-number">${table.number < 10 ? "0" + table.number : table.number}</span>
             <span class="table-label">MESA</span>
          </div>
          <div class="card-body">
             <span class="material-symbols-outlined">group</span>
             <span>4 pessoas</span>
          </div>
          <div class="card-footer">
             <span class="status-badge status-waiting">Aguardando Pedido</span>
          </div>
        </button>
    `,
    )
    .join("");

  container.querySelectorAll(".table-card").forEach((card) => {
    (card as HTMLElement).addEventListener("click", () => {
      handleTableClick((card as HTMLElement).dataset.tableId!, "OCCUPIED");
    });
  });
}

function renderAvailableTables(tables: Table[]) {
  const container = document.querySelector(".available-tables-grid");
  if (!container) return;

  if (tables.length === 0) {
    container.innerHTML =
      '<p class="empty-message">Nenhuma mesa disponível</p>';
    return;
  }

  container.innerHTML = tables
    .map(
      (table) => `
    <button class="table-card available" data-table-id="${table.id}" data-status="AVAILABLE">
      <div class="card-header">
         <span class="table-number">${table.number < 10 ? "0" + table.number : table.number}</span>
         <span class="table-label">MESA</span>
      </div>
      <div class="card-body">
         <span class="material-symbols-outlined">group</span>
         <span>-</span>
      </div>
      <div class="card-footer">
         <span class="status-badge status-free">Livre</span>
      </div>
    </button>
  `,
    )
    .join("");

  container.querySelectorAll(".table-card").forEach((card) => {
    (card as HTMLElement).addEventListener("click", () => {
      handleTableClick((card as HTMLElement).dataset.tableId!, "AVAILABLE");
    });
  });
}

// Modal Functions
function openTableSelectionModal() {
  const modal = document.getElementById("tableModalOverlay");
  if (modal) {
    modal.classList.add("active");
    loadTables();
  }
}

function renderModalAvailableTables(tables: Table[]) {
  const container = document.getElementById("availableTablesGrid");
  if (!container) return;

  if (tables.length === 0) {
    container.innerHTML =
      '<p class="empty-message">Nenhuma mesa disponível</p>';
    return;
  }

  container.innerHTML = tables
    .map(
      (table) => `
    <button class="table-card available" data-table-id="${table.id}" aria-label="Mesa ${table.number}">
      <span class="table-number">${table.number}</span>
    </button>
  `,
    )
    .join("");

  container.querySelectorAll(".table-card").forEach((card) => {
    (card as HTMLElement).addEventListener("click", () => {
      // Navigate to Create Order with selected table
      window.location.href = `createOrder.html?table_id=${(card as HTMLElement).dataset.tableId}`;
    });
  });
}

function handleTableClick(tableId: string, status: string = "OCCUPIED") {
  if (status === "AVAILABLE") {
    window.location.href = `createOrder.html?table_id=${tableId}`;
  } else {
    window.location.href = `orders.html?tableId=${tableId}`;
  }
}

async function loadSummary() {
  try {
    if (!currentUser) return;
    const user = currentUser; // Capture user to ensure it's not null in callback

    const response = await ApiService.get<{ data: Order[] }>("/orders");
    const orders = response.data || [];

    const now = new Date();

    // Robust date parsing handles "YYYY-MM-DD HH:mm:ss" vs ISO
    const isToday = (dateStr?: string) => {
      if (!dateStr) return false;
      let d = new Date(dateStr);
      // Fallback for SQL-style timestamps
      if (isNaN(d.getTime())) {
        d = new Date(dateStr.replace(" ", "T"));
      }
      if (isNaN(d.getTime())) return false;

      return (
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    };

    const todayOrders = orders.filter((o) => {
      // Robust logging for debugging
      // console.log('Checking order:', o);

      // Check date - use closed_at if available (sales/commissions usually based on closing time)
      const orderDateStr = o.closed_at || o.created_at || o.opened_at;
      const orderSameDay = isToday(orderDateStr);

      // Loose comparison for IDs (string vs number)
      const isMyOrder =
        o.user_id == user.id || String(o.user_id) === String(user.id);
      const status = (o.status || "").toUpperCase();
      const isClosed = ["CLOSED", "PAID"].includes(status);

      return orderSameDay && isMyOrder && isClosed;
    });

    // Calculate total tip directly from tip field if available, fallback to 10%
    const totalTip = todayOrders.reduce((sum, order) => {
      let val = Number(order.tip);
      if (isNaN(val)) {
        const total =
          typeof order.total === "string"
            ? parseFloat(order.total)
            : order.total;
        val = (total || 0) * 0.1;
      }
      return sum + val;
    }, 0);

    const valueEl = document.getElementById("headerCommissionValue");
    // const subtitleEl = document.querySelector(".summary-subtitle");
    // const badgeEl = document.querySelector(".badge-today");

    // if (badgeEl) badgeEl.textContent = "Minhas Comissões (10%)";
    if (valueEl) valueEl.textContent = formatCurrency(totalTip); // formatCurrency expects cents
    // if (subtitleEl)
    //   subtitleEl.textContent = `${todayOrders.length} mesa${todayOrders.length !== 1 ? "s" : ""} finalizada${todayOrders.length !== 1 ? "s" : ""} por mim`;
  } catch (error) {
    // console.error('Error loading summary:', error);
  }
}

// Active Orders
async function loadActiveOrders() {
  try {
    if (!currentUser) return;
    const user = currentUser;

    const response = await ApiService.get<{ data: Order[] }>("/orders");
    const orders = response.data || [];

    // Also load tables to resolve table numbers
    const tablesResponse = await ApiService.get<{ data: Table[] }>("/tables");
    const tables = tablesResponse.data || [];

    // Filter active orders for the current user
    const activeOrders = orders.filter((o) => {
      const isMyOrder = o.user_id === user.id;
      const isActive = ["OPEN", "IN_PROGRESS"].includes(o.status);
      return isMyOrder && isActive;
    });

    renderActiveOrders(activeOrders, tables);
  } catch (error) {
    console.error("Error loading active orders:", error);
  }
}

function renderActiveOrders(orders: Order[], tables: Table[]) {
  const container = document.getElementById("activeOrdersGrid");
  if (!container) return;

  if (orders.length === 0) {
    container.innerHTML =
      '<p class="empty-message">Nenhum pedido em andamento</p>';
    return;
  }

  // Clean container
  container.innerHTML = "";

  // Render Orders
  const ordersHtml = orders
    .map((order) => {
      const table = tables.find((t) => t.id === order.table_id);
      const tableNumber = table ? table.number : "?";

      // Items list (limit to 3 for space)
      const itemsHtml =
        order.items && order.items.length > 0
          ? order.items
            .slice(0, 3)
            .map(
              (i) => `
              <div class="order-item-line">
                <span class="item-qty">${i.quantity}x</span>
                <span class="item-name">${i.name || i.product_name}</span>
              </div>
            `,
            )
            .join("")
          : '<span class="item-name">Sem itens</span>';

      const moreItems =
        order.items && order.items.length > 3
          ? `<div class="order-item-line" style="margin-top:4px; font-style:italic;">+ ${order.items.length - 3} itens...</div>`
          : "";

      const total = order.total ? parseFloat(order.total.toString()) : 0;
      const timeElapsed = formatTimeElapsed(
        order.created_at || order.opened_at,
      );

      // Determine status badge
      let statusBadge = "";
      if (order.status === "OPEN" || order.status === "IN_PROGRESS") {
        statusBadge = '<span class="badge-status-preparing">PREPARANDO</span>';
      } else {
        statusBadge = '<span class="badge-status-waiting">AGUARDANDO</span>';
      }

      return `
      <div class="active-order-card" data-order-id="${order.id}">
        <div class="order-card-header">
           <div class="table-indicator">
              <span class="number">${typeof tableNumber === "number" && tableNumber < 10 ? "0" + tableNumber : tableNumber}</span>
              <span class="label">MESA</span>
           </div>
           ${statusBadge}
        </div>
        
        <div class="order-card-body">
           <div class="order-items-list">
              ${itemsHtml}
              ${moreItems}
           </div>
           
           <div class="time-elapsed">
              <span class="material-symbols-outlined">schedule</span>
              <span>${timeElapsed}</span>
           </div>
        </div>
        
        <div class="order-card-footer">
           <span class="order-price">${formatCurrency(total)}</span>
           <button class="btn-edit-order" aria-label="Editar pedido">
              <span class="material-symbols-outlined">edit</span>
           </button>
        </div>
      </div>
    `;
    })
    .join(""); container.innerHTML = ordersHtml;

  // Add click listeners to Edit Buttons
  container.querySelectorAll(".btn-edit-order").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const card = btn.closest(".active-order-card") as HTMLElement;
      const orderId = card.dataset.orderId;
      const order = orders.find((o) => o.id === orderId);
      if (order) {
        // Edit/Detail Mode
        window.location.href = `createOrder.html?table_id=${order.table_id}&order_id=${order.id}`;
      }
    });
  });
}

// ========================================
// SECTION HANDLING (SPA)
// ========================================
function handleSectionChange(sectionId: string) {
  currentSection = sectionId;

  // Update Sidebar
  document.querySelectorAll(".nav-item").forEach((btn) => {
    if (btn.getAttribute("data-section") === sectionId) {
      btn.classList.add("active");
    } else if (btn.getAttribute("data-section")) {
      btn.classList.remove("active");
    }
  });

  // Toggle Sections
  const dashboardSection = document.getElementById("dashboard-section");
  const commissionsSection = document.getElementById("commissions-section");
  const ordersSection = document.getElementById("orders-section");

  // Hide all first
  if (dashboardSection) dashboardSection.style.display = "none";
  if (commissionsSection) commissionsSection.style.display = "none";
  if (ordersSection) ordersSection.style.display = "none";

  if (sectionId === "dashboard" && dashboardSection) {
    dashboardSection.style.display = "block";
    loadTables();
    loadActiveOrders();
  } else if (sectionId === "commissions" && commissionsSection) {
    commissionsSection.style.display = "block";
    loadCommissions();
  } else if (sectionId === "orders" && ordersSection) {
    ordersSection.style.display = "block";
    loadOrdersView();
  }
}

// ========================================
// COMMISSIONS LOGIC (SPA Section)
// ========================================
async function loadCommissions() {
  try {
    if (!currentUser) return;

    if (allTables.length === 0) await loadTables();

    const response = await ApiService.get<{ data: Order[] }>("/orders");
    const orders = response.data || [];

    renderCommissionsView(orders);
  } catch (error) {
    console.error("Error loading commissions:", error);
  }
}

function renderCommissionsView(orders: Order[]) {
  if (!currentUser) return;

  const now = new Date();
  const todayStr = now.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Filter My Orders (Closed)
  const myOrders = orders.filter(
    (o) =>
      (o.user_id == currentUser!.id ||
        String(o.user_id) === String(currentUser!.id)) &&
      (o.status === "CLOSED" || o.status === "PAID"),
  );

  // Sort by date desc
  myOrders.sort((a, b) => {
    const da = a.closed_at ? new Date(a.closed_at).getTime() : 0;
    const db = b.closed_at ? new Date(b.closed_at).getTime() : 0;
    return db - da;
  });

  let dailyTotal = 0;
  let monthlyTotal = 0;

  const tableBody = document.getElementById("commissionTableBody");
  const dailyEl = document.getElementById("dailyCommission");
  const monthlyEl = document.getElementById("monthlyCommission");

  if (myOrders.length === 0) {
    if (tableBody)
      tableBody.innerHTML =
        '<tr><td colspan="5" style="text-align: center; padding: 2rem; color: #64748b;">Nenhuma venda finalizada.</td></tr>';
  } else {
    if (tableBody) {
      tableBody.innerHTML = myOrders
        .map((order) => {
          const tipVal = Number(order.tip) || 0;
          const orderDate = order.closed_at ? new Date(order.closed_at) : null;
          const total = Number(order.total) || 0;

          // Verify consistency: If tip exists (is not 0), enforce 10% of the current total
          const calculatedTip = Math.round(total * 0.1);
          const finalTip = tipVal > 0 ? calculatedTip : 0;

          let dateStr = "-";

          if (orderDate) {
            dateStr = orderDate.toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            // Calc Stats
            // Re-construct clean date string for comparison to avoid time issues
            const simpleDateStr = orderDate.toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            });

            // Stats collection using finalTip
            if (simpleDateStr === todayStr) dailyTotal += finalTip;
            if (
              orderDate.getMonth() === currentMonth &&
              orderDate.getFullYear() === currentYear
            ) {
              monthlyTotal += finalTip;
            }
          }

          // Find Table Number
          const table = allTables.find((t) => t.id === order.table_id);
          const tableNumber = table
            ? table.number < 10
              ? "0" + table.number
              : table.number
            : "?";

          return `
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 1rem; color: var(--color-primary);">#${order.id.slice(0, 8)}</td>
                        <td style="padding: 1rem; color: var(--color-primary);">${dateStr}</td>
                        <td style="padding: 1rem; color: var(--color-primary);">${tableNumber}</td> 
                        <td style="padding: 1rem; color: #64748b;">${formatCurrency(total)}</td>
                        <td style="padding: 1rem; color: ${finalTip > 0 ? "#10b981" : "#94a3b8"}; font-weight: 600;">${finalTip > 0 ? formatCurrency(finalTip) : "---"}</td>
                    </tr>
                `;
        })
        .join("");
    }
  }

  // Update Stats Cards
  if (dailyEl) dailyEl.textContent = formatCurrency(dailyTotal);
  if (monthlyEl) monthlyEl.textContent = formatCurrency(monthlyTotal);
}

// ========================================
// ORDERS LOGIC (SPA Section)
// ========================================
async function loadOrdersView() {
  try {
    // We need tables and users to render orders properly
    if (allTables.length === 0) await loadTables();
    if (allUsers.length === 0) await loadUsers();

    const response = await ApiService.get<{ data: Order[] }>("/orders");
    const orders = response.data || [];

    renderOrdersView(orders);
  } catch (error) {
    console.error("Error loading orders:", error);
  }
}

async function loadUsers() {
  try {
    const response = await ApiService.get<{ data: User[] }>("/users");
    allUsers = response.data || [];
  } catch (e) {
    // console.error("Error loading users", e);
  }
}

function renderOrdersView(orders: Order[]) {
  // Filter by search
  const filtered = orders.filter((o) => {
    if (!searchTerm) return true;

    // Find table number
    const table = allTables.find(
      (t) => t.id === o.table_id || String(t.id) === String(o.table_id),
    );
    if (table && String(table.number).includes(searchTerm)) return true;

    return false;
  });

  const openOrders = filtered.filter(
    (o) => o.status === "OPEN" || o.status === "IN_PROGRESS",
  );
  const finishedOrders = filtered.filter(
    (o) =>
      o.status === "CLOSED" || o.status === "PAID" || o.status === "CANCELLED",
  );

  // Sort: Table Number
  const sorter = (a: Order, b: Order) => {
    const ta = allTables.find(
      (t) => t.id === a.table_id || String(t.id) === String(a.table_id),
    );
    const tb = allTables.find(
      (t) => t.id === b.table_id || String(t.id) === String(b.table_id),
    );
    return (ta ? ta.number : 0) - (tb ? tb.number : 0);
  };

  openOrders.sort(sorter);
  finishedOrders.sort(sorter);

  const openGrid = document.getElementById("orders-open-grid");
  const finishedGrid = document.getElementById("orders-finished-grid");

  renderOrderGrid(openGrid, openOrders, "open");
  renderOrderGrid(finishedGrid, finishedOrders, "finished");
}

function renderOrderGrid(
  container: HTMLElement | null,
  ordersList: Order[],
  type: "open" | "finished",
) {
  if (!container) return;

  if (ordersList.length === 0) {
    container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #64748b;">Nenhuma ordem ${type === "open" ? "aberta" : "finalizada"}.</p>`;
    return;
  }

  container.innerHTML = ordersList
    .map((order) => {
      const table = allTables.find(
        (t) =>
          t.id === order.table_id || String(t.id) === String(order.table_id),
      );
      const user = allUsers.find(
        (u) => u.id === order.user_id || String(u.id) === String(order.user_id),
      );

      const tableNum = table ? table.number : "?";
      const total = Number(order.total) || 0;

      const timeElapsed =
        order.created_at || order.opened_at
          ? formatTimeElapsed(order.created_at || order.opened_at)
          : "-";

      const itemsDesc =
        order.items && order.items.length
          ? order.items
            // Limit items? Dashboard limits to 3. Let's limit to 3 here too to match "mesmo formato".
            .slice(0, 3)
            .map((i: any) => `${i.quantity}x ${i.name || i.product_name}`)
            .join(", ")
          : "Sem itens";

      const moreItemsText =
        order.items && order.items.length > 3
          ? ` (+${order.items.length - 3})`
          : "";

      return `
         <div class="active-order-card" data-order-id="${order.id}">
            <div class="order-card-header">
               <div class="table-indicator">
                  <span class="number">${typeof tableNum === "number" && tableNum < 10 ? "0" + tableNum : tableNum}</span>
                  <span class="label">MESA</span>
               </div>
               <span class="badge-status-${type === "open" ? "preparing" : "waiting"}">${translateStatus(order.status)}</span>
            </div>
            <div class="order-card-body">
               <div class="order-items-list">
                  <p style="font-size: 0.9rem; color: var(--text-muted); display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">${itemsDesc}${moreItemsText}</p>
               </div>
               
               <div class="time-elapsed" style="margin-top: auto; display: flex; align-items: center; gap: 0.5rem; color: var(--text-dim); font-size: 0.8rem;">
                  <span class="material-symbols-outlined" style="font-size: 1rem;">schedule</span>
                  <span>${timeElapsed}</span>
                  ${user ? `<span style="margin-left:auto;">Garçom: ${user.name.split(" ")[0]}</span>` : ""}
               </div>
            </div>
            <div class="order-card-footer">
               <span class="order-price">${formatCurrency(total)}</span>
               <button class="btn-edit-order" onclick="window.location.href='createOrder.html?table_id=${order.table_id}&order_id=${order.id}'">
                  <span class="material-symbols-outlined">edit</span>
               </button>
            </div>
         </div>
        `;
    })
    .join("");
}

function translateStatus(status: string) {
  const map: Record<string, string> = {
    OPEN: "Aberto",
    IN_PROGRESS: "Em Andamento",
    CLOSED: "Fechado",
    PAID: "Pago",
    CANCELLED: "Cancelado",
  };
  return map[status] || status;
}



// Initialize
document.addEventListener('DOMContentLoaded', init);
