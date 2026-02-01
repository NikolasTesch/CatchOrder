import { getDb } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import type {
  OrderDTO,
  CreateOrderDTO,
  UpdateOrderDTO,
  OrderItemDTO,
} from '../../shared/dtos/orderDto';
import { TableModel } from './tableModel';
import { TableStatus } from '../../shared/types/table';

export class OrderModel {
  static async findAll(): Promise<OrderDTO[]> {
    const db = await getDb();
    // Dynamically calculate total from items to ensure accuracy
    // Using LEFT JOIN to sum stored prices.
    return db.all<OrderDTO[]>(`
      SELECT 
        o.*, 
        COALESCE(SUM(oi.quantity * oi.unit_price), 0) as total
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      GROUP BY o.id
    `);
  }

  static async findById(id: string): Promise<OrderDTO | undefined> {
    const db = await getDb();
    const order = await db.get<OrderDTO>('SELECT * FROM orders WHERE id = ?', [
      id,
    ]);

    if (order) {
      const items = await db.all<OrderItemDTO[]>(
        'SELECT oi.id, oi.order_id, oi.product_id, oi.quantity, oi.unit_price, (oi.quantity * oi.unit_price) as total_item, p.name as product_name FROM order_items oi LEFT JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?',
        [id],
      );
      order.items = items;
    }

    return order;
  }

  static async findOpenByTableId(
    tableId: string,
  ): Promise<OrderDTO | undefined> {
    const db = await getDb();
    return db.get<OrderDTO>(
      "SELECT * FROM orders WHERE table_id = ? AND status = 'OPEN'",
      [tableId],
    );
  }

  static async create(data: CreateOrderDTO): Promise<OrderDTO> {
    const db = await getDb();
    const id = uuidv4();
    const opened_at = new Date().toISOString();
    const initialTotal = 0;
    const initialStatus = 'OPEN';

    await db.run(
      `INSERT INTO orders (id, table_id, user_id, status, total, tip, opened_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.table_id,
        data.user_id,
        initialStatus,
        initialTotal,
        0,
        opened_at,
      ],
    );

    // Atualizar status da mesa para ocupada e vincular o garçom
    await TableModel.updateStatus(
      data.table_id,
      TableStatus.OCCUPIED,
      data.user_id,
    );

    const order = await OrderModel.findById(id);
    return order!;
  }

  static async update(
    id: string,
    data: UpdateOrderDTO,
  ): Promise<OrderDTO | undefined> {
    const db = await getDb();
    const current = await OrderModel.findById(id);

    if (!current) return undefined;

    const updated = { ...current, ...data };

    await db.run(
      `UPDATE orders SET status = ?, total = ?, tip = ?, closed_at = ? WHERE id = ?`,
      [updated.status, updated.total, updated.tip, updated.closed_at, id],
    );

    return OrderModel.findById(id);
  }

  static async delete(id: string): Promise<boolean> {
    const db = await getDb();
    // ON DELETE CASCADE automatically deletes order_items
    const result = await db.run('DELETE FROM orders WHERE id = ?', [id]);
    return (result.changes ?? 0) > 0;
  }

  static async addItem(
    orderId: string,
    productId: string,
    quantity: number,
  ): Promise<OrderItemDTO | null> {
    const db = await getDb();

    const product = await db.get(
      'SELECT price, name FROM products WHERE id = ?',
      [productId],
    );
    if (!product) return null;

    const unit_price = product.price;
    const total_item = unit_price * quantity;
    const item_id = uuidv4();

    await db.run(
      `INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) values (?, ?, ?, ?, ?)`,
      [item_id, orderId, productId, quantity, unit_price],
    );

    await db.run(`UPDATE orders SET total = total + ? WHERE id = ?`, [
      total_item,
      orderId,
    ]);

    return {
      id: item_id,
      order_id: orderId,
      product_id: productId,
      quantity,
      unit_price,
      total_item,
    };
  }

  static async removeItem(orderId: string, itemId: string): Promise<boolean> {
    const db = await getDb();

    // Get item to know price
    // total_item column likely doesn't exist, calculate it
    const item = await db.get<{
      quantity: number;
      unit_price: number;
      order_id: string;
    }>('SELECT quantity, unit_price, order_id FROM order_items WHERE id = ?', [
      itemId,
    ]);

    if (!item || item.order_id !== orderId) return false;

    const totalToDelete = item.quantity * item.unit_price;

    // Delete item
    await db.run('DELETE FROM order_items WHERE id = ?', [itemId]);

    // Update total (subtract)
    await db.run('UPDATE orders SET total = total - ? WHERE id = ?', [
      totalToDelete,
      orderId,
    ]);

    return true;
  }

  static async close(id: string, tip?: number): Promise<OrderDTO | undefined> {
    const db = await getDb();
    const order = await OrderModel.findById(id);

    if (!order || order.status !== 'OPEN') return undefined;

    await db.run(`UPDATE orders SET status = 'CLOSED' WHERE id = ?`, [id]);

    return OrderModel.findById(id);
  }
}
