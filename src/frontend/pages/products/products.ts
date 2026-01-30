require('./style.css');

interface Product {
  id: string;
  name: string;
  category_id: string;
  price: number;
  image_path?: string;
  is_active: boolean;
}

document.addEventListener('DOMContentLoaded', () => {
  const productsGrid = document.getElementById(
    'products-grid',
  ) as HTMLElement | null;
  const searchInput = document.querySelector(
    '.search-input',
  ) as HTMLInputElement | null;
  const btnAddProduct = document.querySelector(
    '.btn-add-product',
  ) as HTMLButtonElement | null;
  const btnAddCard = document.getElementById(
    'btn-add-product',
  ) as HTMLElement | null;

  let products: Product[] = [];

  init();

  function init(): void {
    initDarkMode();
    setupEventListeners();
    fetchProducts();
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
    // Search & Products
    if (searchInput) {
      searchInput.addEventListener('input', handleSearch);
    }

    if (btnAddProduct) {
      btnAddProduct.addEventListener('click', navigateToCreate);
    }

    if (btnAddCard) {
      btnAddCard.addEventListener('click', navigateToCreate);
    }

    // Header & Navigation
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
      darkModeToggle.addEventListener('click', toggleDarkMode);
    }

    const menuBtn = document.getElementById('menuBtn');
    if (menuBtn) {
      menuBtn.addEventListener('click', () => {
        console.log('Menu clicked');
        // TODO: Implement menu navigation
      });
    }

    const userBtn = document.getElementById('userBtn');
    if (userBtn) {
      userBtn.addEventListener('click', () => {
        console.log('User profile clicked');
        // TODO: Navigate to profile
      });
    }

    const logoImage = document.getElementById('logoImage');
    if (logoImage) {
      logoImage.addEventListener('click', () => {
        window.location.href = '../landing_page/landingPage.html';
      });
    }
  }

  function navigateToCreate(): void {
    window.location.href = '../create_products/createProducts.html';
  }

  async function fetchProducts(): Promise<void> {
    try {
      const response = await fetch('http://localhost:3000/api/products');
      const data = await response.json();

      if (response.ok) {
        products = data.data || [];
        renderProducts(products);
      } else {
        console.error('Failed to fetch products:', data.message);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  }

  function renderProducts(items: Product[]): void {
    if (!productsGrid) return;

    productsGrid.innerHTML = '';

    // Add "Add New" card
    const addCard = document.createElement('div');
    addCard.className = 'product-card add-card';
    addCard.id = 'btn-add-product-card';
    addCard.innerHTML =
      '<span class="material-symbols-outlined add-icon">add</span>';
    addCard.addEventListener('click', navigateToCreate);
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
    const card = document.createElement('div');
    card.className = 'product-card';

    // Placeholder image if none
    const bgImage = product.image_path
      ? `url('${product.image_path}')`
      : 'none';
    const bgColor = product.image_path ? 'transparent' : '#eee';

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
