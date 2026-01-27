import { getDb } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import type { CategoryDTO, CreateCategoryDTO, UpdateCategoryDTO } from '../../shared/dtos/categoryDto';

export class CategoryModel {
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

        await db.run(
            'INSERT INTO categories (id, name) VALUES (?, ?)',
            [id, data.name]
        );

        const category = await CategoryModel.findById(id);
        return category!;
    }

    static async update(id: string, data: UpdateCategoryDTO): Promise<CategoryDTO | undefined> {
        const current = await CategoryModel.findById(id);
        if (!current) return undefined;

        const db = await getDb();

        // In this case, we only have 'name' to update, but this pattern supports future fields
        const newName = data.name !== undefined ? data.name : current.name;

        await db.run(
            'UPDATE categories SET name = ? WHERE id = ?',
            [newName, id]
        );

        return CategoryModel.findById(id);
    }

    static async delete(id: string): Promise<boolean> {
        const db = await getDb();
        const result = await db.run('DELETE FROM categories WHERE id = ?', [id]);
        return (result.changes ?? 0) > 0;
    }
}
