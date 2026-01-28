import type { User } from '../types/user';

export type UserDTO = User;

export type CreateUserDTO = Omit<User, 'id' | 'created_at' | 'updated_at'>;

export type UpdateUserDTO = Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>;
