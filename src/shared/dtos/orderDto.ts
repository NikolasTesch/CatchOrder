export interface OrderDTO {
  id: string;
  table_id: string;
  user_id: string;
  status: 'OPEN' | 'CLOSED';
  total: number;
  tip: number;
  opened_at: string;
  closed_at?: string;
  items?: OrderItemDTO[];
  observations?: string;
}

export interface CreateOrderDTO {
  table_id: string;
  user_id: string;
}

export interface UpdateOrderDTO {
  status?: "OPEN" | "CLOSED";
  total?: number;
  tip?: number;
  closed_at?: string;
  observations?: string;
  table_id?: string;
  user_id?: string;
}

export interface OrderItemDTO {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_item: number;
  product_name?: string;
  created_at?: string;
  delivered_at?: string;
}
