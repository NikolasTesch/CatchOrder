import { getDb } from '../config/database';
import { Category } from '../../shared/types/category';

export class CategoryModel {
  static async findAll(): Promise<Category[]> {
    const db = await getDb();
    return db.all<Category[]>('SELECT * FROM categories');
  }

  static async findById(id: string): Promise<Category | undefined> {
    const db = await getDb();
    return db.get<Category>('SELECT * FROM categories WHERE id = ?', [id]);
  }

  static async create(category: Category): Promise<Category> {
    const db = await getDb();
    await db.run('INSERT INTO categories (id, name) VALUES (?, ?)', [category.id, category.name]);
    return category;
  }

  static async update(id: string, category: Partial<Category>): Promise<void> {
    const db = await getDb();
    const current = await CategoryModel.findById(id);
    if (!current) throw new Error('Categoria não encontrada');
    
    const name = category.name || current.name;
    await db.run('UPDATE categories SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [name, id]);
  }

  static async delete(id: string): Promise<void> {
    const db = await getDb();
    await db.run('DELETE FROM categories WHERE id = ?', [id]);
  }
}
