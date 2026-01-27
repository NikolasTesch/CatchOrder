import { getDb } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import type { OrderDTO, CreateOrderDTO, UpdateOrderDTO, OrderItemDTO } from '../../shared/dtos/orderDto';

export class OrderModel {
    static async findAll(): Promise<OrderDTO[]> {
        const db = await getDb();
        return db.all<OrderDTO[]>('SELECT * FROM orders');
    }

    static async findById(id: string): Promise<OrderDTO | undefined> {
        const db = await getDb();
        return db.get<OrderDTO>('SELECT * FROM orders WHERE id = ?', [id]);
    }

    static async create(data: CreateOrderDTO): Promise<OrderDTO> {
        const db = await getDb();
        const id = uuidv4();
        const opened_at = new Date().toISOString();
        const initialTotal = 0;
        const initialStatus = 'OPEN';

        await db.run(
            `INSERT INTO orders (id, table_id, user_id, status, total, opened_at) VALUES (?, ?, ?, ?, ?, ?)`,
            [id, data.table_id, data.user_id, initialStatus, initialTotal, opened_at]
        );

        const order = await OrderModel.findById(id);
        return order!;
    }

    static async update(id: string, data: UpdateOrderDTO): Promise<OrderDTO | undefined> {
        const db = await getDb();
        const current = await OrderModel.findById(id);

        if (!current) return undefined;

        const updated = { ...current, ...data };

        await db.run(
            `UPDATE orders SET status = ?, total = ?, closed_at = ? WHERE id = ?`,
            [updated.status, updated.total, updated.closed_at, id]
        );

        return OrderModel.findById(id);
    }

    static async delete(id: string): Promise<boolean> {
        const db = await getDb();
        const result = await db.run('DELETE FROM orders WHERE id = ?', [id]);
        return (result.changes ?? 0) > 0;
    }

    static async addItem(orderId: string, productId: string, quantity: number): Promise<OrderItemDTO | null> {
        const db = await getDb();

        const product = await db.get('SELECT price, name FROM products WHERE id = ?', [productId]);
        if (!product) return null;

        const unit_price = product.price;
        const total_item = unit_price * quantity;
        const item_id = uuidv4();

        await db.run(
            `INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) values (?, ?, ?, ?, ?)`,
            [item_id, orderId, productId, quantity, unit_price]
        );

        await db.run(
            `UPDATE orders SET total = total + ? WHERE id = ?`,
            [total_item, orderId]
        );

        return {
            id: item_id,
            order_id: orderId,
            product_id: productId,
            quantity,
            unit_price,
            total_item
        };
    }

    static async close(id: string): Promise<OrderDTO | undefined> {
        const db = await getDb();
        const order = await OrderModel.findById(id);

        if (!order || order.status !== 'OPEN') return undefined;

        const closed_at = new Date().toISOString();

        await db.run(
            `UPDATE orders SET status = 'CLOSED', closed_at = ? WHERE id = ?`,
            [closed_at, id]
        );

        await db.run(
            `UPDATE restaurant_tables SET status = 'AVAILABLE' WHERE id = ?`,
            [order.table_id]
        );

        return OrderModel.findById(id);
    }
}
