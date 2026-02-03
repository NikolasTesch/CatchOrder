import './style.css';

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  categoryId: string;
  active: boolean;
}

const STORAGE_KEYS = {
  TABLE: 'catchorder_table_id',
  SESSION_STATUS: 'catchorder_session_active'
};

class MenuController {
  private categoryListEl: HTMLElement;
  private productsGridEl: HTMLElement;
  private tableNumberEl: HTMLElement;
  private searchInput: HTMLInputElement;

  private products: Product[] = [];
  private categories: Category[] = [];
  private activeCategoryId: string | 'all' = 'all';

  constructor() {
    this.categoryListEl = document.getElementById('categoryList') as HTMLElement;
    this.productsGridEl = document.getElementById('productsGrid') as HTMLElement;
    this.tableNumberEl = document.getElementById('tableNumber') as HTMLElement;
    this.searchInput = document.getElementById('searchInput') as HTMLInputElement;

    this.init();
  }

  private async init() {
    if (!this.checkSession()) return;

    this.renderTableInfo();
    this.setupEventListeners();

    try {
      await Promise.all([
        this.fetchCategories(),
        this.fetchProducts()
      ]);

      this.renderCategories();
      this.renderProducts();
    } catch (error) {
      console.error('Error initializing menu:', error);
      this.showError('Não foi possível carregar o cardápio. Tente novamente.');
    }
  }

  private checkSession(): boolean {
    const tableId = sessionStorage.getItem(STORAGE_KEYS.TABLE);
    if (!tableId) {
      // Redirect back to table selection if no table is selected
      window.location.href = '/pages/tablePage.html';
      return false;
    }
    return true;
  }

  private renderTableInfo() {
    const tableId = sessionStorage.getItem(STORAGE_KEYS.TABLE);
    if (this.tableNumberEl && tableId) {
      // Formats 1 -> 01
      this.tableNumberEl.textContent = parseInt(tableId) < 10 ? `0${tableId}` : tableId;
    }
  }

  private setupEventListeners() {
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        const term = (e.target as HTMLInputElement).value.toLowerCase();
        this.filterProducts(term);
      });
    }
  }

  private async fetchCategories() {
    try {
      const response = await fetch('http://localhost:3000/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');

      const json = await response.json();
      // Backend returns { message: string, data: Category[] }
      const data = json.data || json;

      if (Array.isArray(data)) {
        this.categories = data.map((c: any) => ({
          id: c.id,
          name: c.name
        }));
      }
    } catch (error) {
      console.warn('Could not load categories', error);
      // Proceed even if categories fail, just show "All"
    }
  }

  private async fetchProducts() {
    try {
      const response = await fetch('http://localhost:3000/api/products/active');
      if (!response.ok) throw new Error('Failed to fetch products');

      const json = await response.json();
      // Backend returns { message: string, data: ProductDTO[] }
      const data = json.data || json;

      if (Array.isArray(data)) {
        this.products = data.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          // Extract/Map snake_case from DB to camelCase for frontend
          imageUrl: p.image_path,
          categoryId: p.category_id,
          active: p.is_active === 1 || p.is_active === true
        }));
      }
    } catch (error) {
      throw error;
    }
  }

  private renderCategories() {
    if (!this.categoryListEl) return;

    // Start with "All" button
    const allBtn = this.createCategoryButton('all', 'Todos', 'fa-layer-group', true);
    this.categoryListEl.innerHTML = '';
    this.categoryListEl.appendChild(allBtn);

    this.categories.forEach(cat => {
      const iconClass = this.getCategoryIcon(cat.name);
      const btn = this.createCategoryButton(cat.id, cat.name, iconClass, false);
      this.categoryListEl.appendChild(btn);
    });
  }

  private getCategoryIcon(name: string): string {
    const lower = name.toLowerCase();
    if (lower.includes('bebi')) return 'fa-wine-bottle';
    if (lower.includes('lanche') || lower.includes('burger')) return 'fa-hamburger';
    if (lower.includes('pizza')) return 'fa-pizza-slice';
    if (lower.includes('sobrev') || lower.includes('doce')) return 'fa-ice-cream';
    if (lower.includes('prato')) return 'fa-utensils';
    return 'fa-tag';
  }

  private createCategoryButton(id: string | 'all', name: string, icon: string, isActive: boolean): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.className = `category-item ${isActive ? 'active' : ''}`;
    btn.dataset.id = id;
    btn.innerHTML = `<i class="fa-solid ${icon}"></i><span>${name}</span>`;

    btn.addEventListener('click', () => {
      this.activeCategoryId = id;
      this.updateActiveCategory(btn);
      this.renderProducts(this.searchInput ? this.searchInput.value.toLowerCase() : '');
    });

    return btn;
  }

  private updateActiveCategory(activeBtn: HTMLButtonElement) {
    const buttons = this.categoryListEl.querySelectorAll('.category-item');
    buttons.forEach(b => b.classList.remove('active'));
    activeBtn.classList.add('active');
  }

  private renderProducts(searchTerm: string = '') {
    if (!this.productsGridEl) return;
    this.productsGridEl.innerHTML = '';

    let filtered = this.products;

    // Filter by Category
    if (this.activeCategoryId !== 'all') {
      filtered = filtered.filter(p => p.categoryId === this.activeCategoryId);
    }

    // Filter by Search
    if (searchTerm) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm));
    }

    if (filtered.length === 0) {
      this.productsGridEl.innerHTML = `
        <div class="empty-state">
           <i class="fa-regular fa-face-sad-tear"></i>
           <p>Nenhum produto encontrado.</p>
        </div>
      `;
      return;
    }

    filtered.forEach(product => {
      const card = document.createElement('div');
      card.className = 'product-card';

      const imageUrl = product.imageUrl || 'https://placehold.co/400x300/1e1e1e/FFF?text=No+Image';

      // Look up category name safely
      const categoryObj = this.categories.find(c => c.id === product.categoryId);
      const categoryName = categoryObj ? categoryObj.name : 'Geral';

      const priceFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price / 100);

      card.innerHTML = `
        <div class="card-image-wrapper">
          <img src="${imageUrl}" alt="${product.name}" loading="lazy">
        </div>
        <div class="card-content">
          <span class="product-category">${categoryName}</span>
          <h3 class="product-title">${product.name}</h3>
          <p class="product-description">${product.description || 'Sem descrição.'}</p>
          <div class="card-footer">
            <span class="product-price">${priceFormatted}</span>
            <button class="btn-add" aria-label="Adicionar ao pedido">
              <i class="fa-solid fa-plus"></i>
            </button>
          </div>
        </div>
      `;

      // Helper to add to cart (console log for now)
      const addBtn = card.querySelector('.btn-add');
      addBtn?.addEventListener('click', () => {
        console.log('Add to cart:', product);
        // Animation feedback
        addBtn.classList.add('clicked');
        setTimeout(() => addBtn.classList.remove('clicked'), 200);
      });

      this.productsGridEl.appendChild(card);
    });
  }

  private filterProducts(term: string) {
    this.renderProducts(term);
  }

  private showError(msg: string) {
    if (this.productsGridEl) {
      this.productsGridEl.innerHTML = `<div style="text-align:center; padding: 2rem; color: #ff6b6b">${msg}</div>`;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new MenuController();
});
