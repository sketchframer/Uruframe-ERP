import { create } from 'zustand';
import type { SystemAlert } from '@/shared/types';
import { alertRepository } from '../api/alertRepository';
import { generateAlertId } from '@/shared/utils/id';

interface AlertState {
  alerts: SystemAlert[];
  isLoading: boolean;
}

interface AlertActions {
  fetchAll: () => Promise<void>;
  getById: (id: string) => SystemAlert | undefined;
  add: (alert: Omit<SystemAlert, 'id' | 'timestamp'>) => Promise<SystemAlert>;
  create: (alert: Omit<SystemAlert, 'id'>) => Promise<SystemAlert>;
  update: (id: string, updates: Partial<SystemAlert>) => Promise<void>;
  delete: (id: string) => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAlertStore = create<AlertState & AlertActions>()((set, get) => ({
  alerts: [],
  isLoading: false,

  fetchAll: async () => {
    set({ isLoading: true });
    const alerts = await alertRepository.getAll();
    set({ alerts, isLoading: false });
  },

  getById: (id) => get().alerts.find((a) => a.id === id),

  add: async (alert) => {
    const newAlert: SystemAlert = {
      ...alert,
      id: generateAlertId(),
      timestamp: new Date().toISOString(),
    };
    await alertRepository.create(newAlert);
    set((state) => ({ alerts: [newAlert, ...state.alerts] }));
    return newAlert;
  },

  create: async (alert) => {
    const created = await alertRepository.create(alert);
    set((state) => ({ alerts: [created, ...state.alerts] }));
    return created;
  },

  update: async (id, updates) => {
    await alertRepository.update(id, updates);
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    }));
  },

  delete: async (id) => {
    await alertRepository.delete(id);
    set((state) => ({ alerts: state.alerts.filter((a) => a.id !== id) }));
  },

  hydrate: async () => {
    set({ isLoading: true });
    const alerts = await alertRepository.getAll();
    set({ alerts, isLoading: false });
  },
}));
