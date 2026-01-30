import './style.css';

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
  ) as HTMLElement | null; // The card button

  let products: Product[] = [];

  init();

  function init(): void {
    setupEventListeners();
    fetchProducts();
  }

  function setupEventListeners(): void {
    if (searchInput) {
      searchInput.addEventListener('input', handleSearch);
    }

    if (btnAddProduct) {
      btnAddProduct.addEventListener('click', navigateToCreate);
    }

    if (btnAddCard) {
      btnAddCard.addEventListener('click', navigateToCreate);
    }
  }

  function navigateToCreate(): void {
    window.location.href = '../createProducts.html';
  }

  async function fetchProducts(): Promise<void> {
    try {
      const response = await fetch('http://localhost:3000/products');
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

    // Keep the "Add New" card ??
    // Actually, typically we clear everything or keep the Add button.
    // The HTML structure has the Add Card *inside* the grid?
    // Let's re-create the Add Card dynamically as the first or last item.
    // Based on HTML, it was mixed. Let's make it the FIRST item for visibility.

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
