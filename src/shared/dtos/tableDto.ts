import { TableStatus } from '../types/table';

export interface TableDTO {
  id: string;
  number: number;
  status: TableStatus;
  waiter_id?: string;
}

export interface CreateTableDTO {
  id: string;
  number: number;
  status?: TableStatus;
  waiter_id?: string;
}

export interface UpdateTableDTO {
  number?: number;
  status?: TableStatus;
  waiter_id?: string;
}
