export interface Order {
  id: string;
  table_id: string;
  user_id: string;
  status: string;
  total: number;
  opened_at: Date;
  closed_at?: Date;
}

export type CreateOrderDTO = Omit<Order, 'id' | 'opened_at' | 'closed_at'>;
export type UpdateOrderDTO = Partial<
  Omit<Order, 'id' | 'table_id' | 'user_id' | 'opened_at'>
>;
