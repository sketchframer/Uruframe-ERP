import { create } from 'zustand';
import type { InventoryItem } from '@/shared/types';
import { inventoryRepository } from '../api/inventoryRepository';

interface InventoryState {
  inventory: InventoryItem[];
  isLoading: boolean;
  error: string | null;
}

interface InventoryActions {
  fetchAll: () => Promise<void>;
  getById: (id: string) => InventoryItem | undefined;
  create: (item: Omit<InventoryItem, 'id'>) => Promise<InventoryItem>;
  update: (id: string, updates: Partial<InventoryItem>) => Promise<void>;
  delete: (id: string) => Promise<void>;
  hydrate: () => Promise<void>;
  refetch: () => Promise<void>;
}

export const useInventoryStore = create<InventoryState & InventoryActions>()((set, get) => ({
  inventory: [],
  isLoading: false,
  error: null,

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const inventory = await inventoryRepository.getAll();
      set({ inventory, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  getById: (id) => get().inventory.find((i) => i.id === id),

  create: async (item) => {
    set({ error: null });
    try {
      const created = await inventoryRepository.create(item);
      set((state) => ({ inventory: [...state.inventory, created] }));
      return created;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  update: async (id, updates) => {
    set({ error: null });
    try {
      await inventoryRepository.update(id, updates);
      set((state) => ({
        inventory: state.inventory.map((i) => (i.id === id ? { ...i, ...updates } : i)),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  delete: async (id) => {
    set({ error: null });
    try {
      await inventoryRepository.delete(id);
      set((state) => ({ inventory: state.inventory.filter((i) => i.id !== id) }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  hydrate: async () => {
    set({ isLoading: true, error: null });
    try {
      const inventory = await inventoryRepository.getAll();
      set({ inventory, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  refetch: async () => {
    const inventory = await inventoryRepository.getAll();
    set({ inventory });
  },
}));
