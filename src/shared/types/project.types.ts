export interface Project {
  id: string;
  name: string;
  clientId?: string;
  deadline: string;
  status: 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED' | 'ARCHIVED';
  description?: string;
  budget?: number;
}
