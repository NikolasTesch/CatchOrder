// Make this file a module to avoid global scope contamination
export { };

import { ApiService } from '../../services/apiService';
import { ModalService } from '../../utils/modalService';
import './style.css';

// API Configuration
// Using ApiService.getBaseUrl()

interface User {
  id: string;
  name: string;
  username: string;
  role: string;
  image_url?: string;
}

// Toast Notification Types
type ToastType = 'success' | 'error' | 'info';

/**
 * Check if user is authenticated and has permission
 */
function checkAuth(): boolean {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (!token || !userStr) {
    window.location.href = 'landingPage.html';
    return false;
  }

  try {
    // Frontend Permission Validation
    const user = JSON.parse(userStr);
    const allowedRoles = ['admin', 'manager'];

    if (!allowedRoles.includes(user.role)) {
      ModalService.alert('Acesso Negado', 'Você não tem permissão para acessar esta página.', 'error', () => {
        window.location.href = 'products.html'; // Redirect to a safe page
      });
      return false;
    }
  } catch (e) {
    localStorage.clear();
    window.location.href = 'landingPage.html';
    return false;
  }

  return true;
}

/**
 * Get authorization headers
 */
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

/**
 * Show Toast Notification
 */
function showToast(message: string, type: ToastType = 'info'): void {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let icon = 'info';
  if (type === 'success') icon = 'check_circle';
  if (type === 'error') icon = 'error';

  toast.innerHTML = `
    <span class="material-symbols-outlined">${icon}</span>
    <span>${message}</span>
  `;

  document.body.appendChild(toast);

  // Animate in
  setTimeout(() => toast.classList.add('toast-show'), 100);

  // Animate out and remove
  setTimeout(() => {
    toast.classList.remove('toast-show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * Toggle sidebar navigation
 */
function toggleSidebar(): void {
  document.body.classList.toggle('sidebar-open');
}

/**
 * Close sidebar navigation
 */
function closeSidebar(): void {
  document.body.classList.remove('sidebar-open');
}

/**
 * Open user modal (Current User Profile)
 */
function openUserModal(): void {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);

      const nameEl = document.getElementById('modalUserName');
      const roleEl = document.getElementById('modalUserRole');

      if (nameEl) nameEl.textContent = user.name || 'Usuário';
      if (roleEl) roleEl.textContent = formatRole(user.role || '');

      document.body.classList.add('user-modal-open');

      // Close other modals if open
      document.getElementById('userDetailsModal')?.classList.remove('open');
      document.getElementById('userDetailsModalOverlay')?.classList.remove('open');
      // Note: CSS uses class on body for main modal, but details modal might need specific handling if implemented differently.
      // Based on style.css, it uses #userDetailsModal display none/block logic or class 'user-modal-open' on body?
      // style.css uses `body.user-modal-open .user-modal-overlay { display: block; }` which applies to ALL class .user-modal. 
      // This causes overlap. We should handle specific modal IDs visibility if they share the class.
      // Current CSS: .user-modal { pointer-events: none; } .user-modal-overlay { display: none; }
      // body.user-modal-open .user-modal-overlay { display: block } 
      // This enables ALL overlays. We need to refrain from using body class for multiple modals or separate them.
      // For now, I'll use specific ID handling for the DETAILS modal to avoid conflict with the PROFILE modal.
    } catch (error) {
      // console.error('Error parsing user data:', error);
    }
  }
}

/**
 * Close user modal (Current User Profile)
 */
function closeUserModal(): void {
  document.body.classList.remove('user-modal-open');
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
      const response = await fetch(`${ApiService.getBaseUrl()}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
    } catch (e) {
      // console.error("Logout API call failed", e);
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
    'admin': 'Administrador',
    'manager': 'Gerente',
    'waiter': 'Garçom',
    'kitchen': 'Cozinha'
  };
  return roleMap[role] || role;
}

// User Details Modal Logic

function openUserDetailsModal(user: User): void {
  const modal = document.getElementById('userDetailsModal');
  const overlay = document.getElementById('userDetailsModalOverlay');

  if (!modal || !overlay) return;

  // Populate Data
  const avatarEl = document.getElementById('detailsUserAvatar');
  const nameEl = document.getElementById('detailsUserName');
  const roleEl = document.getElementById('detailsUserRole');
  const usernameEl = document.getElementById('detailsUserUsername');
  const idEl = document.getElementById('detailsUserId');
  const editBtn = document.getElementById('detailsEditBtn');

  if (nameEl) nameEl.textContent = user.name || 'Usuário';
  if (roleEl) roleEl.textContent = formatRole(user.role);
  if (usernameEl) usernameEl.textContent = `@${user.username}`;
  if (idEl) idEl.textContent = user.id;

  if (avatarEl) {
    const initials = getInitials(user.name || user.username);
    avatarEl.innerHTML = user.image_url
      ? `<img src="${user.image_url}" alt="${user.name}" class="user-avatar-img" />`
      : `<span class="material-symbols-outlined" style="font-size: 48px; color: var(--color-primary)">account_circle</span>`;
    // Using simpler avatar for modal or reuse the nice initials style if we copy class
    avatarEl.className = 'user-avatar'; // Reset/Ensure class
    if (!user.image_url) {
      avatarEl.innerHTML = `<span class="user-avatar-initials" style="width: 80px; height: 80px; font-size: 32px;">${initials}</span>`;
      avatarEl.style.backgroundColor = 'transparent'; // Remove gray bg if using initials circle
    } else {
      avatarEl.style.backgroundColor = 'var(--bg-secondary)';
    }
  }

  if (editBtn) {
    editBtn.onclick = () => {
      // Navigate to edit page or handle edit
      // For now, simple feedback
      showToast('Funcionalidade de edição completa em desenvolvimento', 'info');
      // window.location.href = `../create_user/createUser.html?id=${user.id}`;
    };
  }

  // Show Modal
  modal.style.display = 'block'; // Override CSS
  modal.style.pointerEvents = 'auto';
  overlay.style.display = 'block';

  // Animate content
  const content = modal.querySelector('.user-modal-content') as HTMLElement;
  if (content) {
    content.style.opacity = '1';
    content.style.transform = 'translate(-50%, -50%) scale(1)';
  }
}

function closeUserDetailsModal(): void {
  const modal = document.getElementById('userDetailsModal');
  const overlay = document.getElementById('userDetailsModalOverlay');

  if (!modal || !overlay) return;

  // Animate out
  const content = modal.querySelector('.user-modal-content') as HTMLElement;
  if (content) {
    content.style.opacity = '0';
    content.style.transform = 'translate(-50%, -50%) scale(0.9)';
  }

  setTimeout(() => {
    modal.style.display = 'none';
    modal.style.pointerEvents = 'none';
    overlay.style.display = 'none';
    // Remove inline styles to verify
    modal.removeAttribute('style');
    overlay.removeAttribute('style');
    if (content) content.removeAttribute('style');
  }, 200);
}


document.addEventListener('DOMContentLoaded', () => {
  const usersGrid = document.getElementById('usersGrid') as HTMLElement | null;
  const searchInput = document.querySelector('.search-input') as HTMLInputElement | null;
  const btnAddUser = document.getElementById('addUserBtn') as HTMLButtonElement | null;

  let users: User[] = [];

  init();

  function init(): void {
    if (!checkAuth()) {
      return;
    }

    initDarkMode();
    setupEventListeners();
    fetchUsers();
  }

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
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
      const icon = darkModeToggle.querySelector('.material-symbols-outlined');
      if (icon) {
        icon.textContent = isDark ? 'dark_mode' : 'light_mode';
      }
    }
  }

  function setupEventListeners(): void {
    // Search
    if (searchInput) {
      searchInput.addEventListener('input', handleSearch);
    }

    // Add user button
    if (btnAddUser) {
      btnAddUser.addEventListener('click', navigateToCreateUser);
    }

    // Header & Navigation
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
      darkModeToggle.addEventListener('click', toggleDarkMode);
    }

    const menuBtn = document.getElementById('menuBtn');
    if (menuBtn) {
      menuBtn.addEventListener('click', toggleSidebar);
    }

    // Sidebar close handlers
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    if (sidebarOverlay) {
      sidebarOverlay.addEventListener('click', closeSidebar);
    }

    const closeSidebarBtn = document.getElementById('closeSidebar');
    if (closeSidebarBtn) {
      closeSidebarBtn.addEventListener('click', closeSidebar);
    }

    // User Profile Modal (Header)
    const userBtn = document.getElementById('userBtn');
    if (userBtn) {
      userBtn.addEventListener('click', openUserModal);
    }

    const userModalOverlay = document.getElementById('userModalOverlay');
    if (userModalOverlay) {
      userModalOverlay.addEventListener('click', closeUserModal);
    }

    const closeUserModalBtn = document.getElementById('closeUserModal');
    if (closeUserModalBtn) {
      closeUserModalBtn.addEventListener('click', closeUserModal);
    }

    // User Details Modal Handlers
    const detailsOverlay = document.getElementById('userDetailsModalOverlay');
    if (detailsOverlay) {
      detailsOverlay.addEventListener('click', closeUserDetailsModal);
    }

    const closeDetailsBtn = document.getElementById('closeUserDetailsModal');
    if (closeDetailsBtn) {
      closeDetailsBtn.addEventListener('click', closeUserDetailsModal);
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', handleLogout);
    }

    // ESC key listeners
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (document.body.classList.contains('sidebar-open')) {
          closeSidebar();
        }
        if (document.body.classList.contains('user-modal-open')) {
          closeUserModal();
        }
        // Close details modal check via checking display style
        const detailsModal = document.getElementById('userDetailsModal');
        if (detailsModal && detailsModal.style.display === 'block') {
          closeUserDetailsModal();
        }
      }
    });

    const logoImage = document.getElementById('logoImage');
    if (logoImage) {
      logoImage.addEventListener('click', () => {
        window.location.href = 'landingPage.html';
      });
    }
  }

  function navigateToCreateUser(): void {
    window.location.href = 'createUser.html';
  }

  async function fetchUsers(): Promise<void> {
    if (usersGrid) {
      usersGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 2rem;">
                <span class="material-symbols-outlined" style="animation: spin 1s linear infinite;">refresh</span>
                <p>Carregando usuários...</p>
            </div>
        `;
    }

    try {
      const response = await fetch(`${ApiService.getBaseUrl()}/users`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (response.ok) {
        users = data.data || [];
        renderUsers(users);
      } else {
        showToast(data.message || 'Erro ao carregar usuários', 'error');
        // Handle 401 Unauthorized
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = 'landingPage.html';
          return;
        }
      }
    } catch (error) {
      // console.error('Error fetching users:', error);
      showToast('Erro de conexão ao carregar usuários', 'error');
      if (usersGrid) usersGrid.innerHTML = '<p class="empty-text">Erro de conexão</p>';
    }
  }

  function renderUsers(items: User[]): void {
    if (!usersGrid) return;

    usersGrid.innerHTML = '';

    if (items.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'empty-state';
      emptyState.innerHTML = `
        <span class="material-symbols-outlined empty-icon">group</span>
        <p class="empty-text">Nenhum usuário encontrado</p>
        <p class="empty-subtext">Adicione usuários para começar</p>
      `;
      usersGrid.appendChild(emptyState);
      return;
    }

    items.forEach((user) => {
      const card = createUserCard(user);
      usersGrid.appendChild(card);
    });
  }

  function createUserCard(user: User): HTMLElement {
    const card = document.createElement('div');
    card.className = 'user-card';

    // Add Click listener for Details Modal
    card.addEventListener('click', () => openUserDetailsModal(user));

    const userName = user.name || user.username || 'Usuário';
    const userRole = formatRole(user.role);
    const initials = getInitials(userName);

    // Use image_url if available, otherwise show initials
    const avatarContent = user.image_url
      ? `<img src="${user.image_url}" alt="${userName}" class="user-avatar-img" />`
      : `<span class="user-avatar-initials">${initials}</span>`;

    card.innerHTML = `
      <button class="btn-card-edit" aria-label="Editar usuário" title="Editar">
        <span class="material-symbols-outlined">edit</span>
      </button>

      <div class="user-avatar-container">
        ${avatarContent}
      </div>
      <div class="user-info">
        <h3 class="user-name">${userName}</h3>
        <p class="user-role-badge">${userRole}</p>
        <p class="user-username">@${user.username}</p>
      </div>
    `;

    // Add Event Listener to Edit Button (Stop Propagation)
    const editBtn = card.querySelector('.btn-card-edit');
    if (editBtn) {
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showToast('Funcionalidade de edição em breve', 'info');
        // navigateToEdit(user.id);
      });
    }

    return card;
  }

  function getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  function handleSearch(e: Event): void {
    const term = (e.target as HTMLInputElement).value.toLowerCase();
    const filtered = users.filter((u) =>
      u.name?.toLowerCase().includes(term) ||
      u.username?.toLowerCase().includes(term) ||
      formatRole(u.role).toLowerCase().includes(term)
    );
    renderUsers(filtered);
  }
});

function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}
