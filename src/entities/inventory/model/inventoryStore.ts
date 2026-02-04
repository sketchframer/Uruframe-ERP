import { create } from 'zustand';
import type { InventoryItem } from '@/shared/types';
import { inventoryRepository } from '../api/inventoryRepository';

interface InventoryState {
  inventory: InventoryItem[];
  isLoading: boolean;
}

interface InventoryActions {
  fetchAll: () => Promise<void>;
  getById: (id: string) => InventoryItem | undefined;
  create: (item: Omit<InventoryItem, 'id'>) => Promise<InventoryItem>;
  update: (id: string, updates: Partial<InventoryItem>) => Promise<void>;
  delete: (id: string) => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useInventoryStore = create<InventoryState & InventoryActions>()((set, get) => ({
  inventory: [],
  isLoading: false,

  fetchAll: async () => {
    set({ isLoading: true });
    const inventory = await inventoryRepository.getAll();
    set({ inventory, isLoading: false });
  },

  getById: (id) => get().inventory.find((i) => i.id === id),

  create: async (item) => {
    const created = await inventoryRepository.create(item);
    set((state) => ({ inventory: [...state.inventory, created] }));
    return created;
  },

  update: async (id, updates) => {
    await inventoryRepository.update(id, updates);
    set((state) => ({
      inventory: state.inventory.map((i) => (i.id === id ? { ...i, ...updates } : i)),
    }));
  },

  delete: async (id) => {
    await inventoryRepository.delete(id);
    set((state) => ({ inventory: state.inventory.filter((i) => i.id !== id) }));
  },

  hydrate: async () => {
    set({ isLoading: true });
    const inventory = await inventoryRepository.getAll();
    set({ inventory, isLoading: false });
  },
}));
