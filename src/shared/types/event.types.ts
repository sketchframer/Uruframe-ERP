export enum EventType {
  JOB_START = 'JOB_START',
  JOB_COMPLETE = 'JOB_COMPLETE',
  COIL_CHANGE = 'COIL_CHANGE',
  ERROR_LOG = 'ERROR_LOG',
  QUALITY_CHECK = 'QUALITY_CHECK',
  CALIBRATION = 'CALIBRATION',
  CLEANING = 'CLEANING',
  STAGE_COMPLETE = 'STAGE_COMPLETE',
  SCRAP_REPORT = 'SCRAP_REPORT',
}

export interface FactoryEvent {
  id: string;
  timestamp: string;
  machineId: string;
  type: EventType;
  description: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}
