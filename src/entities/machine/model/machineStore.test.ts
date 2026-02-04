import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useMachineStore } from './machineStore';
import { MachineStatus } from '@/shared/types';

vi.mock('../api/machineRepository', () => ({
  machineRepository: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

import { machineRepository } from '../api/machineRepository';

describe('machineStore', () => {
  beforeEach(() => {
    useMachineStore.setState({
      machines: [],
      isLoading: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  describe('fetchAll', () => {
    it('loads machines and sets loading state', async () => {
      const mockMachines = [
        { id: 'M-01', name: 'Machine 1', status: MachineStatus.IDLE } as any,
      ];
      vi.mocked(machineRepository.getAll).mockResolvedValue(mockMachines);

      await useMachineStore.getState().fetchAll();

      expect(useMachineStore.getState().machines).toEqual(mockMachines);
      expect(useMachineStore.getState().isLoading).toBe(false);
    });

    it('handles errors', async () => {
      vi.mocked(machineRepository.getAll).mockRejectedValue(new Error('Network error'));

      await useMachineStore.getState().fetchAll();

      expect(useMachineStore.getState().error).toBe('Network error');
      expect(useMachineStore.getState().isLoading).toBe(false);
    });
  });

  describe('updateStatus', () => {
    it('updates machine status in store and repository', async () => {
      useMachineStore.setState({
        machines: [{ id: 'M-01', name: 'Machine 1', status: MachineStatus.IDLE }] as any,
      });
      vi.mocked(machineRepository.update).mockResolvedValue(undefined as any);

      await useMachineStore.getState().updateStatus('M-01', MachineStatus.RUNNING);

      expect(machineRepository.update).toHaveBeenCalledWith('M-01', {
        status: MachineStatus.RUNNING,
      });
      expect(useMachineStore.getState().machines[0].status).toBe(MachineStatus.RUNNING);
    });
  });

  describe('getById', () => {
    it('returns machine by id', () => {
      const machine = { id: 'M-01', name: 'Machine 1' } as any;
      useMachineStore.setState({ machines: [machine] });

      expect(useMachineStore.getState().getById('M-01')).toEqual(machine);
    });

    it('returns undefined for non-existent id', () => {
      useMachineStore.setState({ machines: [] });

      expect(useMachineStore.getState().getById('M-99')).toBeUndefined();
    });
  });
});
