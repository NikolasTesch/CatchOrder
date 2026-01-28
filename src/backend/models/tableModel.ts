import { getDb } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import { Table } from '../../shared/types/table';
import { CreateTableDTO, UpdateTableDTO } from '../../shared/dtos/tableDto';

export class TableModel {

  async findAll(): Promise<Table[]> {
    const db = await getDb();
    const tables = await db.all<Table[]>('SELECT * FROM restaurant_tables', []);
    return tables;
  }

  async findById(id: string): Promise<Table | undefined> {
    const db = await getDb();
    const table = await db.get<Table>(
      'SELECT * FROM restaurant_tables WHERE id = ?',
      [id]
    );
    return table;
  }

  async findByNumber(number: number): Promise<Table | undefined> {
    const db = await getDb();
    const table = await db.get<Table>('SELECT * FROM restaurant_tables WHERE number = ?', [number]);
    return table;
  }

  async create(table: CreateTableDTO): Promise<string> {
    const db = await getDb();
    const id = uuidv4();
    const status = table.status || 'AVAILABLE';
    
    await db.run(
      'INSERT INTO restaurant_tables (id, number, status) VALUES (?, ?, ?)',
      [id, table.number, status]
    );
    return id;
  }

  async update(id: string, table: UpdateTableDTO): Promise<boolean> {
    const db = await getDb();
    
    // Build dynamic query
    const fields: string[] = [];
    const values: any[] = [];

    if (table.number !== undefined) {
      fields.push('number = ?');
      values.push(table.number);
    }
    if (table.status !== undefined) {
      fields.push('status = ?');
      values.push(table.status);
    }

    if (fields.length === 0) return false;

    values.push(id);

    const result = await db.run(
      `UPDATE restaurant_tables SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return (result.changes ?? 0) > 0;
  }

  async delete(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.run('DELETE FROM restaurant_tables WHERE id = ?', [id]);
    return (result.changes ?? 0) > 0;
  }
}
