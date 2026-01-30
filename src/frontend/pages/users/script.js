// Users Page - JavaScript Functionality
// Displays and manages system users with backend integration

const API_BASE = '/api';

// State management
let users = [];
let searchTerm = '';

// DOM Elements
const searchInput = document.querySelector('.search-input');
const addButton = document.querySelector('.add-btn');
const usersList = document.querySelector('.users-list');
const darkModeToggle = document.getElementById('darkModeToggle');
const menuBtn = document.getElementById('menuBtn');
const userBtn = document.getElementById('userBtn');
const logoImage = document.getElementById('logoImage');

/**
 * Initialize page
 */
async function init() {
  initDarkMode();
  await loadUsers();
  renderUsers();
  setupEventListeners();
}

/**
 * Initialize dark mode
 */
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

/**
 * Toggle dark mode
 */
function toggleDarkMode() {
  const isDark = document.body.classList.toggle('dark-mode');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  updateDarkModeIcon(isDark);
}

/**
 * Update dark mode icon
 */
function updateDarkModeIcon(isDark) {
  if (darkModeToggle) {
    const icon = darkModeToggle.querySelector('.material-symbols-outlined');
    if (icon) {
      icon.textContent = isDark ? 'dark_mode' : 'light_mode';
    }
  }
}

/**
 * Load users from API
 */
async function loadUsers() {
  try {
    const response = await fetch(`${API_BASE}/users`);
    if (!response.ok) throw new Error('Erro ao carregar usuários');
    
    const data = await response.json();
    users = data.data || [];
  } catch (error) {
    console.error('Erro ao carregar usuários:', error);
    showError('Erro ao carregar usuários');
  }
}

/**
 * Render users list
 */
function renderUsers() {
  const filteredUsers = filterUsers();
  
  // Clear existing user cards
  usersList.innerHTML = '';
  
  if (filteredUsers.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.className = 'empty-message';
    emptyMessage.textContent = searchTerm 
      ? 'Nenhum usuário encontrado' 
      : 'Nenhum usuário cadastrado';
    usersList.appendChild(emptyMessage);
    return;
  }
  
  filteredUsers.forEach(user => {
    const card = createUserCard(user);
    usersList.appendChild(card);
  });
}

/**
 * Filter users by search term
 */
function filterUsers() {
  if (!searchTerm) return users;
  
  const term = searchTerm.toLowerCase();
  return users.filter(user => 
    user.name?.toLowerCase().includes(term) ||
    user.username?.toLowerCase().includes(term) ||
    user.role?.toLowerCase().includes(term)
  );
}

/**
 * Create user card element
 */
function createUserCard(user) {
  const card = document.createElement('div');
  card.className = 'user-card';
  card.dataset.userId = user.id;
  
  const userName = user.name || user.username || 'Usuário';
  const userRole = getRoleLabel(user.role);
  
  card.innerHTML = `
    <div class="user-avatar">${getUserAvatarContent(user)}</div>
    <div class="user-info">
      <h3 class="user-name">${userName} (${userRole})</h3>
      <p class="user-email">@${user.username || 'username'}</p>
    </div>
    <button class="btn-config" data-user-id="${user.id}">
      Configurar
      <span class="material-symbols-outlined">chevron_right</span>
    </button>
  `;
  
  // Add click handler to config button
  const configButton = card.querySelector('.btn-config');
  configButton.addEventListener('click', () => handleConfigUser(user));
  
  return card;
}

/**
 * Get user avatar content
 */
function getUserAvatarContent(user) {
  if (user.photo_url) {
    return `<img src="${user.photo_url}" alt="${user.username}" />`;
  }
  // Default placeholder with initials
  const initials = getUserInitials(user.username);
  return `<span class="avatar-initials">${initials}</span>`;
}

/**
 * Get user initials for avatar
 */
function getUserInitials(name) {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

/**
 * Get role label in Portuguese
 */
function getRoleLabel(role) {
  const labels = {
    'admin': 'Administrador',
    'garçom': 'Garçom',
    'cozinha': 'Cozinha'
  };
  return labels[role] || role;
}

/**
 * Handle configure user
 */
function handleConfigUser(user) {
  // Show modal or navigate to edit page
  const actions = [
    { label: 'Editar usuário', action: () => editUser(user) },
    { label: 'Excluir usuário', action: () => deleteUser(user), danger: true }
  ];
  
  showActionModal(user, actions);
}

/**
 * Show action modal
 */
function showActionModal(user, actions) {
  // Create modal overlay
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  
  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  
  modalContent.innerHTML = `
    <h3 class="modal-title">${user.name || user.username}</h3>
    <p class="modal-subtitle">@${user.username}</p>
  `;
  
  // Add action buttons
  actions.forEach(action => {
    const button = document.createElement('button');
    button.className = action.danger ? 'modal-btn modal-btn-danger' : 'modal-btn modal-btn-primary';
    button.textContent = action.label;
    button.addEventListener('click', () => {
      modal.remove();
      action.action();
    });
    
    modalContent.appendChild(button);
  });
  
  // Add cancel button
  const cancelButton = document.createElement('button');
  cancelButton.className = 'modal-btn modal-btn-cancel';
  cancelButton.textContent = 'Cancelar';
  cancelButton.addEventListener('click', () => modal.remove());
  modalContent.appendChild(cancelButton);
  
  modal.appendChild(modalContent);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
  
  document.body.appendChild(modal);
}

/**
 * Edit user
 */
function editUser(user) {
  // Navigate to edit page (could be a modal or separate page)
  showSuccess(`Edição de ${user.username} será implementada`);
  // In a real implementation:
  // window.location.href = `/edit_user/editUser.html?user_id=${user.id}`;
}

/**
 * Delete user
 */
async function deleteUser(user) {
  const confirmed = confirm(`Deseja realmente excluir o usuário ${user.username}?`);
  if (!confirmed) return;
  
  try {
    const response = await fetch(`${API_BASE}/users/${user.id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao excluir usuário');
    }
    
    showSuccess(`Usuário ${user.username} excluído com sucesso`);
    
    // Reload users list
    await loadUsers();
    renderUsers();
    
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    showError(error.message || 'Erro ao excluir usuário');
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Dark mode toggle
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', toggleDarkMode);
  }
  
  // Menu button
  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      console.log('Menu clicked');
    });
  }
  
  // User button
  if (userBtn) {
    userBtn.addEventListener('click', () => {
      console.log('User profile clicked');
    });
  }
  
  // Logo
  if (logoImage) {
    logoImage.addEventListener('click', () => {
      console.log('Logo clicked');
    });
  }
  
  // Search functionality
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value.trim();
      renderUsers();
    });
  }
  
  // Add button
  if (addButton) {
    addButton.addEventListener('click', () => {
      window.location.href = '/create_user/createUser.html';
    });
  }
}

/**
 * Show success message
 */
function showSuccess(message) {
  const toast = document.createElement('div');
  toast.className = 'toast toast-success';
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('toast-out');
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
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('toast-out');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
