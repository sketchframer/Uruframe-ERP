
export enum MachineStatus {
  RUNNING = 'RUNNING',
  IDLE = 'IDLE',
  MAINTENANCE = 'MAINTENANCE',
  ERROR = 'ERROR',
  OFFLINE = 'OFFLINE'
}

export enum EventType {
  JOB_START = 'JOB_START',
  JOB_COMPLETE = 'JOB_COMPLETE',
  COIL_CHANGE = 'COIL_CHANGE',
  ERROR_LOG = 'ERROR_LOG',
  QUALITY_CHECK = 'QUALITY_CHECK',
  CALIBRATION = 'CALIBRATION',
  CLEANING = 'CLEANING',
  STAGE_COMPLETE = 'STAGE_COMPLETE',
  SCRAP_REPORT = 'SCRAP_REPORT'
}

export type Role = 'ADMIN' | 'OPERATOR' | 'SUPERVISOR';

export interface User {
  id: string;
  name: string;
  role: Role;
  pin: string; 
  avatar?: string;
}

export interface SystemMessage {
  id: string;
  from: string;
  to: string; // 'ALL' o userId
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface Client {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address?: string;
  taxId?: string;
}

export interface Machine {
  id: string;
  name: string;
  type: 'CONFORMADORA' | 'PANELIZADO' | 'SOLDADURA' | 'PINTURA' | 'CARGA' | 'PANELES_SIP' | 'HERRERIA';
  category?: 'STANDARD' | 'STRUCTURAL';
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

export interface Project {
  id: string;
  name: string;
  clientId: string; 
  deadline: string; 
  status: 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED' | 'ARCHIVED';
  description?: string;
  budget?: number;
}

export type WorkflowStageName = 'CORTE' | 'SOLDADURA' | 'PINTURA' | 'TERMINADO';

export interface WorkflowStage {
    name: WorkflowStageName;
    isCompleted: boolean;
    completedAt?: string;
}

export interface Job {
  id: string;
  projectId: string; 
  machineType: Machine['type']; 
  assignedMachineId?: string; 
  operatorIds?: string[]; // Asignación específica por orden
  productName: string; 
  targetQuantity: number;
  completedQuantity: number;
  scrapQuantity?: number; 
  unit: string; 
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'HALTED';
  startDate?: string;
  endDate?: string;
  priorityIndex?: number;
  fileUrl?: string; 
  notes?: string; 
  operatorNotes?: string; 
  requiresPanelizado?: boolean;
  linkedJobId?: string;
  workflowStages?: WorkflowStage[];
  currentCoilId?: string; 
  isStock?: boolean;
  tonnage?: number;
  completedAt?: string;
}

export interface FactoryEvent {
  id: string;
  timestamp: string; 
  machineId: string;
  type: EventType;
  description: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unit: 'kg' | 'm' | 'units' | 'L';
  minThreshold: number;
  location: string;
  isManufactured?: boolean; 
}

export interface SystemAlert {
  id: string;
  type: 'MACHINE_STOPPED' | 'UNASSIGNED_OPERATOR' | 'DELAY_RISK' | 'LOW_STOCK' | 'JOB_READY' | 'PROJECT_COMPLETED' | 'OPERATOR_ALERT' | 'MAINTENANCE_DUE' | 'JOB_FINISHED' | 'READY_FOR_DELIVERY';
  message: string;
  timestamp: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  relatedId?: string; 
}

export interface ProfileCatalogItem {
    sku: string;
    name: string;
    description: string;
}

export interface ProjectAccessory {
  id: string;
  projectId: string;
  inventoryItemId: string;
  quantityRequired: number;
  quantityAllocated: number;
  isFulfilled: boolean;
}
