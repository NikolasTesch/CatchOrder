import { Request, Response } from 'express';
import { getDb } from '../config/database';

class AnalyticsController {

    async getDashboardStats(req: Request, res: Response): Promise<Response> {
        const db = await getDb();
        try {
            const usersCount = await db.get('SELECT COUNT(*) as count FROM users');
            const productsCount = await db.get('SELECT COUNT(*) as count FROM products');
            const tablesCount = await db.get('SELECT COUNT(*) as count FROM tables');
            const openOrdersCount = await db.get("SELECT COUNT(*) as count FROM orders WHERE status = 'OPEN'");

            return res.status(200).json({
                users: usersCount.count,
                products: productsCount.count,
                tables: tablesCount.count,
                openOrders: openOrdersCount.count
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Erro ao buscar estatísticas do dashboard' });
        }
    }

    async getDailySales(req: Request, res: Response): Promise<Response> {
        const db = await getDb();
        try {
            // Assuming closed_at is stored as ISO string, we slice to get YYYY-MM-DD or use sqlite date function
            // SQLite: strftime('%Y-%m-%d', closed_at)
            const result = await db.get(`
            SELECT SUM(total) as total 
            FROM orders 
            WHERE status = 'CLOSED' 
            AND date(closed_at) = date('now')
        `);

            return res.status(200).json({
                total: result.total || 0
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Erro ao buscar vendas do dia' });
        }
    }

    async getTopProducts(req: Request, res: Response): Promise<Response> {
        const db = await getDb();
        try {
            const products = await db.all(`
            SELECT p.name, SUM(oi.quantity) as total_sold
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            JOIN orders o ON oi.order_id = o.id
            WHERE o.status = 'CLOSED'
            GROUP BY p.name
            ORDER BY total_sold DESC
            LIMIT 5
        `);
            return res.status(200).json(products);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Erro ao buscar produtos mais vendidos' });
        }
    }

    async getBiggestSales(req: Request, res: Response): Promise<Response> {
        const db = await getDb();
        try {
            // Assuming we want to show waiter name (user) and table number
            const sales = await db.all(`
              SELECT o.id, o.total, u.name as waiter_name, t.number as table_number, o.closed_at
              FROM orders o
              LEFT JOIN users u ON o.user_id = u.id
              LEFT JOIN tables t ON o.table_id = t.id
              WHERE o.status = 'CLOSED'
              ORDER BY o.total DESC
              LIMIT 5
          `);
            return res.status(200).json(sales);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Erro ao buscar maiores vendas' });
        }
    }

    async getTableStatusStats(req: Request, res: Response): Promise<Response> {
        const db = await getDb();
        try {
            const stats = await db.all(`
              SELECT status, COUNT(*) as count
              FROM tables
              GROUP BY status
          `);

            const result = {
                AVAILABLE: 0,
                OCCUPIED: 0,
                RESERVED: 0
            };

            stats.forEach((item: any) => {
                if (result.hasOwnProperty(item.status)) {
                    (result as any)[item.status] = item.count;
                }
            });

            return res.status(200).json(result);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Erro ao buscar status das mesas' });
        }
    }

    async getRecentOrders(req: Request, res: Response): Promise<Response> {
        const db = await getDb();
        try {
            const orders = await db.all(`
              SELECT o.id, t.number as table_number, o.status, o.total, o.opened_at
              FROM orders o
              LEFT JOIN tables t ON o.table_id = t.id
              ORDER BY o.opened_at DESC
              LIMIT 10
          `);
            return res.status(200).json(orders);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Erro ao buscar pedidos recentes' });
        }
    }
}

export default new AnalyticsController();
