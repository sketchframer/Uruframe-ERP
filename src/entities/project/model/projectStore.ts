import { create } from 'zustand';
import type { Project } from '@/shared/types';
import { projectRepository } from '../api/projectRepository';

interface ProjectState {
  projects: Project[];
  isLoading: boolean;
}

interface ProjectActions {
  fetchAll: () => Promise<void>;
  getById: (id: string) => Project | undefined;
  create: (project: Omit<Project, 'id'>) => Promise<Project>;
  update: (id: string, updates: Partial<Project>) => Promise<void>;
  delete: (id: string) => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useProjectStore = create<ProjectState & ProjectActions>()((set, get) => ({
  projects: [],
  isLoading: false,

  fetchAll: async () => {
    set({ isLoading: true });
    const projects = await projectRepository.getAll();
    set({ projects, isLoading: false });
  },

  getById: (id) => get().projects.find((p) => p.id === id),

  create: async (project) => {
    const created = await projectRepository.create(project);
    set((state) => ({ projects: [...state.projects, created] }));
    return created;
  },

  update: async (id, updates) => {
    await projectRepository.update(id, updates);
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  },

  delete: async (id) => {
    await projectRepository.delete(id);
    set((state) => ({ projects: state.projects.filter((p) => p.id !== id) }));
  },

  hydrate: async () => {
    set({ isLoading: true });
    const projects = await projectRepository.getAll();
    set({ projects, isLoading: false });
  },
}));
