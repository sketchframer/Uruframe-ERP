export type Role = 'ADMIN' | 'OPERATOR' | 'SUPERVISOR';

export interface User {
  id: string;
  name: string;
  role: Role;
  pin: string;
  avatar?: string;
}
