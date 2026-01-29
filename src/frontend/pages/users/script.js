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

/**
 * Initialize page
 */
async function init() {
  await loadUsers();
  renderUsers();
  setupEventListeners();
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
    emptyMessage.textContent = searchTerm 
      ? 'Nenhum usuário encontrado' 
      : 'Nenhum usuário cadastrado';
    emptyMessage.style.cssText = 'text-align: center; padding: 2rem; color: var(--neutral-60);';
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
    <div class="user-avatar" style="${getUserAvatarStyle(user)}"></div>
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
 * Get user avatar style
 */
function getUserAvatarStyle(user) {
  if (user.photo_url) {
    return `background-image: url('${user.photo_url}'); background-size: cover; background-position: center;`;
  }
  // Default placeholder with initials
  const initials = getUserInitials(user.username);
  return `
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--primary-50, #f0f9ff);
    color: var(--primary-500, #0ea5e9);
    font-weight: 600;
    font-size: 1.25rem;
  `;
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
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    animation: fadeIn 0.2s ease;
  `;
  
  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    min-width: 300px;
    max-width: 400px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  `;
  
  modalContent.innerHTML = `
    <h3 style="margin: 0 0 1rem 0; font-size: 1.25rem;">${user.name || user.username}</h3>
    <p style="margin: 0 0 1.5rem 0; color: #666;">@${user.username}</p>
  `;
  
  // Add action buttons
  actions.forEach(action => {
    const button = document.createElement('button');
    button.textContent = action.label;
    button.style.cssText = `
      width: 100%;
      padding: 0.75rem;
      margin-bottom: 0.5rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1rem;
      background: ${action.danger ? '#ef4444' : '#0ea5e9'};
      color: white;
      transition: opacity 0.2s ease;
    `;
    
    button.addEventListener('mouseover', () => button.style.opacity = '0.8');
    button.addEventListener('mouseout', () => button.style.opacity = '1');
    button.addEventListener('click', () => {
      modal.remove();
      action.action();
    });
    
    modalContent.appendChild(button);
  });
  
  // Add cancel button
  const cancelButton = document.createElement('button');
  cancelButton.textContent = 'Cancelar';
  cancelButton.style.cssText = `
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
    background: white;
    color: #666;
  `;
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
  // Search functionality
  searchInput.addEventListener('input', (e) => {
    searchTerm = e.target.value.trim();
    renderUsers();
  });
  
  // Add button
  addButton.addEventListener('click', () => {
    window.location.href = '/create_user/createUser.html';
  });
}

/**
 * Show success message
 */
function showSuccess(message) {
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
