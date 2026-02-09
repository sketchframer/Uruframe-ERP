import { create } from 'zustand';
import type { SystemAlert } from '@/shared/types';
import { alertRepository } from '../api/alertRepository';
import { generateAlertId } from '@/shared/utils/id';

interface AlertState {
  alerts: SystemAlert[];
  isLoading: boolean;
  error: string | null;
}

interface AlertActions {
  fetchAll: () => Promise<void>;
  getById: (id: string) => SystemAlert | undefined;
  add: (alert: Omit<SystemAlert, 'id' | 'timestamp'>) => Promise<SystemAlert>;
  create: (alert: Omit<SystemAlert, 'id'>) => Promise<SystemAlert>;
  update: (id: string, updates: Partial<SystemAlert>) => Promise<void>;
  delete: (id: string) => Promise<void>;
  hydrate: () => Promise<void>;
  refetch: () => Promise<void>;
}

export const useAlertStore = create<AlertState & AlertActions>()((set, get) => ({
  alerts: [],
  isLoading: false,
  error: null,

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const alerts = await alertRepository.getAll();
      set({ alerts, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  getById: (id) => get().alerts.find((a) => a.id === id),

  add: async (alert) => {
    set({ error: null });
    try {
      const newAlert: SystemAlert = {
        ...alert,
        id: generateAlertId(),
        timestamp: new Date().toISOString(),
      };
      await alertRepository.create(newAlert);
      set((state) => ({ alerts: [newAlert, ...state.alerts] }));
      return newAlert;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  create: async (alert) => {
    set({ error: null });
    try {
      const created = await alertRepository.create(alert);
      set((state) => ({ alerts: [created, ...state.alerts] }));
      return created;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  update: async (id, updates) => {
    set({ error: null });
    try {
      await alertRepository.update(id, updates);
      set((state) => ({
        alerts: state.alerts.map((a) => (a.id === id ? { ...a, ...updates } : a)),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  delete: async (id) => {
    set({ error: null });
    try {
      await alertRepository.delete(id);
      set((state) => ({ alerts: state.alerts.filter((a) => a.id !== id) }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  hydrate: async () => {
    set({ isLoading: true, error: null });
    try {
      const alerts = await alertRepository.getAll();
      set({ alerts, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  refetch: async () => {
    const alerts = await alertRepository.getAll();
    set({ alerts });
  },
}));
