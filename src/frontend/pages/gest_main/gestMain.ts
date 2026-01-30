interface StatData {
    users: number;
    products: number;
    tables: number;
    openOrders: number;
}

interface DailySalesData {
    total: number;
}

interface TableStatusData {
    AVAILABLE: number;
    OCCUPIED: number;
    RESERVED: number;
}

interface OrderData {
    id: string;
    table_number: number | null;
    status: string;
    total: number;
    opened_at: string;
}

interface ProductSalesData {
    name: string;
    total_sold: number;
}

interface BiggestSaleData {
    id: string;
    total: number;
    waiter_name: string | null;
    table_number: number | null;
    closed_at: string;
}

document.addEventListener('DOMContentLoaded', async () => {
    // Only run if we are on the dashboard page
    const dashboardSection = document.getElementById('dashboard-section');
    if (!dashboardSection) return;

    await loadDashboardData();

    // Optional: Refresh every 60 seconds
    setInterval(loadDashboardData, 60000);
});

async function loadDashboardData() {
    try {
        await Promise.all([
            fetchStats(),
            fetchDailySales(),
            fetchTableStatus(),
            fetchRecentOrders(),
            fetchTopProducts(),
            fetchBiggestSales()
        ]);
    } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
    }
}

async function fetchStats() {
    try {
        const response = await fetch('/api/analytics/stats');
        if (!response.ok) throw new Error('Falha ao buscar estatísticas');
        const data: StatData = await response.json();

        updateElement('totalUsers', data.users.toString());
        updateElement('totalProducts', data.products.toString());
        updateElement('totalTables', data.tables.toString());
        updateElement('totalOrders', data.openOrders.toString());
    } catch (error) {
        console.error(error);
        updateElement('totalUsers', '-');
        updateElement('totalProducts', '-');
        updateElement('totalTables', '-');
        updateElement('totalOrders', '-');
    }
}

async function fetchDailySales() {
    try {
        const response = await fetch('/api/analytics/daily-sales');
        if (!response.ok) throw new Error('Falha ao buscar vendas do dia');
        const data: DailySalesData = await response.json();

        updateElement('dailySales', formatCurrency(data.total));
    } catch (error) {
        console.error(error);
        updateElement('dailySales', 'R$ 0,00');
    }
}

async function fetchTableStatus() {
    try {
        const response = await fetch('/api/analytics/table-status');
        if (!response.ok) throw new Error('Falha ao buscar status das mesas');
        const data: TableStatusData = await response.json();

        updateElement('availableTables', data.AVAILABLE.toString());
        updateElement('occupiedTables', data.OCCUPIED.toString());
        updateElement('reservedTables', data.RESERVED.toString());
    } catch (error) {
        console.error(error);
        updateElement('availableTables', '-');
        updateElement('occupiedTables', '-');
        updateElement('reservedTables', '-');
    }
}

async function fetchRecentOrders() {
    try {
        const response = await fetch('/api/analytics/recent-orders');
        if (!response.ok) throw new Error('Falha ao buscar pedidos recentes');
        const data: OrderData[] = await response.json();

        const listContainer = document.getElementById('recentOrders');
        if (!listContainer) return;

        if (data.length === 0) {
            listContainer.innerHTML = '<p class="empty-text">Nenhum pedido recente.</p>';
            return;
        }

        listContainer.innerHTML = data.map(order => `
            <div class="recent-item">
                <div class="recent-item-header">
                    <span class="recent-item-id">#${order.id.slice(0, 8)}</span>
                    <span class="recent-item-status" style="background: var(--color-secondary); color: white;">${translateStatus(order.status)}</span>
                </div>
                <div class="recent-item-info">
                    Mesa ${order.table_number || 'N/A'} - ${new Date(order.opened_at).toLocaleTimeString()}
                </div>
                <div class="recent-item-info" style="margin-top: 4px; font-weight: bold; color: var(--color-primary);">
                    ${formatCurrency(order.total)}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error(error);
        const listContainer = document.getElementById('recentOrders');
        if (listContainer) listContainer.innerHTML = '<p class="error-text">Erro ao carregar pedidos.</p>';
    }
}

async function fetchTopProducts() {
    try {
        const response = await fetch('/api/analytics/top-products');
        if (!response.ok) throw new Error('Falha ao buscar top produtos');
        const data: ProductSalesData[] = await response.json();

        const listContainer = document.getElementById('topProducts');
        if (!listContainer) return;

        if (data.length === 0) {
            listContainer.innerHTML = '<p class="empty-text">Nenhum produto vendido.</p>';
            return;
        }

        listContainer.innerHTML = data.map((product, index) => `
             <div class="recent-item">
                <div class="recent-item-header">
                    <span class="recent-item-id">${index + 1}. ${product.name}</span>
                    <span class="recent-item-status" style="background: var(--color-primary); color: white;">${product.total_sold} un.</span>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error(error);
        const listContainer = document.getElementById('topProducts');
        if (listContainer) listContainer.innerHTML = '<p class="error-text">Erro ao carregar produtos.</p>';
    }
}

async function fetchBiggestSales() {
    try {
        const response = await fetch('/api/analytics/biggest-sales');
        if (!response.ok) throw new Error('Falha ao buscar maiores vendas');
        const data: BiggestSaleData[] = await response.json();

        const listContainer = document.getElementById('biggestSales');
        if (!listContainer) return;

        if (data.length === 0) {
            listContainer.innerHTML = '<p class="empty-text">Nenhuma venda registrada.</p>';
            return;
        }

        listContainer.innerHTML = data.map(sale => `
            <div class="recent-item">
                <div class="recent-item-header">
                    <span class="recent-item-id" style="font-size: 1rem; color: var(--color-primary);">${formatCurrency(sale.total)}</span>
                     <span class="recent-item-info">${new Date(sale.closed_at).toLocaleDateString()}</span>
                </div>
                 <div class="recent-item-info">
                    Mesa ${sale.table_number || 'N/A'} - ${sale.waiter_name || 'Desconhecido'}
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error(error);
        const listContainer = document.getElementById('biggestSales');
        if (listContainer) listContainer.innerHTML = '<p class="error-text">Erro ao carregar vendas.</p>';
    }
}


// Helpers
function updateElement(id: string, value: string) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function translateStatus(status: string): string {
    const map: { [key: string]: string } = {
        'OPEN': 'Aberto',
        'CLOSED': 'Fechado',
        'CANCELLED': 'Cancelado'
    };
    return map[status] || status;
}
