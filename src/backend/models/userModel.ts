import { getDb } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import type { User } from '../../shared/types/user';
import type { CreateUserDTO, UpdateUserDTO } from '../../shared/dtos/userDto';

export class UserModel {
  static async findAll(): Promise<Omit<User, 'password_hash'>[]> {
    const db = await getDb();
    return db.all<User[]>(
      'SELECT id, name, username, role, image_url, created_at, updated_at FROM users',
    );
  }

  static async findById(
    id: string,
  ): Promise<Omit<User, 'password_hash'> | undefined> {
    const db = await getDb();
    return db.get<User>(
      'SELECT id, name, username, role, image_url, created_at, updated_at FROM users WHERE id = ?',
      [id],
    );
  }

  static async findByUsername(username: string): Promise<User | undefined> {
    const db = await getDb();
    return db.get<User>('SELECT * FROM users WHERE username = ?', [username]);
  }

  static async create(
    user: CreateUserDTO,
  ): Promise<Omit<User, 'password_hash'>> {
    const db = await getDb();
    const id = uuidv4();
    await db.run(
      `INSERT INTO users (id, name, username, password_hash, role, image_url) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id,
        user.name,
        user.username,
        user.password_hash,
        user.role,
        user.image_url || null,
      ],
    );

    const created = await UserModel.findById(id);
    return created!;
  }

  static async update(id: string, user: UpdateUserDTO): Promise<boolean> {
    const current = await UserModel.findById(id);
    if (!current) return false;

    const db = await getDb();

    // Merge current data with updates
    const updated = { ...current, ...user };

    const result = await db.run(
      `UPDATE users SET name = ?, username = ?, role = ?, password_hash = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [
        updated.name,
        updated.username,
        updated.role,
        user.password_hash || (current as any).password_hash, // Keep current password if not updating
        updated.image_url,
        id,
      ],
    );

    return (result.changes ?? 0) > 0;
  }

  static async delete(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.run('DELETE FROM users WHERE id = ?', [id]);
    return (result.changes ?? 0) > 0;
  }
}
