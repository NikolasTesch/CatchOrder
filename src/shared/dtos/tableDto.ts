import { TableStatus } from '../types/table';

export interface TableDTO {
  id: string;
  number: number;
  status: TableStatus;
}

export interface CreateTableDTO {
  id: string;
  number: number;
  status?: TableStatus;
}

export interface UpdateTableDTO {
  number?: number;
  status?: TableStatus;
}
