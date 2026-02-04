import type { MachineType } from './machine.types';

export type WorkflowStageName = 'CORTE' | 'SOLDADURA' | 'PINTURA' | 'TERMINADO';

export interface WorkflowStage {
  name: WorkflowStageName;
  isCompleted: boolean;
  completedAt?: string;
}

export interface Job {
  id: string;
  projectId: string;
  machineType: MachineType;
  assignedMachineId?: string;
  operatorIds?: string[];
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
