export interface Product {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  image_path: string | null;
  is_active: boolean;
  preparation_time: number; // Novo campo
}
