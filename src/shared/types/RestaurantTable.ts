export interface RestaurantTable {
  id: string;
  number: number;
  status: string;
}

export type CreateRestaurantTableDTO = Omit<RestaurantTable, 'id'>;
export type UpdateRestaurantTableDTO = Partial<CreateRestaurantTableDTO>;
