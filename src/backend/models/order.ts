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

interface OrderRawResult extends OrderDTO {
  user_name: string;
  items_json: string;
}

export class OrderModel {
  static async findAll(): Promise<OrderDTO[]> {
    const db = await getDb();
    // Dynamically calculate total from items to ensure accuracy
    // Using LEFT JOIN to sum stored prices.
    const orders = await db.all<OrderRawResult[]>(`
      SELECT 
        o.*, 
        u.name as user_name,
        COALESCE(SUM(oi.quantity * oi.unit_price), 0) as total,
        json_group_array(json_object('name', p.name, 'quantity', oi.quantity, 'unit_price', oi.unit_price, 'created_at', oi.created_at, 'delivered_at', oi.delivered_at)) as items_json
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      LEFT JOIN users u ON o.user_id = u.id
      GROUP BY o.id
    `);
    return orders.map((o) => {
      let items = [];
      try {
        items = JSON.parse(o.items_json);
        // Filter out nulls from left join (if an order has no items, json_group_array might contain an object with null values or be [null])
        items = items.filter((i: any) => i && i.name);
      } catch (e) {
        items = [];
      }
      return {
        ...o,
        items,
        // Ensure total is a number
        total: Number(o.total)
      };
    });
  }

  static async findById(id: string): Promise<OrderDTO | undefined> {
    const db = await getDb();
    const order = await db.get<OrderDTO>('SELECT * FROM orders WHERE id = ?', [
      id,
    ]);

    if (order) {
      const items = await db.all<OrderItemDTO[]>(
        'SELECT oi.id, oi.order_id, oi.product_id, oi.quantity, oi.unit_price, (oi.quantity * oi.unit_price) as total_item, p.name as product_name, oi.created_at, oi.delivered_at FROM order_items oi LEFT JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?',
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

    // Check if table has a waiter assigned
    const table = await TableModel.findById(data.table_id);
    let userIdForOrder = data.user_id;

    if (table && table.waiter_id) {
      userIdForOrder = table.waiter_id;
    }

    await db.run(
      `INSERT INTO orders(id, table_id, user_id, status, total, tip, opened_at) VALUES(?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.table_id,
        userIdForOrder,
        initialStatus,
        initialTotal,
        0,
        opened_at,
      ],
    );

    // Atualizar status da mesa para ocupada e vincular o garçom (ou manter o existente)
    await TableModel.updateStatus(
      data.table_id,
      TableStatus.OCCUPIED,
      userIdForOrder,
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

    const updated = { ...current };
    if (data.status !== undefined) updated.status = data.status;
    if (data.total !== undefined) updated.total = data.total;
    if (data.tip !== undefined) updated.tip = data.tip;
    if (data.closed_at !== undefined) updated.closed_at = data.closed_at;
    if (data.observations !== undefined) updated.observations = data.observations;
    if (data.table_id !== undefined) updated.table_id = data.table_id;
    if (data.user_id !== undefined) updated.user_id = data.user_id;

    await db.run(
      `UPDATE orders SET status = ?, total = ?, tip = ?, closed_at = ?, observations = ?, table_id = ?, user_id = ? WHERE id = ?`,
      [
        updated.status,
        updated.total,
        updated.tip,
        updated.closed_at || null,
        updated.observations || null,
        updated.table_id,
        updated.user_id,
        id,
      ],
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
    const created_at = new Date().toISOString();

    await db.run(
      `INSERT INTO order_items(id, order_id, product_id, quantity, unit_price, created_at) values(?, ?, ?, ?, ?, ?)`,
      [item_id, orderId, productId, quantity, unit_price, created_at],
    );


    return {
      id: item_id,
      order_id: orderId,
      product_id: productId,
      quantity,
      unit_price,
      total_item,
    };
  }

  static async removeItem(orderId: string, itemId: string, quantityToRemove?: number): Promise<boolean> {
    const db = await getDb();

    const item = await db.get<{
      quantity: number;
      unit_price: number;
      order_id: string;
      delivered_at?: string;
    }>('SELECT quantity, unit_price, order_id, delivered_at FROM order_items WHERE id = ?', [
      itemId,
    ]);

    if (!item || item.order_id !== orderId) return false;

    // Default to full removal if no quantity specified
    const qtyToRemove = quantityToRemove !== undefined ? quantityToRemove : item.quantity;

    if (qtyToRemove <= 0) return false;

    if (qtyToRemove < item.quantity) {
      // PARTIAL REMOVAL
      // Update quantity
      await db.run('UPDATE order_items SET quantity = quantity - ? WHERE id = ?', [
        qtyToRemove,
        itemId,
      ]);

      // If item was delivered, we need to reduce the order total
      if (item.delivered_at) {
        const totalToSubtract = qtyToRemove * item.unit_price;
        await db.run('UPDATE orders SET total = total - ? WHERE id = ?', [
          totalToSubtract,
          orderId,
        ]);
      }
    } else {
      // FULL REMOVAL (Delete item)
      await db.run('DELETE FROM order_items WHERE id = ?', [itemId]);

      // If item was delivered, subtract its full value from total
      if (item.delivered_at) {
        const totalToDelete = item.quantity * item.unit_price;
        await db.run('UPDATE orders SET total = total - ? WHERE id = ?', [
          totalToDelete,
          orderId,
        ]);
      }
    }

    return true;
  }

  static async close(
    id: string,
    tip: number = 0,
  ): Promise<OrderDTO | undefined> {
    const db = await getDb();
    const order = await OrderModel.findById(id);

    if (!order || order.status !== 'OPEN') return undefined;

    // Validation: Check if all items are delivered
    const pendingItems = await db.get<{ count: number }>(
      'SELECT COUNT(*) as count FROM order_items WHERE order_id = ? AND delivered_at IS NULL',
      [id]
    );

    if (pendingItems && pendingItems.count > 0) {
      throw new Error('Cannot close order with pending items to deliver');
    }

    const closed_at = new Date().toISOString();

    // 1. Update Order status, closed_at and tip
    await db.run(
      `UPDATE orders SET status = 'CLOSED', closed_at = ?, tip = ? WHERE id = ? `,
      [closed_at, tip, id],
    );

    // 2. Release the Table (Set to AVAILABLE and unbind waiter)
    if (order.table_id) {
      // Import dynamically or ensure TableModel is imported
      await TableModel.updateStatus(
        order.table_id,
        TableStatus.AVAILABLE,
        undefined,
      );
    }

    return OrderModel.findById(id);
  }

  static async deliverItem(orderId: string, itemId: string, quantityToDeliver?: number): Promise<boolean> {
    const db = await getDb();

    // Get item
    const item = await db.get<{
      id: string;
      product_id: string;
      quantity: number;
      unit_price: number;
      order_id: string;
      delivered_at?: string;
      created_at: string;
    }>('SELECT id, product_id, quantity, unit_price, order_id, delivered_at, created_at FROM order_items WHERE id = ?', [itemId]);

    if (!item || item.order_id !== orderId) return false;
    if (item.delivered_at) return true; // Already delivered

    const deliverQty = quantityToDeliver !== undefined ? quantityToDeliver : item.quantity;

    if (deliverQty <= 0 || deliverQty > item.quantity) {
      throw new Error("Invalid quantity to deliver");
    }

    const delivered_at = new Date().toISOString();

    if (deliverQty < item.quantity) {
      // PARTIAL DELIVERY
      const remainingQty = item.quantity - deliverQty;

      // 1. Update current item to delivered quantity and set delivered_at
      await db.run('UPDATE order_items SET quantity = ?, delivered_at = ? WHERE id = ?', [deliverQty, delivered_at, itemId]);

      // 2. Create NEW item for the remaining quantity (Pending)
      // Helper function ensures created_at is preserved
      const newItemId = uuidv4();
      await db.run(
        `INSERT INTO order_items(id, order_id, product_id, quantity, unit_price, created_at) values(?, ?, ?, ?, ?, ?)`,
        [newItemId, orderId, item.product_id, remainingQty, item.unit_price, item.created_at],
      );

    } else {
      // FULL DELIVERY
      await db.run('UPDATE order_items SET delivered_at = ? WHERE id = ?', [delivered_at, itemId]);
    }

    // Update Order Total (add value of delivered items)
    const totalToAdd = deliverQty * item.unit_price;
    await db.run('UPDATE orders SET total = total + ? WHERE id = ?', [totalToAdd, orderId]);

    return true;
  }
}
