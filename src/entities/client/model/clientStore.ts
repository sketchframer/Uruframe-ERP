import { create } from 'zustand';
import type { Client } from '@/shared/types';
import { clientRepository } from '../api/clientRepository';

interface ClientState {
  clients: Client[];
  isLoading: boolean;
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

  fetchAll: async () => {
    set({ isLoading: true });
    const clients = await clientRepository.getAll();
    set({ clients, isLoading: false });
  },

  getById: (id) => get().clients.find((c) => c.id === id),

  create: async (client) => {
    const created = await clientRepository.create(client);
    set((state) => ({ clients: [...state.clients, created] }));
    return created;
  },

  update: async (id, updates) => {
    await clientRepository.update(id, updates);
    set((state) => ({
      clients: state.clients.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
  },

  delete: async (id) => {
    await clientRepository.delete(id);
    set((state) => ({ clients: state.clients.filter((c) => c.id !== id) }));
  },

  hydrate: async () => {
    set({ isLoading: true });
    const clients = await clientRepository.getAll();
    set({ clients, isLoading: false });
  },

  refetch: async () => {
    const clients = await clientRepository.getAll();
    set({ clients });
  },
}));
