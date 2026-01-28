export interface User {
  id: string;
  name: string;
  username: string;
  password_hash: string;
  role: string;
  created_at?: string;
  updated_at?: string;
}
