export interface Category {
  id: string;
  name: string;
  slug: string;
}

export type CreateCategoryDTO = Omit<Category, 'id'>;
export type UpdateCategoryDTO = Partial<CreateCategoryDTO>;
