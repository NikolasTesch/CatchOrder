import { getDb } from '../config/database';
import type {
  TableDTO,
  CreateTableDTO,
  UpdateTableDTO,
} from '../../shared/dtos/tableDto';
import { TableStatus } from '../../shared/types/table';

export type { TableDTO, CreateTableDTO, UpdateTableDTO };

export class TableModel {
  static async findAll(): Promise<TableDTO[]> {
    const db = await getDb();
    const tables = await db.all<TableDTO[]>(
      'SELECT * FROM restaurant_tables ORDER BY number',
    );
    return tables;
  }

  static async findById(id: string): Promise<TableDTO | undefined> {
    const db = await getDb();
    const table = await db.get<TableDTO>(
      'SELECT * FROM restaurant_tables WHERE id = ?',
      [id],
    );
    return table;
  }

  static async findByNumber(number: number): Promise<TableDTO | undefined> {
    const db = await getDb();
    const table = await db.get<TableDTO>(
      'SELECT * FROM restaurant_tables WHERE number = ?',
      [number],
    );
    return table;
  }

  static async findByStatus(status: TableStatus): Promise<TableDTO[]> {
    const db = await getDb();
    const tables = await db.all<TableDTO[]>(
      'SELECT * FROM restaurant_tables WHERE status = ? ORDER BY number',
      [status],
    );
    return tables;
  }

  static async findByWaiterId(waiterId: string): Promise<TableDTO[]> {
    const db = await getDb();
    const tables = await db.all<TableDTO[]>(
      'SELECT * FROM restaurant_tables WHERE waiter_id = ? ORDER BY number',
      [waiterId],
    );
    return tables;
  }

  static async findAvailable(): Promise<TableDTO[]> {
    return TableModel.findByStatus(TableStatus.AVAILABLE);
  }

  static async create(data: CreateTableDTO): Promise<TableDTO> {
    const db = await getDb();
    const { id, number, status = TableStatus.AVAILABLE, waiter_id } = data;

    await db.run(
      `INSERT INTO restaurant_tables (id, number, status, waiter_id) VALUES (?, ?, ?, ?)`,
      [id, number, status, waiter_id],
    );

    const table = await TableModel.findById(id);
    return table!;
  }

  static async update(
    id: string,
    data: UpdateTableDTO,
  ): Promise<TableDTO | undefined> {
    const current = await TableModel.findById(id);
    if (!current) return undefined;

    const updated = { ...current, ...data };

    const db = await getDb();
    await db.run(
      `UPDATE restaurant_tables SET number = ?, status = ?, waiter_id = ? WHERE id = ?`,
      [updated.number, updated.status, updated.waiter_id, id],
    );

    return TableModel.findById(id);
  }

  static async updateStatus(
    id: string,
    status: TableStatus,
    waiterId?: string,
  ): Promise<TableDTO | undefined> {
    const db = await getDb();

    let query = 'UPDATE restaurant_tables SET status = ?';
    const params: any[] = [status];

    if (status === TableStatus.AVAILABLE) {
      // If releasing, clear the waiter_id
      query += ', waiter_id = NULL';
    } else if (status === TableStatus.OCCUPIED && waiterId) {
      // If occupying, bind the waiter
      query += ', waiter_id = ?';
      params.push(waiterId);
    }

    query += ' WHERE id = ?';
    params.push(id);

    const result = await db.run(query, params);

    if ((result.changes ?? 0) === 0) return undefined;

    return TableModel.findById(id);
  }

  static async delete(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.run('DELETE FROM restaurant_tables WHERE id = ?', [
      id,
    ]);
    return (result.changes ?? 0) > 0;
  }
}
