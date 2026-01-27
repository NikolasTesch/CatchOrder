import { getDb } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import type {
  ReservationDTO,
  CreateReservationDTO,
  UpdateReservationDTO,
} from '../../shared/dtos/reservationDto';

export type { ReservationDTO, CreateReservationDTO, UpdateReservationDTO };

export class ReservationModel {
  static async findAll(): Promise<ReservationDTO[]> {
    const db = await getDb();
    const reservations = await db.all<ReservationDTO[]>(
      'SELECT * FROM reservations ORDER BY reservation_date DESC, reservation_time DESC'
    );
    return reservations;
  }

  static async findById(id: string): Promise<ReservationDTO | undefined> {
    const db = await getDb();
    const reservation = await db.get<ReservationDTO>(
      'SELECT * FROM reservations WHERE id = ?',
      [id]
    );
    return reservation;
  }

  static async findByDate(date: string): Promise<ReservationDTO[]> {
    const db = await getDb();
    const reservations = await db.all<ReservationDTO[]>(
      'SELECT * FROM reservations WHERE reservation_date = ? ORDER BY reservation_time',
      [date]
    );
    return reservations;
  }

  static async findByTableAndDate(
    tableNumber: number,
    date: string
  ): Promise<ReservationDTO[]> {
    const db = await getDb();
    const reservations = await db.all<ReservationDTO[]>(
      'SELECT * FROM reservations WHERE table_number = ? AND reservation_date = ? ORDER BY reservation_time',
      [tableNumber, date]
    );
    return reservations;
  }

  static async findByStatus(status: string): Promise<ReservationDTO[]> {
    const db = await getDb();
    const reservations = await db.all<ReservationDTO[]>(
      'SELECT * FROM reservations WHERE status = ? ORDER BY reservation_date, reservation_time',
      [status]
    );
    return reservations;
  }

  static async create(data: CreateReservationDTO): Promise<ReservationDTO> {
    const db = await getDb();
    const id = uuidv4();
    const now = new Date().toISOString();

    await db.run(
      `INSERT INTO reservations (
        id, table_number, customer_name, customer_phone, customer_email,
        reservation_date, reservation_time, number_of_people, status, notes,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.table_number,
        data.customer_name,
        data.customer_phone,
        data.customer_email || null,
        data.reservation_date,
        data.reservation_time,
        data.number_of_people,
        'pending',
        data.notes || null,
        now,
        now,
      ]
    );

    const reservation = await this.findById(id);
    if (!reservation) {
      throw new Error('Failed to create reservation');
    }

    return reservation;
  }

  static async update(
    id: string,
    data: UpdateReservationDTO
  ): Promise<ReservationDTO | undefined> {
    const db = await getDb();
    const now = new Date().toISOString();

    const fields: string[] = [];
    const values: any[] = [];

    if (data.table_number !== undefined) {
      fields.push('table_number = ?');
      values.push(data.table_number);
    }
    if (data.customer_name !== undefined) {
      fields.push('customer_name = ?');
      values.push(data.customer_name);
    }
    if (data.customer_phone !== undefined) {
      fields.push('customer_phone = ?');
      values.push(data.customer_phone);
    }
    if (data.customer_email !== undefined) {
      fields.push('customer_email = ?');
      values.push(data.customer_email);
    }
    if (data.reservation_date !== undefined) {
      fields.push('reservation_date = ?');
      values.push(data.reservation_date);
    }
    if (data.reservation_time !== undefined) {
      fields.push('reservation_time = ?');
      values.push(data.reservation_time);
    }
    if (data.number_of_people !== undefined) {
      fields.push('number_of_people = ?');
      values.push(data.number_of_people);
    }
    if (data.status !== undefined) {
      fields.push('status = ?');
      values.push(data.status);
    }
    if (data.notes !== undefined) {
      fields.push('notes = ?');
      values.push(data.notes);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push('updated_at = ?');
    values.push(now);
    values.push(id);

    await db.run(
      `UPDATE reservations SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  static async delete(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.run('DELETE FROM reservations WHERE id = ?', [id]);
    return (result.changes ?? 0) > 0;
  }

  static async checkAvailability(
    tableNumber: number,
    date: string,
    time: string,
    excludeId?: string
  ): Promise<boolean> {
    const db = await getDb();
    
    let query = `
      SELECT COUNT(*) as count 
      FROM reservations 
      WHERE table_number = ? 
        AND reservation_date = ? 
        AND reservation_time = ?
        AND status IN ('pending', 'confirmed')
    `;
    
    const params: any[] = [tableNumber, date, time];
    
    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }

    const result = await db.get<{ count: number }>(query, params);
    return (result?.count ?? 0) === 0;
  }
}
