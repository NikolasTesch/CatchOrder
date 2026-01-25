export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
}

export type CreateOrderItemDTO = Omit<OrderItem, 'id'>;
export type UpdateOrderItemDTO = Partial<
  Omit<CreateOrderItemDTO, 'order_id' | 'product_id'>
>;
