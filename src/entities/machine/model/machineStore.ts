import { create } from 'zustand';
import type { Machine, MachineStatus } from '@/shared/types';
import { machineRepository } from '../api/machineRepository';
import { INITIAL_MACHINES } from '@/shared/constants/seeds';

interface MachineState {
  machines: Machine[];
  isLoading: boolean;
  error: string | null;
}

interface MachineActions {
  fetchAll: () => Promise<void>;
  getById: (id: string) => Machine | undefined;
  getByOperator: (operatorId: string) => Machine[];
  getByType: (type: Machine['type']) => Machine[];
  updateStatus: (id: string, status: MachineStatus, reason?: string) => Promise<void>;
  assignOperator: (machineId: string, operatorId: string) => Promise<void>;
  removeOperator: (machineId: string, operatorId: string) => Promise<void>;
  setCurrentJob: (machineId: string, jobId: string | null) => Promise<void>;
  updateEfficiency: (id: string, efficiency: number) => Promise<void>;
  create: (machine: Omit<Machine, 'id'>) => Promise<Machine>;
  update: (id: string, updates: Partial<Machine>) => Promise<void>;
  delete: (id: string) => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useMachineStore = create<MachineState & MachineActions>()((set, get) => ({
  machines: [],
  isLoading: false,
  error: null,

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const machines = await machineRepository.getAll();
      set({ machines, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  getById: (id) => get().machines.find((m) => m.id === id),

  getByOperator: (operatorId) =>
    get().machines.filter((m) => m.operatorIds.includes(operatorId)),

  getByType: (type) => get().machines.filter((m) => m.type === type),

  updateStatus: async (id, status, reason) => {
    const updates: Partial<Machine> = { status };
    if (reason) updates.maintenanceReason = reason;
    await machineRepository.update(id, updates);
    set((state) => ({
      machines: state.machines.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    }));
  },

  assignOperator: async (machineId, operatorId) => {
    const machine = get().getById(machineId);
    if (!machine) return;
    const operatorIds = Array.from(new Set([...machine.operatorIds, operatorId]));
    await machineRepository.update(machineId, { operatorIds });
    set((state) => ({
      machines: state.machines.map((m) =>
        m.id === machineId ? { ...m, operatorIds } : m
      ),
    }));
  },

  removeOperator: async (machineId, operatorId) => {
    const machine = get().getById(machineId);
    if (!machine) return;
    const operatorIds = machine.operatorIds.filter((id) => id !== operatorId);
    await machineRepository.update(machineId, { operatorIds });
    set((state) => ({
      machines: state.machines.map((m) =>
        m.id === machineId ? { ...m, operatorIds } : m
      ),
    }));
  },

  setCurrentJob: async (machineId, jobId) => {
    await machineRepository.update(machineId, { currentJobId: jobId });
    set((state) => ({
      machines: state.machines.map((m) =>
        m.id === machineId ? { ...m, currentJobId: jobId } : m
      ),
    }));
  },

  updateEfficiency: async (id, efficiency) => {
    await machineRepository.update(id, { efficiency });
    set((state) => ({
      machines: state.machines.map((m) => (m.id === id ? { ...m, efficiency } : m)),
    }));
  },

  create: async (machine) => {
    const created = await machineRepository.create(machine);
    set((state) => ({ machines: [...state.machines, created] }));
    return created;
  },

  update: async (id, updates) => {
    await machineRepository.update(id, updates);
    set((state) => ({
      machines: state.machines.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    }));
  },

  delete: async (id) => {
    await machineRepository.delete(id);
    set((state) => ({ machines: state.machines.filter((m) => m.id !== id) }));
  },

  hydrate: async () => {
    set({ isLoading: true });
    let machines = await machineRepository.getAll();
    if (machines.length === 0) {
      for (const machine of INITIAL_MACHINES) {
        await machineRepository.create(machine);
      }
      machines = INITIAL_MACHINES;
    }
    set({ machines, isLoading: false });
  },
}));
