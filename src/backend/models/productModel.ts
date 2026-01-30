import { getDb } from '../config/database';
import type {
  ProductDTO,
  CreateProductDTO,
  UpdateProductDTO,
} from '../../shared/dtos/productDto';

export type { ProductDTO, CreateProductDTO, UpdateProductDTO };

export class ProductModel {
  static async findAll(): Promise<ProductDTO[]> {
    const db = await getDb();
    const products = await db.all<ProductDTO[]>('SELECT * FROM products');
    return products;
  }

  static async findById(id: string): Promise<ProductDTO | undefined> {
    const db = await getDb();
    const product = await db.get<ProductDTO>(
      'SELECT * FROM products WHERE id = ?',
      [id],
    );
    return product;
  }

  static async findByCategory(categoryId: string): Promise<ProductDTO[]> {
    const db = await getDb();
    const products = await db.all<ProductDTO[]>(
      'SELECT * FROM products WHERE category_id = ?',
      [categoryId],
    );
    return products;
  }

  static async findActive(): Promise<ProductDTO[]> {
    const db = await getDb();
    const products = await db.all<ProductDTO[]>(
      'SELECT * FROM products WHERE is_active = 1',
    );
    return products;
  }

  static async findActiveByCategory(categoryId: string): Promise<ProductDTO[]> {
    const db = await getDb();
    const products = await db.all<ProductDTO[]>(
      'SELECT * FROM products WHERE category_id = ? AND is_active = 1',
      [categoryId],
    );
    return products;
  }

  static async create(data: CreateProductDTO): Promise<ProductDTO> {
    const db = await getDb();
    const {
      id,
      category_id,
      name,
      description,
      price,
      image_path,
      is_active = true,
    } = data;

    await db.run(
      `INSERT INTO products (id, category_id, name, description, price, image_path, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        category_id,
        name,
        description ?? null,
        price,
        image_path ?? null,
        is_active ? 1 : 0,
      ],
    );

    const product = await ProductModel.findById(id);
    return product!;
  }

  static async update(
    id: string,
    data: UpdateProductDTO,
  ): Promise<ProductDTO | undefined> {
    const current = await ProductModel.findById(id);
    if (!current) return undefined;

    const updated = { ...current, ...data };

    const db = await getDb();
    await db.run(
      `UPDATE products SET
         category_id = ?,
         name = ?,
         description = ?,
         price = ?,
         image_path = ?,
         is_active = ?
       WHERE id = ?`,
      [
        updated.category_id,
        updated.name,
        updated.description,
        updated.price,
        updated.image_path,
        updated.is_active ? 1 : 0,
        id,
      ],
    );

    return ProductModel.findById(id);
  }

  static async delete(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.run('DELETE FROM products WHERE id = ?', [id]);
    return (result.changes ?? 0) > 0;
  }

  static async deactivate(id: string): Promise<ProductDTO | undefined> {
    return ProductModel.update(id, { is_active: false });
  }

  static async activate(id: string): Promise<ProductDTO | undefined> {
    return ProductModel.update(id, { is_active: true });
  }

  static async search(query: string): Promise<ProductDTO[]> {
    const db = await getDb();
    const searchTerm = `%${query}%`;
    const products = await db.all<ProductDTO[]>(
      'SELECT * FROM products WHERE name LIKE ? OR description LIKE ?',
      [searchTerm, searchTerm],
    );
    return products;
  }
}