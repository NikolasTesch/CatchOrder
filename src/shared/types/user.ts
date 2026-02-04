export enum userRole {
  MANAGER = 'manager',
  WAITER = 'waiter',
}
export interface User {
  id: string;
  name: string;
  username: string;
  password_hash: string;
  role: userRole;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserPayload {
  id: string;
  email: string;
  iat: number;
  exp: number;
  role: userRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}
