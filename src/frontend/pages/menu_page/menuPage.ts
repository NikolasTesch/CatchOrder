import './style.css';
import { ApiService } from '../../services/apiService';

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

interface CartItem {
  product: Product;
  quantity: number;
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

  // Cart Elements
  private floatingCartBtn: HTMLElement;
  private cartModal: HTMLElement;
  private closeCartBtn: HTMLElement;
  private cartItemsListEl: HTMLElement;
  private cartCountEl: HTMLElement;
  private cartTotalEl: HTMLElement;
  private modalTotalEl: HTMLElement;
  private confirmOrderBtn: HTMLButtonElement;

  private products: Product[] = [];
  private categories: Category[] = [];
  private activeCategoryId: string | 'all' = 'all';
  private cart: CartItem[] = [];

  constructor() {
    this.categoryListEl = document.getElementById('categoryList') as HTMLElement;
    this.productsGridEl = document.getElementById('productsGrid') as HTMLElement;
    this.tableNumberEl = document.getElementById('tableNumber') as HTMLElement;
    this.searchInput = document.getElementById('searchInput') as HTMLInputElement;

    // Cart Elements Initialization
    this.floatingCartBtn = document.getElementById('floatingCartBtn') as HTMLElement;
    this.cartModal = document.getElementById('cartModal') as HTMLElement;
    this.closeCartBtn = document.getElementById('closeCartBtn') as HTMLElement;
    this.cartItemsListEl = document.getElementById('cartItemsList') as HTMLElement;
    this.cartCountEl = document.getElementById('cartCount') as HTMLElement;
    this.cartTotalEl = document.getElementById('cartTotal') as HTMLElement;
    this.modalTotalEl = document.getElementById('modalTotal') as HTMLElement;
    this.confirmOrderBtn = document.getElementById('confirmOrderBtn') as HTMLButtonElement;

    this.init();
  }

  private async init() {
    if (!this.checkSession()) return;

    this.renderTableInfo();
    this.setupEventListeners();
    this.updateCartUI(); // Initial hidden state

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
      window.location.href = '/pages/tablePage.html';
      return false;
    }
    return true;
  }

  private renderTableInfo() {
    const tableId = sessionStorage.getItem(STORAGE_KEYS.TABLE);
    if (this.tableNumberEl && tableId) {
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

    // Event Delegation for Products Grid
    if (this.productsGridEl) {
      this.productsGridEl.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const card = target.closest('.product-card') as HTMLElement;

        if (card) {
          const productId = card.dataset.id;
          if (productId) {
            const product = this.products.find(p => p.id === productId);
            if (product) {
              this.addToCart(product);

              // Visual feedback on the button if it exists
              const btn = card.querySelector('.btn-add') as HTMLElement;
              if (btn) {
                btn.classList.add('clicked');
                setTimeout(() => btn.classList.remove('clicked'), 200);
              }

              // Optional: Feedback on card
              card.style.transform = 'scale(0.98)';
              setTimeout(() => card.style.transform = '', 150);
            }
          }
        }
      });
    }

    // Cart Modal Toggles
    if (this.floatingCartBtn) {
      this.floatingCartBtn.addEventListener('click', () => this.openCart());
    }
    if (this.closeCartBtn) {
      this.closeCartBtn.addEventListener('click', () => this.closeCart());
    }
    if (this.cartModal) {
      this.cartModal.addEventListener('click', (e) => {
        if (e.target === this.cartModal) this.closeCart();
      });
    }

    // Confirm Order (Mock)
    // Confirm Order
    if (this.confirmOrderBtn) {
      this.confirmOrderBtn.addEventListener('click', () => this.submitOrder());
    }
  }

  private async submitOrder() {
    if (this.cart.length === 0) return;

    const tableId = sessionStorage.getItem(STORAGE_KEYS.TABLE);
    if (!tableId) {
      this.showError('Erro: Mesa não identificada.');
      return;
    }

    this.confirmOrderBtn.disabled = true;
    this.confirmOrderBtn.textContent = 'Enviando...';

    try {
      // 1. Check/Create Order
      let orderId: string;

      // Try to find open order for this table
      try {
        const allOrders = await ApiService.get<{ data: any[] }>('/orders');
        const openOrder = allOrders.data.find((o: any) => o.table_id === tableId && o.status === 'OPEN');
        if (openOrder) {
          orderId = openOrder.id;
        } else {
          // Create new order
          // Use a default service user ID since menuPage is public
          const defaultUserId = '140e6988-51f7-418b-96c2-05452d3999e5';
          const newOrder = await ApiService.post<{ data: any }>('/orders', {
            table_id: tableId,
            user_id: defaultUserId
          });
          orderId = newOrder.data.id;
        }
      } catch (err) {
        // If getting orders fails, try creating one directly?
        // Or assume we can't search. Let's try create.
        const defaultUserId = '140e6988-51f7-418b-96c2-05452d3999e5';
        const newOrder = await ApiService.post<{ data: any }>('/orders', {
          table_id: tableId,
          user_id: defaultUserId
        });
        orderId = newOrder.data.id;
      }

      // 2. Add Items
      for (const item of this.cart) {
        await ApiService.post(`/orders/${orderId}/items`, {
          product_id: item.product.id,
          quantity: item.quantity
        });
      }

      // Success
      alert('Pedido enviado com sucesso!');
      this.cart = [];
      this.updateCartUI();
      this.closeCart();

    } catch (error) {
      console.error('Error submitting order', error);
      alert('Erro ao enviar pedido. Tente novamente.');
    } finally {
      this.confirmOrderBtn.disabled = false;
      this.confirmOrderBtn.innerHTML = '<i class="fa-solid fa-check"></i> Confirmar Pedido';
    }
  }

  private openCart() {
    this.renderCartItems();
    this.cartModal.classList.add('open');
    // document.body.style.overflow = 'hidden'; // Removed for sidebar
  }

  private closeCart() {
    this.cartModal.classList.remove('open');
    // document.body.style.overflow = ''; // Removed for sidebar
  }

  private async fetchCategories() {
    try {
      const response = await ApiService.get<{ data: Category[] }>('/categories');
      this.categories = response.data || [];
    } catch (error) {
      console.warn('Could not load categories', error);
    }
  }

  private async fetchProducts() {
    try {
      const response = await ApiService.get<{ data: any[] }>('/products/active');
      const data = response.data || [];

      if (Array.isArray(data)) {
        this.products = data.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          imageUrl: p.image_path,
          categoryId: p.category_id,
          active: p.is_active === 1 || p.is_active === true
        }));
      }
    } catch (error) {
      throw error;
    }
  }

  /* Cart Logic */
  private addToCart(product: Product) {
    const existingItem = this.cart.find(item => item.product.id === product.id);

    if (existingItem) {
      existingItem.quantity++;
    } else {
      this.cart.push({ product, quantity: 1 });
    }

    this.updateCartUI();
  }

  private updateQuantity(productId: string, change: number) {
    const itemIndex = this.cart.findIndex(item => item.product.id === productId);
    if (itemIndex === -1) return;

    const item = this.cart[itemIndex];
    const newQuantity = item.quantity + change;

    if (newQuantity <= 0) {
      this.cart.splice(itemIndex, 1);
    } else {
      item.quantity = newQuantity;
    }

    this.updateCartUI();
    if (this.cartModal.classList.contains('open')) {
      this.renderCartItems();
    }
  }

  private updateCartUI() {
    const totalCount = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = this.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    // Update Floating Button
    if (this.floatingCartBtn) {
      // Show/Hide based on cart content
      this.floatingCartBtn.style.display = totalCount > 0 ? 'block' : 'none';
    }

    if (this.cartCountEl) {
      this.cartCountEl.textContent = totalCount.toString();
    }

    const formattedPrice = this.formatPrice(totalPrice);
    if (this.cartTotalEl) this.cartTotalEl.textContent = formattedPrice;
    if (this.modalTotalEl) this.modalTotalEl.textContent = formattedPrice;

    if (this.confirmOrderBtn) {
      this.confirmOrderBtn.disabled = totalCount === 0;
    }

    // Always render items for sidebar
    this.renderCartItems();
  }

  private renderCartItems() {
    if (!this.cartItemsListEl) return;
    this.cartItemsListEl.innerHTML = '';

    if (this.cart.length === 0) {
      this.cartItemsListEl.innerHTML = `
        <div class="empty-cart-message">
          <i class="fa-solid fa-basket-shopping"></i>
          <p>Seu carrinho está vazio</p>
        </div>
      `;
      return;
    }

    this.cart.forEach(item => {
      const el = document.createElement('div');
      el.className = 'cart-item';

      el.innerHTML = `
        <div class="cart-item-info">
          <span class="cart-item-title">${item.product.name}</span>
          <span class="cart-item-price">${this.formatPrice(item.product.price)}</span>
        </div>
        <div class="cart-item-controls">
          <button class="btn-qty btn-minus"><i class="fa-solid fa-minus"></i></button>
          <span class="qty-display">${item.quantity}</span>
          <button class="btn-qty btn-plus"><i class="fa-solid fa-plus"></i></button>
        </div>
      `;

      // Event Listeners for quantity buttons
      el.querySelector('.btn-minus')?.addEventListener('click', () => this.updateQuantity(item.product.id, -1));
      el.querySelector('.btn-plus')?.addEventListener('click', () => this.updateQuantity(item.product.id, 1));

      this.cartItemsListEl.appendChild(el);
    });
  }

  private formatPrice(cents: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
  }

  /* Rendering Logic */
  private renderCategories() {
    if (!this.categoryListEl) return;

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

    if (this.activeCategoryId !== 'all') {
      filtered = filtered.filter(p => p.categoryId === this.activeCategoryId);
    }

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
      card.dataset.id = product.id;

      const imageUrl = product.imageUrl || 'https://placehold.co/400x300/1e1e1e/FFF?text=No+Image';
      const categoryObj = this.categories.find(c => c.id === product.categoryId);
      const categoryName = categoryObj ? categoryObj.name : 'Geral';

      card.innerHTML = `
        <div class="card-image-wrapper">
          <img src="${imageUrl}" alt="${product.name}" loading="lazy">
        </div>
        <div class="card-content">
          <span class="product-category">${categoryName}</span>
          <h3 class="product-title">${product.name}</h3>
          <p class="product-description">${product.description || 'Sem descrição.'}</p>
          <div class="card-footer">
            <span class="product-price">${this.formatPrice(product.price)}</span>
            <button class="btn-add" data-id="${product.id}" aria-label="Adicionar ao pedido">
              <i class="fa-solid fa-plus"></i>
            </button>
          </div>
        </div>
      `;

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
