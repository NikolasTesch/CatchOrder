export interface Product {
  id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image_path: string;
  is_active: boolean;
}

export type CreateProductDTO = Omit<Product, 'id'>;
export type UpdateProductDTO = Partial<CreateProductDTO>;
