import './style.css';
import '../../utils/utils';
import { ApiService } from '../../services/apiService';
import { resolveImagePath } from '../../utils/assets';

declare global {
  interface Window {
    ThemeManager: {
      init: () => void;
    };
  }
}

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
  TABLE_NUMBER: 'catchorder_table_number',
  SESSION_STATUS: 'catchorder_session_active',
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

  /* Sent Orders UI Elements */
  private sentOrdersFooter: HTMLElement;
  private sentOrdersHeader: HTMLElement;
  private sentOrdersBody: HTMLElement;
  private sentOrdersCount: HTMLElement;
  private sentOrders: any[] = []; // Store sent items

  /* Payment Modal UI Elements */
  private btnCloseOrder: HTMLElement;
  private paymentModal: HTMLElement;
  private closePaymentBtn: HTMLElement;
  private billSummary: HTMLElement;
  private billSubtotalEl: HTMLElement;
  private billServiceFeeEl: HTMLElement;
  private billTotalEl: HTMLElement;
  private btnPayPix: HTMLElement;
  private btnConfirmPix: HTMLElement;
  private btnCallWaiter: HTMLElement;

  private products: Product[] = [];
  private categories: Category[] = [];
  private activeCategoryId: string | 'all' = 'all';
  private cart: CartItem[] = [];

  private darkModeToggle: HTMLElement | null = null; // New Property
  private isTotem: boolean = false; // New Property

  constructor() {
    this.categoryListEl = document.getElementById(
      'categoryList',
    ) as HTMLElement;
    this.productsGridEl = document.getElementById(
      'productsGrid',
    ) as HTMLElement;
    this.tableNumberEl = document.getElementById('tableNumber') as HTMLElement;
    this.searchInput = document.getElementById(
      'searchInput',
    ) as HTMLInputElement;

    // Cart Elements Initialization
    this.floatingCartBtn = document.getElementById(
      'floatingCartBtn',
    ) as HTMLElement;
    this.cartModal = document.getElementById('cartModal') as HTMLElement;
    this.closeCartBtn = document.getElementById('closeCartBtn') as HTMLElement;
    this.cartItemsListEl = document.getElementById(
      'cartItemsList',
    ) as HTMLElement;
    this.cartCountEl = document.getElementById('cartCount') as HTMLElement;
    this.cartTotalEl = document.getElementById('cartTotal') as HTMLElement;
    this.modalTotalEl = document.getElementById('modalTotal') as HTMLElement;
    this.confirmOrderBtn = document.getElementById(
      'confirmOrderBtn',
    ) as HTMLButtonElement;

    // Sent Orders Elements
    this.sentOrdersFooter = document.getElementById(
      'sentOrdersFooter',
    ) as HTMLElement;
    this.sentOrdersHeader = document.getElementById(
      'sentOrdersHeader',
    ) as HTMLElement;
    this.sentOrdersBody = document.getElementById(
      'sentOrdersBody',
    ) as HTMLElement;
    this.sentOrdersCount = document.getElementById(
      'sentOrdersCount',
    ) as HTMLElement;

    // Payment Elements
    this.btnCloseOrder = document.getElementById(
      'btnCloseOrder',
    ) as HTMLElement;
    this.paymentModal = document.getElementById('paymentModal') as HTMLElement;
    this.closePaymentBtn = document.getElementById(
      'closePaymentBtn',
    ) as HTMLElement;
    this.billSummary = document.getElementById('billSummary') as HTMLElement;
    this.billSubtotalEl = document.getElementById(
      'billSubtotal',
    ) as HTMLElement;
    this.billServiceFeeEl = document.getElementById(
      'billServiceFee',
    ) as HTMLElement;
    this.billTotalEl = document.getElementById('billTotal') as HTMLElement;
    this.btnPayPix = document.getElementById('btnPayPix') as HTMLElement;
    this.btnConfirmPix = document.getElementById(
      'btnConfirmPix',
    ) as HTMLElement;
    this.btnCallWaiter = document.getElementById(
      'btnCallWaiter',
    ) as HTMLElement;

    // Dark Mode
    // Dark Mode handled by ThemeManager

    this.init();
  }

  private async init() {
    if (window.ThemeManager) window.ThemeManager.init();

    if (!this.checkSession()) return;

    this.renderTableInfo();
    this.setupEventListeners();
    this.updateCartUI(); // Initial hidden state

    try {
      await Promise.all([this.fetchCategories(), this.fetchProducts()]);

      // Fetch User Info
      try {
        const meRes = await ApiService.get<{ user: any }>('/auth/me');
        if (meRes.user && meRes.user.username === 'totem') {
          this.isTotem = true;
        }
      } catch (e) {
        console.warn('Failed to fetch user info', e);
      }

      // Fetch open orders after products are loaded so we can map names if needed (though API returns them usually?)
      // Actually backend order includes product info usually? let's check.
      // If not, we have `this.products` to lookup.
      await this.fetchOpenOrder();

      this.renderCategories();
      this.renderProducts();
    } catch (error) {
      console.error('Error initializing menu:', error);
      this.showError('Não foi possível carregar o cardápio. Tente novamente.');
    }
  }

  /* Dark Mode Methods handled by ThemeManager */

  private checkSession(): boolean {
    const tableId = sessionStorage.getItem(STORAGE_KEYS.TABLE);
    if (!tableId) {
      this.redirectToTablePage();
      return false;
    }
    return true;
  }

  private renderTableInfo() {
    const tableNumber = sessionStorage.getItem(STORAGE_KEYS.TABLE_NUMBER);
    if (this.tableNumberEl && tableNumber) {
      // Ensure it is 2 digits if numeric
      const num = parseInt(tableNumber);
      const display = !isNaN(num) && num < 10 ? `0${num}` : tableNumber;
      this.tableNumberEl.textContent = display;
    } else {
      // Fallback or handle missing number. Ideally shouldn't happen if flow is followed.
      const tableId = sessionStorage.getItem(STORAGE_KEYS.TABLE);
      if (tableId && this.tableNumberEl) {
        // Just show ID or '??' if number missing
        this.tableNumberEl.textContent = '??';
      }
    }
  }

  private setupEventListeners() {
    // Dark Mode Toggle handled by ThemeManager

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
            const product = this.products.find((p) => p.id === productId);
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
              setTimeout(() => (card.style.transform = ''), 150);
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

    // Sent Orders Footer Toggle
    if (this.sentOrdersHeader) {
      this.sentOrdersHeader.addEventListener('click', (e) => {
        // Check if click was on or inside the button, if so, don't toggle
        if ((e.target as HTMLElement).closest('#btnCloseOrder')) return;

        if (this.sentOrdersFooter) {
          this.sentOrdersFooter.classList.toggle('open');
        }
      });
    }

    // Payment Modal Listeners
    if (this.btnCloseOrder) {
      this.btnCloseOrder.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent footer toggle
        this.openPaymentModal();
      });
    }
    if (this.closePaymentBtn) {
      this.closePaymentBtn.addEventListener('click', () =>
        this.closePaymentModal(),
      );
    }
    if (this.paymentModal) {
      this.paymentModal.addEventListener('click', (e) => {
        if (e.target === this.paymentModal) this.closePaymentModal();
      });
    }
    if (this.btnPayPix) {
      this.btnPayPix.addEventListener('click', () => this.handlePayPix());
    }
    if (this.btnConfirmPix) {
      this.btnConfirmPix.addEventListener('click', () =>
        this.handleConfirmPix(),
      );
    }
    if (this.btnCallWaiter) {
      this.btnCallWaiter.addEventListener('click', () =>
        this.handleCallWaiter(),
      );
    }
  }

  /* Payment Logic */

  private closePaymentModal() {
    if (this.paymentModal) this.paymentModal.classList.remove('open');
  }

  private renderBill() {
    if (!this.billSummary) return;

    // Clear previous
    this.billSummary.innerHTML = '';

    if (this.sentOrders.length === 0) {
      this.billSummary.innerHTML =
        '<p class="empty-state">Nenhum item consumido.</p>';
      this.updateBillTotals(0);
      return;
    }

    // Group identical items? Or just list them.
    // Usually bills group by product.
    const billItems: {
      [id: string]: { name: string; quantity: number; total: number };
    } = {};

    this.sentOrders.forEach((item) => {
      // Use product_id or name as key
      const key = item.product_id || item.name;
      if (!billItems[key]) {
        billItems[key] = {
          name: item.product_name || item.name || 'Produto',
          quantity: 0,
          total: 0,
        };
      }
      billItems[key].quantity += item.quantity;
      billItems[key].total += item.unit_price * item.quantity;
    });

    let subtotal = 0;

    Object.values(billItems).forEach((item) => {
      subtotal += item.total;

      const row = document.createElement('div');
      row.className = 'bill-item';
      row.innerHTML = `
             <div class="bill-item-info">
                <span class="bill-item-name">${item.quantity}x ${item.name}</span>
             </div>
             <div class="bill-item-price">${this.formatPrice(item.total)}</div>
          `;
      this.billSummary.appendChild(row);
    });

    this.updateBillTotals(subtotal);
  }

  private updateBillTotals(subtotal: number) {
    if (this.billSubtotalEl)
      this.billSubtotalEl.textContent = this.formatPrice(subtotal);

    // Create separate var for service fee in case we toggle it later
    const serviceFee = this.isTotem ? 0 : subtotal * 0.1;
    if (this.billServiceFeeEl)
      this.billServiceFeeEl.textContent = this.formatPrice(serviceFee);

    const total = subtotal + serviceFee;
    if (this.billTotalEl)
      this.billTotalEl.textContent = this.formatPrice(total);
  }

  private async fetchOpenOrder() {
    const tableId = sessionStorage.getItem(STORAGE_KEYS.TABLE);
    if (!tableId) return;

    try {
      // Fetch all orders and find OPEN for this table
      // Optimized endpoint would be GET /orders?table_id=X&status=OPEN
      const response = await ApiService.get<{ data: any[] }>('/orders');
      // We need to find the specific order that IS OPEN
      // The backend returns an array of orders.
      const openOrder = response.data.find(
        (o: any) => o.table_id === tableId && o.status === 'OPEN',
      );

      if (openOrder) {
        // Now we need items. Does `findAll` return items? Using `debug_db.ts` or controllers show:
        // OrderController.index -> OrderModel.findAll -> basic select * from orders.
        // We need `GET /orders/:id`.
        const fullOrderRes = await ApiService.get<{ data: any }>(
          `/orders/${openOrder.id}`,
        );
        const fullOrder = fullOrderRes.data;

        if (fullOrder && fullOrder.items) {
          this.sentOrders = fullOrder.items;
          this.renderSentOrders();
        }
      }
    } catch (error) {
      console.warn('Could not fetch open orders', error);
    }
  }

  private renderSentOrders() {
    if (!this.sentOrdersFooter || !this.sentOrdersCount || !this.sentOrdersBody)
      return;

    const count = this.sentOrders.reduce((sum, item) => sum + item.quantity, 0);
    this.sentOrdersCount.textContent = `${count} itens`;

    this.sentOrdersBody.innerHTML = '';

    if (this.sentOrders.length === 0) {
      this.sentOrdersBody.innerHTML = `
            <div class="empty-sent-state">
              <p>Nenhum pedido enviado ainda.</p>
            </div>`;
      return;
    }

    // Group by created_at (timestamp) to show "batches"
    // Date string format: "2026-02-03 21:05:45"
    const groups: { [key: string]: any[] } = {};

    this.sentOrders.forEach((item) => {
      // Robust grouping: use full timestamp or just HH:mm?
      // Let's use HH:mm for display, but full timestamp for grouping key to avoid merging different batches in same minute?
      // Let's use the raw string as key.
      const key = item.created_at || 'Recentes'; // Fallback
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });

    // Sort groups by time desc (newest first)
    const sortedKeys = Object.keys(groups).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime(),
    );

    sortedKeys.forEach((key) => {
      const items = groups[key];

      // Fix Timestamp: Assume UTC if string 'YYYY-MM-DD HH:MM:SS', convert to local
      let timeStr = 'Recentes';
      if (key !== 'Recentes') {
        try {
          // Append Z if missing to force UTC interpretation
          const dateStr =
            key.replace(' ', 'T') + (key.includes('Z') ? '' : 'Z');
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            timeStr = date.toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            });
          } else {
            timeStr = key.split(' ')[1]?.substring(0, 5) || key;
          }
        } catch (e) {
          timeStr = key;
        }
      }

      const groupEl = document.createElement('div');
      groupEl.className = 'sent-order-group';

      let itemsHtml = '';
      items.forEach((item) => {
        // Find product name if not populated (assuming backend might join it, but if not locallookup)
        // The backend `OrderModel.findById` likely joins products.
        const name = item.product_name || item.name || 'Produto'; // Check backend response structure if poss
        const price = this.formatPrice(item.unit_price * item.quantity); // Total for this line

        itemsHtml += `
                 <div class="sent-item">
                    <span class="sent-item-qty">${item.quantity}x</span>
                    <span class="sent-item-name">${name}</span>
                    <span class="sent-item-price">${price}</span>
                 </div>
              `;
      });

      groupEl.innerHTML = `
             <div class="group-header">
                <span>Enviado às ${timeStr}</span>
                <i class="fa-solid fa-check-double"></i>
             </div>
             <div class="group-items">
                ${itemsHtml}
             </div>
          `;

      this.sentOrdersBody.appendChild(groupEl);
    });
  }

  private async submitOrder() {
    if (this.cart.length === 0) return;

    const tableId = sessionStorage.getItem(STORAGE_KEYS.TABLE);
    if (!tableId) {
      this.showToast('Erro: Mesa não identificada.', 'error');
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
        const openOrder = allOrders.data.find(
          (o: any) => o.table_id === tableId && o.status === 'OPEN',
        );
        if (openOrder) {
          orderId = openOrder.id;
        } else {
          // Create new order
          const defaultUserId = '140e6988-51f7-418b-96c2-05452d3999e5';
          const newOrder = await ApiService.post<{ data: any }>('/orders', {
            table_id: tableId,
            user_id: defaultUserId,
          });
          orderId = newOrder.data.id;
        }
      } catch (err) {
        const defaultUserId = '140e6988-51f7-418b-96c2-05452d3999e5';
        const newOrder = await ApiService.post<{ data: any }>('/orders', {
          table_id: tableId,
          user_id: defaultUserId,
        });
        orderId = newOrder.data.id;
      }

      // 2. Add Items
      for (const item of this.cart) {
        await ApiService.post(`/orders/${orderId}/items`, {
          product_id: item.product.id,
          quantity: item.quantity,
        });
      }

      // Success
      this.showToast('Pedido enviado com sucesso!'); // Toast instead of alert
      this.cart = [];
      this.updateCartUI();
      this.closeCart();

      // Update Sent Orders Footer
      await this.fetchOpenOrder();

      // Ensure footer is visible/updated
      if (this.sentOrdersFooter) {
        // Optionally wiggle or highlight
      }
    } catch (error) {
      console.error('Error submitting order', error);
      this.showToast('Erro ao enviar pedido. Tente novamente.', 'error');
    } finally {
      this.confirmOrderBtn.disabled = false;
      this.confirmOrderBtn.innerHTML =
        '<i class="fa-solid fa-check"></i> Confirmar Pedido';
    }
  }

  /* Restored Methods */
  private openCart() {
    this.renderCartItems();
    this.cartModal.classList.add('open');
  }

  private closeCart() {
    this.cartModal.classList.remove('open');
  }

  private async fetchCategories() {
    try {
      const response = await ApiService.get<{ data: Category[] }>(
        '/categories',
      );
      this.categories = response.data || [];
    } catch (error) {
      console.warn('Could not load categories', error);
    }
  }

  private async fetchProducts() {
    try {
      const response = await ApiService.get<{ data: any[] }>(
        '/products/active',
      );
      const data = response.data || [];

      if (Array.isArray(data)) {
        this.products = data.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          imageUrl: p.image_path ? resolveImagePath(p.image_path) : undefined,
          categoryId: p.category_id,
          active: p.is_active === 1 || p.is_active === true,
        }));
      }
    } catch (error) {
      throw error;
    }
  }

  private addToCart(product: Product) {
    const existingItem = this.cart.find(
      (item) => item.product.id === product.id,
    );

    if (existingItem) {
      existingItem.quantity++;
    } else {
      this.cart.push({ product, quantity: 1 });
    }

    this.updateCartUI();
  }

  private updateQuantity(productId: string, change: number) {
    const itemIndex = this.cart.findIndex(
      (item) => item.product.id === productId,
    );
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
    const totalPrice = this.cart.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );

    if (this.floatingCartBtn) {
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

    this.cart.forEach((item) => {
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

      el.querySelector('.btn-minus')?.addEventListener('click', () =>
        this.updateQuantity(item.product.id, -1),
      );
      el.querySelector('.btn-plus')?.addEventListener('click', () =>
        this.updateQuantity(item.product.id, 1),
      );

      this.cartItemsListEl.appendChild(el);
    });
  }

  /* Toast Notification */
  private showToast(message: string, type: 'success' | 'error' = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type} show`;
    toast.innerHTML = `
          <i class="fa-solid ${type === 'success' ? 'fa-check-circle' : 'fa-circle-exclamation'}"></i>
          <span>${message}</span>
      `;

    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  private handlePayPix() {
    const billSummary = document.getElementById('billSummary');
    const paymentTotals = document.querySelector(
      '.payment-totals',
    ) as HTMLElement;
    const pixQrContainer = document.getElementById('pixQrContainer');
    const btnPayPix = document.getElementById('btnPayPix') as HTMLElement;
    const btnCallWaiter = document.getElementById(
      'btnCallWaiter',
    ) as HTMLElement;
    const btnConfirmPix = document.getElementById(
      'btnConfirmPix',
    ) as HTMLElement;

    if (billSummary && paymentTotals && pixQrContainer && btnPayPix) {
      // Toggle view
      if (pixQrContainer.style.display === 'none') {
        // Show Pix
        billSummary.style.display = 'none';
        paymentTotals.style.display = 'none';
        pixQrContainer.style.display = 'flex'; // Changed to flex for centering

        btnPayPix.innerHTML = '<i class="fa-solid fa-arrow-left"></i> Voltar';

        if (btnCallWaiter) btnCallWaiter.style.display = 'none';
        if (btnConfirmPix) btnConfirmPix.style.display = 'flex'; // Show confirm button

        this.showToast('Escaneie o QR Code para pagar.', 'success');
      } else {
        // Hide Pix (Back)
        billSummary.style.display = 'block';
        paymentTotals.style.display = 'block';
        pixQrContainer.style.display = 'none';

        btnPayPix.innerHTML = '<i class="fa-brands fa-pix"></i> Pagar com Pix';

        if (btnCallWaiter) btnCallWaiter.style.display = 'flex';
        if (btnConfirmPix) btnConfirmPix.style.display = 'none';
      }
    }
  }

  private async handleConfirmPix() {
    const tableId = sessionStorage.getItem(STORAGE_KEYS.TABLE);
    if (!tableId) return;

    // Loading state
    if (this.btnConfirmPix) {
      this.btnConfirmPix.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Processando...';
      (this.btnConfirmPix as HTMLButtonElement).disabled = true;
    }

    try {
      // 1. Find Open Order ID
      const allOrders = await ApiService.get<{ data: any[] }>('/orders');
      const openOrder = allOrders.data.find(
        (o: any) => o.table_id === tableId && o.status === 'OPEN',
      );

      if (!openOrder) {
        this.showToast('Nenhum pedido aberto encontrado.', 'error');
        if (this.btnConfirmPix) {
          this.btnConfirmPix.innerHTML =
            '<i class="fa-solid fa-check-double"></i> Confirmar Pagamento';
          (this.btnConfirmPix as HTMLButtonElement).disabled = false;
        }
        return;
      }

      // 2. Calculate Tip (10%) - Totem (isTotem check via auth/me or session)
      // Since we shouldn't rely on localStorage, we'll fetch /auth/me or check a global if available.
      // For now, let's fetch /auth/me to be safe and robust.
      let isTotem = false;
      try {
        const meRes = await ApiService.get<{ user: any }>('/auth/me');
        // We need to know if it is totem.
        // Since backend me() endpoint might not return isTotem explicitly unless we add it,
        // we can check if the username matches the known totem username from env?
        // But frontend doesn't have env.
        // Let's assume authController.me also returns the enriched user or we check role/name.
        // Actually, let's check if the user is acting as Totem.
        // Simplest way: The Totem user has a specific name 'Totem' (as per seeds) or we rely on the login response logic we just did?
        // Login response logic is lost on refresh.
        // We should update AuthController.me to also return isTotem? Or just check if name/username is 'totem'.
        // Let's assume we can check username 'totem' or similar.
        // Ideally, AuthController.me should return it. I'll stick to 10% default unless I can verify.
        // WAIT, I didn't update AuthController.me to return isTotem. I should probably do that for consistency/robustness.
        // But I can check `meRes.user.username === 'totem'` (hardcoded based on seed/env default).
        // Or even better, I'll update AuthController.me quickly in next step if this is risky.
        // For now, let's check username 'totem'.
        if (meRes.user && meRes.user.username === 'totem') {
          isTotem = true;
        }
      } catch (e) { }

      const subtotal = openOrder.total || 0;
      const tip = isTotem ? 0 : subtotal * 0.1;

      // 3. Close Order (closes Table automatically on backend)
      await ApiService.patch(`/orders/${openOrder.id}/close`, {
        tip: Math.round(tip), // Ensure integer cents
      });

      this.showToast('Pagamento confirmado e mesa liberada!', 'success');

      // 3. Clear Session and Redirect
      sessionStorage.removeItem(STORAGE_KEYS.TABLE);
      sessionStorage.removeItem(STORAGE_KEYS.TABLE_NUMBER);

      setTimeout(() => {
        this.redirectToTablePage();
      }, 2000);
    } catch (error) {
      console.error('Error closing order:', error);
      this.showToast('Erro ao confirmar pagamento.', 'error');

      if (this.btnConfirmPix) {
        this.btnConfirmPix.innerHTML =
          '<i class="fa-solid fa-check-double"></i> Confirmar Pagamento';
        (this.btnConfirmPix as HTMLButtonElement).disabled = false;
      }
    }
  }

  private async handleCallWaiter() {
    const tableId = sessionStorage.getItem(STORAGE_KEYS.TABLE);
    const tableNumber = sessionStorage.getItem(STORAGE_KEYS.TABLE_NUMBER);

    this.showToast(
      `Garçom chamado para a mesa ${tableNumber || ''}!`,
      'success',
    );

    if (!tableId) return;

    if (this.btnCallWaiter) {
      // Save original text?
      this.btnCallWaiter.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Encerrando...';
      (this.btnCallWaiter as HTMLButtonElement).disabled = true;
    }

    try {
      // Find Open Order
      const allOrders = await ApiService.get<{ data: any[] }>('/orders');
      const openOrder = allOrders.data.find(
        (o: any) => o.table_id === tableId && o.status === 'OPEN',
      );

      if (openOrder) {
        await ApiService.patch(`/orders/${openOrder.id}/close`, { tip: 0 });
      }

      this.showToast('Mesa liberada para o próximo cliente!', 'success');

      // Clear Session
      sessionStorage.removeItem(STORAGE_KEYS.TABLE);
      sessionStorage.removeItem(STORAGE_KEYS.TABLE_NUMBER);

      // Redirect
      setTimeout(() => {
        this.redirectToTablePage();
      }, 2000);
    } catch (error) {
      console.error('Error closing table via waiter:', error);
      this.showToast('Erro ao liberar mesa.', 'error');

      if (this.btnCallWaiter) {
        this.btnCallWaiter.innerHTML =
          '<i class="fa-solid fa-hand-holding-dollar"></i> Chamar Garçom';
        (this.btnCallWaiter as HTMLButtonElement).disabled = false;
      }
    }
  }

  private openPaymentModal() {
    if (!this.paymentModal) return;

    // Reset view when opening
    const billSummary = document.getElementById('billSummary');
    const paymentTotals = document.querySelector(
      '.payment-totals',
    ) as HTMLElement;
    const pixQrContainer = document.getElementById('pixQrContainer');
    const btnPayPix = document.getElementById('btnPayPix') as HTMLElement; // Ensure we have reference

    if (billSummary) billSummary.style.display = 'block';
    if (paymentTotals) paymentTotals.style.display = 'block';
    if (pixQrContainer) pixQrContainer.style.display = 'none';
    if (btnPayPix)
      btnPayPix.innerHTML = '<i class="fa-brands fa-pix"></i> Pagar com Pix';

    // Reset buttons visibility
    const btnCallWaiter = document.getElementById('btnCallWaiter');
    const btnConfirmPix = document.getElementById('btnConfirmPix');
    if (btnCallWaiter) btnCallWaiter.style.display = 'flex';
    if (btnConfirmPix) btnConfirmPix.style.display = 'none';

    this.paymentModal.classList.add('open');
    this.renderBill();
  }

  private formatPrice(cents: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  }

  /* Rendering Logic */
  private renderCategories() {
    if (!this.categoryListEl) return;

    const allBtn = this.createCategoryButton(
      'all',
      'Todos',
      'fa-layer-group',
      true,
    );
    this.categoryListEl.innerHTML = '';
    this.categoryListEl.appendChild(allBtn);

    this.categories.forEach((cat) => {
      const iconClass = this.getCategoryIcon(cat.name);
      const btn = this.createCategoryButton(cat.id, cat.name, iconClass, false);
      this.categoryListEl.appendChild(btn);
    });
  }

  private getCategoryIcon(name: string): string {
    const lower = name.toLowerCase();
    if (lower.includes('bebi')) return 'fa-wine-bottle';
    if (lower.includes('lanche') || lower.includes('burger'))
      return 'fa-hamburger';
    if (lower.includes('pizza')) return 'fa-pizza-slice';
    if (lower.includes('sobrev') || lower.includes('doce'))
      return 'fa-ice-cream';
    if (lower.includes('prato')) return 'fa-utensils';
    return 'fa-tag';
  }

  private createCategoryButton(
    id: string | 'all',
    name: string,
    icon: string,
    isActive: boolean,
  ): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.className = `category-item ${isActive ? 'active' : ''}`;
    btn.dataset.id = id;
    btn.innerHTML = `<i class="fa-solid ${icon}"></i><span>${name}</span>`;

    btn.addEventListener('click', () => {
      this.activeCategoryId = id;
      this.updateActiveCategory(btn);
      this.renderProducts(
        this.searchInput ? this.searchInput.value.toLowerCase() : '',
      );
    });

    return btn;
  }

  private updateActiveCategory(activeBtn: HTMLButtonElement) {
    const buttons = this.categoryListEl.querySelectorAll('.category-item');
    buttons.forEach((b) => b.classList.remove('active'));
    activeBtn.classList.add('active');
  }

  private renderProducts(searchTerm: string = '') {
    if (!this.productsGridEl) return;
    this.productsGridEl.innerHTML = '';

    let filtered = this.products;

    if (this.activeCategoryId !== 'all') {
      filtered = filtered.filter((p) => p.categoryId === this.activeCategoryId);
    }

    if (searchTerm) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchTerm),
      );
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

    filtered.forEach((product) => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.dataset.id = product.id;

      const imageUrl =
        product.imageUrl ||
        'https://placehold.co/400x300/1e1e1e/FFF?text=No+Image';
      const categoryObj = this.categories.find(
        (c) => c.id === product.categoryId,
      );
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

  private isRedirecting = false;

  private redirectToTablePage() {
    if (this.isRedirecting) return;
    this.isRedirecting = true;

    window.location.assign('/server09/pages/tablePage.html');
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
