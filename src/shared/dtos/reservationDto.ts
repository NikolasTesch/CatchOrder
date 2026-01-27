export interface ReservationDTO {
  id: string;
  table_number: number;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  reservation_date: string;
  reservation_time: string;
  number_of_people: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateReservationDTO {
  table_number: number;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  reservation_date: string;
  reservation_time: string;
  number_of_people: number;
  notes?: string;
}

export interface UpdateReservationDTO {
  table_number?: number;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  reservation_date?: string;
  reservation_time?: string;
  number_of_people?: number;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
}
