import { create } from 'zustand';
import type { Client } from '@/shared/types';
import { clientRepository } from '../api/clientRepository';

interface ClientState {
  clients: Client[];
  isLoading: boolean;
  error: string | null;
}

interface ClientActions {
  fetchAll: () => Promise<void>;
  getById: (id: string) => Client | undefined;
  create: (client: Omit<Client, 'id'>) => Promise<Client>;
  update: (id: string, updates: Partial<Client>) => Promise<void>;
  delete: (id: string) => Promise<void>;
  hydrate: () => Promise<void>;
  refetch: () => Promise<void>;
}

export const useClientStore = create<ClientState & ClientActions>()((set, get) => ({
  clients: [],
  isLoading: false,
  error: null,

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const clients = await clientRepository.getAll();
      set({ clients, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  getById: (id) => get().clients.find((c) => c.id === id),

  create: async (client) => {
    set({ error: null });
    try {
      const created = await clientRepository.create(client);
      set((state) => ({ clients: [...state.clients, created] }));
      return created;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  update: async (id, updates) => {
    set({ error: null });
    try {
      await clientRepository.update(id, updates);
      set((state) => ({
        clients: state.clients.map((c) => (c.id === id ? { ...c, ...updates } : c)),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  delete: async (id) => {
    set({ error: null });
    try {
      await clientRepository.delete(id);
      set((state) => ({ clients: state.clients.filter((c) => c.id !== id) }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  hydrate: async () => {
    set({ isLoading: true, error: null });
    try {
      const clients = await clientRepository.getAll();
      set({ clients, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  refetch: async () => {
    const clients = await clientRepository.getAll();
    set({ clients });
  },
}));
