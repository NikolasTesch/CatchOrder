import type { Category } from '../types/category';

export type CategoryDTO = Category;

export type CreateCategoryDTO = Omit<Category, 'id'>;

export type UpdateCategoryDTO = Partial<Omit<Category, 'id'>>;
