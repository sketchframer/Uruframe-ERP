import { create } from 'zustand';
import type { ProjectAccessory } from '@/shared/types';
import { projectAccessoryRepository } from '../api/projectAccessoryRepository';

interface ProjectAccessoryState {
  projectAccessories: ProjectAccessory[];
  isLoading: boolean;
  error: string | null;
}

interface ProjectAccessoryActions {
  fetchAll: () => Promise<void>;
  getById: (id: string) => ProjectAccessory | undefined;
  getByProject: (projectId: string) => ProjectAccessory[];
  create: (item: Omit<ProjectAccessory, 'id'>) => Promise<ProjectAccessory>;
  update: (id: string, updates: Partial<ProjectAccessory>) => Promise<void>;
  delete: (id: string) => Promise<void>;
  hydrate: () => Promise<void>;
  refetch: () => Promise<void>;
}

export const useProjectAccessoryStore = create<
  ProjectAccessoryState & ProjectAccessoryActions
>()((set, get) => ({
  projectAccessories: [],
  isLoading: false,
  error: null,

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const projectAccessories = await projectAccessoryRepository.getAll();
      set({ projectAccessories, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  getById: (id) =>
    get().projectAccessories.find((a) => a.id === id),

  getByProject: (projectId) =>
    get().projectAccessories.filter((a) => a.projectId === projectId),

  create: async (item) => {
    set({ error: null });
    try {
      const created = await projectAccessoryRepository.create(item);
      set((state) => ({
        projectAccessories: [...state.projectAccessories, created],
      }));
      return created;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  update: async (id, updates) => {
    set({ error: null });
    try {
      await projectAccessoryRepository.update(id, updates);
      set((state) => ({
        projectAccessories: state.projectAccessories.map((a) =>
          a.id === id ? { ...a, ...updates } : a
        ),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  delete: async (id) => {
    set({ error: null });
    try {
      await projectAccessoryRepository.delete(id);
      set((state) => ({
        projectAccessories: state.projectAccessories.filter((a) => a.id !== id),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  hydrate: async () => {
    set({ isLoading: true, error: null });
    try {
      const projectAccessories = await projectAccessoryRepository.getAll();
      set({ projectAccessories, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  refetch: async () => {
    const projectAccessories = await projectAccessoryRepository.getAll();
    set({ projectAccessories });
  },
}));
