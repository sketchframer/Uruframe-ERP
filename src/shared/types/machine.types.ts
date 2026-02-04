export enum MachineStatus {
  RUNNING = 'RUNNING',
  IDLE = 'IDLE',
  MAINTENANCE = 'MAINTENANCE',
  ERROR = 'ERROR',
  OFFLINE = 'OFFLINE',
}

export type MachineType =
  | 'CONFORMADORA'
  | 'PANELIZADO'
  | 'SOLDADURA'
  | 'PINTURA'
  | 'CARGA'
  | 'PANELES_SIP'
  | 'HERRERIA';

export type MachineCategory = 'STANDARD' | 'STRUCTURAL';

export interface Machine {
  id: string;
  name: string;
  type: MachineType;
  category?: MachineCategory;
  brand?: string;
  status: MachineStatus;
  currentJobId: string | null;
  operatorIds: string[];
  efficiency: number;
  oee_availability: number;
  oee_performance: number;
  oee_quality: number;
  temperature?: number;
  lastMaintenance?: string;
  maintenanceReason?: string;
  isActive: boolean;
  color?: string;
  totalMetersProduced: number;
  nextMaintenanceMeters: number;
}
