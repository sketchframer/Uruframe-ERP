import { describe, it, expect } from 'vitest';
import {
  areAllConformadoraJobsComplete,
  areAllJobsComplete,
  createPanelizadoJob,
} from './jobSequencing';

describe('jobSequencing', () => {
  describe('areAllConformadoraJobsComplete', () => {
    it('returns true when all CC jobs are completed', () => {
      const jobs = [
        { id: '1', projectId: 'P1', machineType: 'CONFORMADORA', status: 'COMPLETED' as const },
        { id: '2', projectId: 'P1', machineType: 'CONFORMADORA', status: 'COMPLETED' as const },
        { id: '3', projectId: 'P1', machineType: 'PANELIZADO', status: 'PENDING' as const },
      ];

      expect(areAllConformadoraJobsComplete(jobs, 'P1')).toBe(true);
    });

    it('returns false when some CC jobs are not completed', () => {
      const jobs = [
        { id: '1', projectId: 'P1', machineType: 'CONFORMADORA', status: 'COMPLETED' as const },
        { id: '2', projectId: 'P1', machineType: 'CONFORMADORA', status: 'IN_PROGRESS' as const },
      ];

      expect(areAllConformadoraJobsComplete(jobs, 'P1')).toBe(false);
    });

    it('returns false when there are no CC jobs', () => {
      const jobs = [
        { id: '1', projectId: 'P1', machineType: 'PANELIZADO', status: 'COMPLETED' as const },
      ];

      expect(areAllConformadoraJobsComplete(jobs, 'P1')).toBe(false);
    });

    it('ignores jobs from other projects', () => {
      const jobs = [
        { id: '1', projectId: 'P1', machineType: 'CONFORMADORA', status: 'COMPLETED' as const },
        { id: '2', projectId: 'P2', machineType: 'CONFORMADORA', status: 'PENDING' as const },
      ];

      expect(areAllConformadoraJobsComplete(jobs, 'P1')).toBe(true);
    });

    it('treats justCompletedJobId as completed', () => {
      const jobs = [
        { id: '1', projectId: 'P1', machineType: 'CONFORMADORA', status: 'COMPLETED' as const },
        { id: '2', projectId: 'P1', machineType: 'CONFORMADORA', status: 'IN_PROGRESS' as const },
      ];

      expect(areAllConformadoraJobsComplete(jobs, 'P1', '2')).toBe(true);
    });
  });

  describe('areAllJobsComplete', () => {
    it('returns true when all project jobs are completed', () => {
      const jobs = [
        { id: '1', projectId: 'P1', status: 'COMPLETED' as const },
        { id: '2', projectId: 'P1', status: 'COMPLETED' as const },
      ];

      expect(areAllJobsComplete(jobs, 'P1')).toBe(true);
    });

    it('returns false when any project job is not completed', () => {
      const jobs = [
        { id: '1', projectId: 'P1', status: 'COMPLETED' as const },
        { id: '2', projectId: 'P1', status: 'PENDING' as const },
      ];

      expect(areAllJobsComplete(jobs, 'P1')).toBe(false);
    });
  });

  describe('createPanelizadoJob', () => {
    it('creates a panelizado job with correct properties (no id)', () => {
      const job = createPanelizadoJob('P1', 'Test Project', 'M-PANEL');

      expect(job).toEqual({
        projectId: 'P1',
        productName: 'PANELIZADO: Test Project',
        targetQuantity: 1,
        completedQuantity: 0,
        unit: 'proyecto',
        machineType: 'PANELIZADO',
        status: 'PENDING',
        assignedMachineId: 'M-PANEL',
        priorityIndex: 99,
      });
      expect('id' in job).toBe(false);
    });
  });
});
