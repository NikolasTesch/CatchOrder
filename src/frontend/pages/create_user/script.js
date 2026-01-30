// Create User Page - JavaScript Functionality
// Form for creating new users with backend integration

const API_BASE = '/api';

// DOM Elements
const closeButton = document.querySelector('.close-button');
const fullNameInput = document.getElementById('full-name');
const passwordInput = document.getElementById('password');
const roleInput = document.getElementById('role');
const saveButton = document.querySelector('.btn-primary');
const photoCircle = document.querySelector('.photo-circle');

// State
let selectedPhoto = null;

/**
 * Initialize page
 */
function init() {
  setupEventListeners();
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Close button
  closeButton.addEventListener('click', () => {
    window.history.back();
  });
  
  // Photo upload
  photoCircle.addEventListener('click', handlePhotoUpload);
  
  // Save button
  saveButton.addEventListener('click', handleSaveUser);
  
  // Enter key on inputs
  [fullNameInput, passwordInput, roleInput].forEach(input => {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleSaveUser();
      }
    });
  });
}

/**
 * Handle photo upload
 */
function handlePhotoUpload() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  
  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError('Imagem muito grande. Máximo: 5MB');
      return;
    }
    
    // Preview image
    const reader = new FileReader();
    reader.onload = (event) => {
      photoCircle.style.backgroundImage = `url('${event.target.result}')`;
      photoCircle.style.backgroundSize = 'cover';
      photoCircle.style.backgroundPosition = 'center';
      photoCircle.querySelector('.camera-icon').style.display = 'none';
      selectedPhoto = file;
    };
    reader.readAsDataURL(file);
  });
  
  input.click();
}

/**
 * Validate form data
 */
function validateForm() {
  const errors = [];
  
  // Name validation
  const name = fullNameInput.value.trim();
  if (!name || name.length < 3) {
    errors.push('Nome deve ter pelo menos 3 caracteres');
  }
  
  // Password validation
  const password = passwordInput.value;
  if (!password || password.length < 6) {
    errors.push('Senha deve ter pelo menos 6 caracteres');
  }
  
  // Role validation
  const role = roleInput.value.trim().toLowerCase();
  const validRoles = ['admin', 'garçom', 'cozinha', 'garcom'];
  if (!role || !validRoles.includes(role)) {
    errors.push('Cargo inválido. Use: admin, garçom ou cozinha');
  }
  
  return errors;
}

/**
 * Handle save user
 */
async function handleSaveUser() {
  const errors = validateForm();
  
  if (errors.length > 0) {
    showError(errors[0]);
    return;
  }
  
  saveButton.disabled = true;
  saveButton.textContent = 'Salvando...';
  
  try {
    // Prepare user data
    const name = fullNameInput.value.trim();
    const userData = {
      name: name,
      username: name.toLowerCase().replace(/\s+/g, '_'),
      password: passwordInput.value,
      role: normalizeRole(roleInput.value.trim().toLowerCase())
    };
    
    // Create user
    const response = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao criar usuário');
    }
    
    const data = await response.json();
    
    // If photo was selected, upload it (if endpoint exists)
    if (selectedPhoto && data.data?.id) {
      await uploadUserPhoto(data.data.id, selectedPhoto);
    }
    
    showSuccess('Usuário criado com sucesso!');
    
    // Redirect after 2 seconds
    setTimeout(() => {
      window.location.href = '/users/users.html';
    }, 2000);
    
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    showError(error.message || 'Erro ao criar usuário. Tente novamente.');
    saveButton.disabled = false;
    saveButton.textContent = 'Salvar';
  }
}

/**
 * Normalize role to database format
 */
function normalizeRole(role) {
  const roleMap = {
    'garçom': 'garçom',
    'garcom': 'garçom',
    'admin': 'admin',
    'cozinha': 'cozinha'
  };
  return roleMap[role] || role;
}

/**
 * Upload user photo (if endpoint exists)
 */
async function uploadUserPhoto(userId, file) {
  try {
    const formData = new FormData();
    formData.append('photo', file);
    
    const response = await fetch(`${API_BASE}/users/${userId}/photo`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      console.warn('Foto não pôde ser enviada');
    }
  } catch (error) {
    console.warn('Erro ao enviar foto:', error);
    // Don't show error to user, photo upload is optional
  }
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
