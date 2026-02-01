import { getDb } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import type {
  CategoryDTO,
  CreateCategoryDTO,
  UpdateCategoryDTO,
} from '../../shared/dtos/categoryDto';

export class CategoryModel {
  /**
   * Generates a URL-friendly slug from a category name
   * @param name - Category name to convert to slug
   * @returns URL-friendly slug
   */
  private static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  static async findAll(): Promise<CategoryDTO[]> {
    const db = await getDb();
    return db.all<CategoryDTO[]>('SELECT * FROM categories');
  }

  static async findById(id: string): Promise<CategoryDTO | undefined> {
    const db = await getDb();
    return db.get<CategoryDTO>('SELECT * FROM categories WHERE id = ?', [id]);
  }

  static async create(data: CreateCategoryDTO): Promise<CategoryDTO> {
    const db = await getDb();
    const id = uuidv4();
    const slug = CategoryModel.generateSlug(data.name);

    await db.run('INSERT INTO categories (id, name, slug) VALUES (?, ?, ?)', [
      id,
      data.name,
      slug,
    ]);

    const category = await CategoryModel.findById(id);
    return category!;
  }

  static async update(
    id: string,
    data: UpdateCategoryDTO,
  ): Promise<CategoryDTO | undefined> {
    const current = await CategoryModel.findById(id);
    if (!current) return undefined;

    const db = await getDb();

    const newName = data.name !== undefined ? data.name : current.name;
    const newSlug =
      data.name !== undefined
        ? CategoryModel.generateSlug(data.name)
        : current.slug;

    await db.run('UPDATE categories SET name = ?, slug = ? WHERE id = ?', [
      newName,
      newSlug,
      id,
    ]);

    return CategoryModel.findById(id);
  }

  static async delete(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.run('DELETE FROM categories WHERE id = ?', [id]);
    return (result.changes ?? 0) > 0;
  }
}
