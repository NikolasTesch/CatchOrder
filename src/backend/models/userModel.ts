import { getDb } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import type { User } from '../../shared/types/user';
import type { CreateUserDTO, UpdateUserDTO } from '../../shared/dtos/userDto';

export class UserModel {

  async findAll(): Promise<Omit<User, 'password_hash'>[]> {
    const db = await getDb();
    const users = await db.all<User[]>('SELECT id, name, username, role, image_url, created_at, updated_at FROM users');
    return users;
  }

  async findById(id: string): Promise<Omit<User, 'password_hash'> | undefined> {
    const db = await getDb();
    const user = await db.get<User>(
      'SELECT id, name, username, role, image_url, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    return user;
  }

  async findByUsername(username: string): Promise<User | undefined> {
    const db = await getDb();
    const user = await db.get<User>('SELECT * FROM users WHERE username = ?', [username]);
    return user;
  }

  async create(user: CreateUserDTO): Promise<string> {
    const db = await getDb();
    const id = uuidv4();
    await db.run(
      `INSERT INTO users (id, name, username, password_hash, role, image_url) VALUES (?, ?, ?, ?, ?, ?)`,
      [id, user.name, user.username, user.password_hash, user.role, user.image_url || null]
    );
    return id;
  }

  async update(id: string, user: UpdateUserDTO): Promise<boolean> {
    const db = await getDb();

    // Build dynamic query
    const fields: string[] = [];
    const values: any[] = [];

    if (user.name) {
      fields.push('name = ?');
      values.push(user.name);
    }
    if (user.username) {
      fields.push('username = ?');
      values.push(user.username);
    }
    if (user.role) {
      fields.push('role = ?');
      values.push(user.role);
    }
    if (user.password_hash) {
      fields.push('password_hash = ?');
      values.push(user.password_hash);
    }
    if (user.image_url !== undefined) {
      fields.push('image_url = ?');
      values.push(user.image_url);
    }

    if (fields.length === 0) return false;

    values.push(id);

    const result = await db.run(
      `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    return (result.changes ?? 0) > 0;
  }

  async delete(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.run('DELETE FROM users WHERE id = ?', [id]);
    return (result.changes ?? 0) > 0;
  }
}
