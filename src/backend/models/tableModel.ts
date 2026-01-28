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

  static async findAvailable(): Promise<TableDTO[]> {
    return TableModel.findByStatus(TableStatus.AVAILABLE);
  }

  static async create(data: CreateTableDTO): Promise<TableDTO> {
    const db = await getDb();
    const { id, number, status = TableStatus.AVAILABLE } = data;

    await db.run(
      `INSERT INTO restaurant_tables (id, number, status) VALUES (?, ?, ?)`,
      [id, number, status],
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
      `UPDATE restaurant_tables SET number = ?, status = ? WHERE id = ?`,
      [updated.number, updated.status, id],
    );

    return TableModel.findById(id);
  }

  static async updateStatus(
    id: string,
    status: TableStatus,
  ): Promise<TableDTO | undefined> {
    const db = await getDb();
    const result = await db.run(
      'UPDATE restaurant_tables SET status = ? WHERE id = ?',
      [status, id],
    );

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
