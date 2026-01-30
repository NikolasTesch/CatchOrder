// Create Products Page - JavaScript Functionality

/**
 * Initialize dark mode based on user preference
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
 * Toggle dark mode on/off
 */
function toggleDarkMode() {
  const isDark = document.body.classList.toggle('dark-mode');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  updateDarkModeIcon(isDark);
}

/**
 * Update dark mode toggle button icon
 */
function updateDarkModeIcon(isDark) {
  const darkModeToggle = document.getElementById('darkModeToggle');
  if (darkModeToggle) {
    const icon = darkModeToggle.querySelector('.material-symbols-outlined');
    if (icon) {
      icon.textContent = isDark ? 'dark_mode' : 'light_mode';
    }
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Dark mode toggle
  const darkModeToggle = document.getElementById('darkModeToggle');
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', toggleDarkMode);
  }

  // Back button
  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      console.log('Back button clicked');
      // TODO: Navigate back or to previous page
      window.history.back();
    });
  }

  // User button
  const userBtn = document.getElementById('userBtn');
  if (userBtn) {
    userBtn.addEventListener('click', () => {
      console.log('User profile clicked');
      // TODO: Navigate to user profile
    });
  }

  // Logo click
  const logoImage = document.getElementById('logoImage');
  if (logoImage) {
    logoImage.addEventListener('click', () => {
      console.log('Logo clicked');
      // TODO: Navigate to home
    });
  }

  // Tab switching
  const cadastroTab = document.getElementById('cadastroTab');
  const estoqueTab = document.getElementById('estoqueTab');

  if (cadastroTab) {
    cadastroTab.addEventListener('click', () => {
      setActiveTab('cadastro');
    });
  }

  if (estoqueTab) {
    estoqueTab.addEventListener('click', () => {
      setActiveTab('estoque');
    });
  }
}

/**
 * Set active tab
 */
function setActiveTab(tabName) {
  const cadastroTab = document.getElementById('cadastroTab');
  const estoqueTab = document.getElementById('estoqueTab');

  if (tabName === 'cadastro') {
    cadastroTab?.classList.add('active');
    cadastroTab?.setAttribute('aria-selected', 'true');
    estoqueTab?.classList.remove('active');
    estoqueTab?.setAttribute('aria-selected', 'false');
    // TODO: Show cadastro content
  } else if (tabName === 'estoque') {
    estoqueTab?.classList.add('active');
    estoqueTab?.setAttribute('aria-selected', 'true');
    cadastroTab?.classList.remove('active');
    cadastroTab?.setAttribute('aria-selected', 'false');
    // TODO: Show estoque content
  }
}

// ============== API Integration ==============
const API_BASE = 'http://localhost:3000/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

async function loadCategories() {
  const categorySelect = document.getElementById('category');
  if (!categorySelect) return;

  try {
    const response = await fetch(`${API_BASE}/categories`, { headers: getAuthHeaders() });
    if (!response.ok) return;

    const result = await response.json();
    const categories = result.data || result;

    categorySelect.innerHTML = '<option value="" disabled selected>Selecione a Categoria</option>';
    categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.id;
      option.textContent = cat.name;
      categorySelect.appendChild(option);
    });
  } catch (error) {
    console.error('Error loading categories:', error);
  }
}

function validateProductForm() {
  const name = document.getElementById('name')?.value.trim();
  const price = document.getElementById('price')?.value;
  const category = document.getElementById('category')?.value;
  const errors = [];

  if (!name || name.length < 3) errors.push('Nome deve ter pelo menos 3 caracteres');
  if (!price || parseFloat(price) <= 0) errors.push('Preço deve ser maior que zero');
  if (!category) errors.push('Selecione uma categoria');

  return errors;
}

async function handleProductSubmit() {
  const errors = validateProductForm();
  if (errors.length > 0) {
    showNotification(errors.join('. '), 'error');
    return;
  }

  const productData = {
    name: document.getElementById('name').value.trim(),
    price: parseFloat(document.getElementById('price').value),
    category_id: document.getElementById('category').value,
    is_active: true
  };

  const submitBtn = document.getElementById('submitBtn');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Salvando...';
  }

  try {
    const response = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData)
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Erro ao criar produto');

    showNotification('Produto criado com sucesso!', 'success');
    setTimeout(() => window.history.back(), 1500);
  } catch (error) {
    showNotification(error.message || 'Erro ao criar produto', 'error');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Adicionar produto';
    }
  }
}

function showNotification(message, type = 'info') {
  const existing = document.querySelector('.notification');
  if (existing) existing.remove();

  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);padding:12px 24px;border-radius:8px;display:flex;align-items:center;gap:8px;z-index:1000;box-shadow:0 4px 12px rgba(0,0,0,0.15);';
  notification.style.background = type === 'success' ? '#28a745' : '#dc3545';
  notification.style.color = 'white';
  notification.innerHTML = `<span class="material-symbols-outlined">${type === 'success' ? 'check_circle' : 'error'}</span><span>${message}</span>`;

  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 4000);
}

function setupFormEventListeners() {
  const submitBtn = document.getElementById('submitBtn');
  if (submitBtn) {
    submitBtn.addEventListener('click', handleProductSubmit);
  }

  // Real-time preview
  const nameInput = document.getElementById('name');
  const priceInput = document.getElementById('price');

  const updatePreview = () => {
    const name = nameInput?.value.trim() || 'Nome do prod...';
    const price = priceInput?.value || '0';
    const previewName = document.querySelector('.info-name');
    const previewPrice = document.querySelector('.info-price');
    if (previewName) previewName.textContent = name.length > 15 ? name.substring(0, 15) + '...' : name;
    if (previewPrice) previewPrice.textContent = parseFloat(price || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  if (nameInput) nameInput.addEventListener('input', updatePreview);
  if (priceInput) priceInput.addEventListener('input', updatePreview);
}

/**
 * Initialize page
 */
function init() {
  // Initialize dark mode first (must be before any early returns)
  initDarkMode();
  
  // Setup UI event listeners (must be second)
  setupEventListeners();
  
  // Page-specific initialization
  console.log('Create Products page initialized');
  
  // Load categories from API
  loadCategories();
  
  // Setup form validation and submit handler
  setupFormEventListeners();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
