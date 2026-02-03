import { getDb } from '../config/database'; // Correção: Apenas um "../"
import { Product } from '../../shared/types/product';

export class ProductModel {
  static async findAll(): Promise<Product[]> {
    const db = await getDb();
    return db.all<Product[]>('SELECT * FROM products');
  }

  static async findById(id: string): Promise<Product | undefined> {
    const db = await getDb();
    return db.get<Product>('SELECT * FROM products WHERE id = ?', [id]);
  }

  static async findByCategory(categoryId: string): Promise<Product[]> {
    const db = await getDb();
    return db.all<Product[]>('SELECT * FROM products WHERE category_id = ?', [categoryId]);
  }

  static async create(product: Product): Promise<Product> {
    const db = await getDb();
    await db.run(
      `INSERT INTO products (
        id, category_id, name, description, price, image_path, is_active, preparation_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        product.id,
        product.category_id,
        product.name,
        product.description,
        product.price,
        product.image_path,
        product.is_active ? 1 : 0,
        product.preparation_time
      ]
    );
    return product;
  }

  static async update(id: string, product: Partial<Product>): Promise<void> {
    const db = await getDb();
    const fields: string[] = [];
    const values: any[] = [];

    if (product.name !== undefined) { fields.push('name = ?'); values.push(product.name); }
    if (product.description !== undefined) { fields.push('description = ?'); values.push(product.description); }
    if (product.price !== undefined) { fields.push('price = ?'); values.push(product.price); }
    if (product.image_path !== undefined) { fields.push('image_path = ?'); values.push(product.image_path); }
    if (product.is_active !== undefined) { fields.push('is_active = ?'); values.push(product.is_active ? 1 : 0); }
    if (product.preparation_time !== undefined) { fields.push('preparation_time = ?'); values.push(product.preparation_time); }

    if (fields.length === 0) return;

    values.push(id);
    await db.run(
      `UPDATE products SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );
  }

  static async delete(id: string): Promise<void> {
    const db = await getDb();
    await db.run('DELETE FROM products WHERE id = ?', [id]);
  }
}
