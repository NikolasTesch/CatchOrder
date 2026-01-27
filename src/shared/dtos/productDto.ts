import type { Product } from '../types/product.js';

// DTO é igual à entidade Product (pode ser estendido se necessário)
export type ProductDTO = Product;

// Para criação: id é obrigatório, mas campos opcionais têm defaults
export type CreateProductDTO = Omit<Product, 'description' | 'image_path' | 'is_active'> & {
  description?: string | null;
  image_path?: string | null;
  is_active?: boolean;
};

// Para atualização: todos os campos são opcionais, exceto id que não pode ser alterado
export type UpdateProductDTO = Partial<Omit<Product, 'id'>>;

