export type SystemAlertType =
  | 'MACHINE_STOPPED'
  | 'UNASSIGNED_OPERATOR'
  | 'DELAY_RISK'
  | 'LOW_STOCK'
  | 'JOB_READY'
  | 'PROJECT_COMPLETED'
  | 'OPERATOR_ALERT'
  | 'MAINTENANCE_DUE'
  | 'JOB_FINISHED'
  | 'READY_FOR_DELIVERY';

export interface SystemAlert {
  id: string;
  type: SystemAlertType;
  message: string;
  timestamp: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  relatedId?: string;
}
