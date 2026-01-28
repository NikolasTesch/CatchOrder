export enum TableStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  RESERVED = 'RESERVED',
}

export interface Table {
  id: string;
  number: number;
  status: TableStatus;
}
