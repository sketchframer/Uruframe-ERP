import { create } from 'zustand';
import type { Project } from '@/shared/types';
import { projectRepository } from '../api/projectRepository';

interface ProjectState {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
}

interface ProjectActions {
  fetchAll: () => Promise<void>;
  getById: (id: string) => Project | undefined;
  create: (project: Omit<Project, 'id'>) => Promise<Project>;
  update: (id: string, updates: Partial<Project>) => Promise<void>;
  delete: (id: string) => Promise<void>;
  hydrate: () => Promise<void>;
  refetch: () => Promise<void>;
}

export const useProjectStore = create<ProjectState & ProjectActions>()((set, get) => ({
  projects: [],
  isLoading: false,
  error: null,

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const projects = await projectRepository.getAll();
      set({ projects, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  getById: (id) => get().projects.find((p) => p.id === id),

  create: async (project) => {
    set({ error: null });
    try {
      const created = await projectRepository.create(project);
      set((state) => ({ projects: [...state.projects, created] }));
      return created;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  update: async (id, updates) => {
    set({ error: null });
    try {
      await projectRepository.update(id, updates);
      set((state) => ({
        projects: state.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  delete: async (id) => {
    set({ error: null });
    try {
      await projectRepository.delete(id);
      set((state) => ({ projects: state.projects.filter((p) => p.id !== id) }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  hydrate: async () => {
    set({ isLoading: true, error: null });
    try {
      const projects = await projectRepository.getAll();
      set({ projects, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  refetch: async () => {
    const projects = await projectRepository.getAll();
    set({ projects });
  },
}));
