export interface User {
  id: string;
  name: string;
  username: string;
  password_hash: string;
  role: string;
  created_at: Date;
}

export type CreateUserDTO = Omit<User, 'id' | 'created_at'>;
export type UpdateUserDTO = Partial<
  Omit<CreateUserDTO, 'password_hash' | 'role'>
>;
