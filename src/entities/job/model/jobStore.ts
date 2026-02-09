import { create } from 'zustand';
import type { Job } from '@/shared/types';
import { jobRepository } from '../api/jobRepository';

interface JobState {
  jobs: Job[];
  isLoading: boolean;
  error: string | null;
}

interface JobActions {
  fetchAll: () => Promise<void>;
  getById: (id: string) => Job | undefined;
  getByProject: (projectId: string) => Job[];
  getByMachine: (machineId: string) => Job[];
  getQueue: (machineId: string) => Job[];
  create: (job: Omit<Job, 'id'>) => Promise<Job>;
  updateProgress: (id: string, completedQuantity: number) => Promise<void>;
  complete: (id: string, operatorNotes?: string) => Promise<void>;
  updateStatus: (id: string, status: Job['status']) => Promise<void>;
  update: (id: string, updates: Partial<Job>) => Promise<void>;
  delete: (id: string) => Promise<void>;
  hydrate: () => Promise<void>;
  refetch: () => Promise<void>;
}

export const useJobStore = create<JobState & JobActions>()((set, get) => ({
  jobs: [],
  isLoading: false,
  error: null,

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const jobs = await jobRepository.getAll();
      set({ jobs, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  getById: (id) => get().jobs.find((j) => j.id === id),

  getByProject: (projectId) =>
    get().jobs.filter((j) => j.projectId === projectId),

  getByMachine: (machineId) =>
    get().jobs.filter((j) => j.assignedMachineId === machineId),

  getQueue: (machineId) =>
    get()
      .jobs.filter(
        (j) => j.assignedMachineId === machineId && j.status !== 'COMPLETED'
      )
      .sort((a, b) => (a.priorityIndex ?? 0) - (b.priorityIndex ?? 0)),

  create: async (job) => {
    set({ error: null });
    try {
      const created = await jobRepository.create({ ...job, completedQuantity: 0, status: 'PENDING' });
      set((state) => ({ jobs: [...state.jobs, created] }));
      return created;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  updateProgress: async (id, completedQuantity) => {
    set({ error: null });
    try {
      await jobRepository.update(id, { completedQuantity });
      set((state) => ({
        jobs: state.jobs.map((j) => (j.id === id ? { ...j, completedQuantity } : j)),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  complete: async (id, operatorNotes) => {
    set({ error: null });
    try {
      const job = get().getById(id);
      if (!job) return;
      const updates: Partial<Job> = {
        status: 'COMPLETED',
        completedQuantity: job.targetQuantity,
        completedAt: new Date().toISOString(),
        operatorNotes,
      };
      await jobRepository.update(id, updates);
      set((state) => ({
        jobs: state.jobs.map((j) => (j.id === id ? { ...j, ...updates } : j)),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  updateStatus: async (id, status) => {
    set({ error: null });
    try {
      await jobRepository.update(id, { status });
      set((state) => ({
        jobs: state.jobs.map((j) => (j.id === id ? { ...j, status } : j)),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  update: async (id, updates) => {
    set({ error: null });
    try {
      await jobRepository.update(id, updates);
      set((state) => ({
        jobs: state.jobs.map((j) => (j.id === id ? { ...j, ...updates } : j)),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  delete: async (id) => {
    set({ error: null });
    try {
      await jobRepository.delete(id);
      set((state) => ({ jobs: state.jobs.filter((j) => j.id !== id) }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  hydrate: async () => {
    set({ isLoading: true, error: null });
    try {
      const jobs = await jobRepository.getAll();
      set({ jobs, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  refetch: async () => {
    const jobs = await jobRepository.getAll();
    set({ jobs });
  },
}));
