import { getDb } from '../config/database';

export interface HourlySalesDTO {
  hour: string;
  revenue: number;
  count: number;
}

export interface ProductPerformanceDTO {
  id: string;
  name: string;
  category_name: string;
  total_sold: number;
  revenue: number;
}

export interface WaiterPerformanceDTO {
  id: string;
  name: string;
  total_sales: number;
  total_tips: number;
  orders_count: number;
}

export interface DashboardSummaryDTO {
  total_revenue: number;
  total_orders: number;
  average_ticket: number;
}

export class MetricsModel {
  static async getHourlySales(
    startDate: string,
    endDate: string,
  ): Promise<HourlySalesDTO[]> {
    const db = await getDb();
    // Group by hour of day (00-23)
    // SQLite's strftime('%H', opened_at) extracts the hour
    const query = `
      SELECT 
        strftime('%H', opened_at) as hour,
        SUM(total) as revenue,
        COUNT(id) as count
      FROM orders
      WHERE status = 'CLOSED'
        AND opened_at BETWEEN ? AND ?
      GROUP BY hour
      ORDER BY hour ASC
    `;

    const results = await db.all<HourlySalesDTO[]>(query, [startDate, endDate]);
    return results;
  }

  static async getProductPerformance(
    startDate: string,
    endDate: string,
  ): Promise<ProductPerformanceDTO[]> {
    const db = await getDb();
    const query = `
      SELECT 
        p.id,
        p.name,
        c.name as category_name,
        SUM(oi.quantity) as total_sold,
        SUM(oi.quantity * oi.unit_price) as revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      WHERE o.status = 'CLOSED'
        AND o.opened_at BETWEEN ? AND ?
      GROUP BY p.id
      ORDER BY revenue DESC
    `;

    return db.all<ProductPerformanceDTO[]>(query, [startDate, endDate]);
  }

  static async getWaiterPerformance(
    startDate: string,
    endDate: string,
  ): Promise<WaiterPerformanceDTO[]> {
    const db = await getDb();
    const query = `
      SELECT 
        u.id,
        u.name,
        SUM(o.total) as total_sales,
        SUM(o.tip) as total_tips,
        COUNT(o.id) as orders_count
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.status = 'CLOSED'
        AND o.opened_at BETWEEN ? AND ?
      GROUP BY u.id
      ORDER BY total_sales DESC
    `;

    return db.all<WaiterPerformanceDTO[]>(query, [startDate, endDate]);
  }

  static async getSummary(
    startDate: string,
    endDate: string,
  ): Promise<DashboardSummaryDTO> {
    const db = await getDb();
    const query = `
      SELECT 
        COALESCE(SUM(total), 0) as total_revenue,
        COUNT(id) as total_orders
      FROM orders
      WHERE status = 'CLOSED'
        AND opened_at BETWEEN ? AND ?
    `;

    const result = await db.get<{ total_revenue: number; total_orders: number }>(
      query,
      [startDate, endDate],
    );

    if (!result || result.total_orders === 0) {
      return {
        total_revenue: 0,
        total_orders: 0,
        average_ticket: 0,
      };
    }

    return {
      total_revenue: result.total_revenue,
      total_orders: result.total_orders,
      average_ticket: Math.round(result.total_revenue / result.total_orders),
    };
  }
}
