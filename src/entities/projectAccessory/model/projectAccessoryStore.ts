import { create } from 'zustand';
import type { ProjectAccessory } from '@/shared/types';
import { projectAccessoryRepository } from '../api/projectAccessoryRepository';

interface ProjectAccessoryState {
  projectAccessories: ProjectAccessory[];
  isLoading: boolean;
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

  fetchAll: async () => {
    set({ isLoading: true });
    const projectAccessories = await projectAccessoryRepository.getAll();
    set({ projectAccessories, isLoading: false });
  },

  getById: (id) =>
    get().projectAccessories.find((a) => a.id === id),

  getByProject: (projectId) =>
    get().projectAccessories.filter((a) => a.projectId === projectId),

  create: async (item) => {
    const created = await projectAccessoryRepository.create(item);
    set((state) => ({
      projectAccessories: [...state.projectAccessories, created],
    }));
    return created;
  },

  update: async (id, updates) => {
    await projectAccessoryRepository.update(id, updates);
    set((state) => ({
      projectAccessories: state.projectAccessories.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      ),
    }));
  },

  delete: async (id) => {
    await projectAccessoryRepository.delete(id);
    set((state) => ({
      projectAccessories: state.projectAccessories.filter((a) => a.id !== id),
    }));
  },

  hydrate: async () => {
    set({ isLoading: true });
    const projectAccessories = await projectAccessoryRepository.getAll();
    set({ projectAccessories, isLoading: false });
  },

  refetch: async () => {
    const projectAccessories = await projectAccessoryRepository.getAll();
    set({ projectAccessories });
  },
}));
