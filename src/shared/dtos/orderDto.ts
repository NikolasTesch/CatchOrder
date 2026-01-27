export interface OrderDTO {
    id: string;
    table_id: string;
    user_id: string;
    status: 'OPEN' | 'CLOSED';
    total: number;
    opened_at: string;
    closed_at?: string;
}

export interface CreateOrderDTO {
    table_id: string;
    user_id: string;
}

export interface UpdateOrderDTO {
    status?: 'OPEN' | 'CLOSED';
    total?: number;
    closed_at?: string;
}

export interface OrderItemDTO {
    id: string;
    order_id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    total_item: number;
}
