import { create } from 'zustand';
import type { SystemMessage } from '@/shared/types';
import { messageRepository } from '../api/messageRepository';
import { generateMessageId } from '@/shared/utils/id';

interface MessageState {
  messages: SystemMessage[];
  isLoading: boolean;
  error: string | null;
}

interface MessageActions {
  fetchAll: () => Promise<void>;
  getById: (id: string) => SystemMessage | undefined;
  add: (msg: Omit<SystemMessage, 'id' | 'timestamp'>) => Promise<SystemMessage>;
  create: (msg: Omit<SystemMessage, 'id'>) => Promise<SystemMessage>;
  update: (id: string, updates: Partial<SystemMessage>) => Promise<void>;
  delete: (id: string) => Promise<void>;
  hydrate: () => Promise<void>;
  refetch: () => Promise<void>;
}

export const useMessageStore = create<MessageState & MessageActions>()((set, get) => ({
  messages: [],
  isLoading: false,
  error: null,

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const messages = await messageRepository.getAll();
      set({ messages, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  getById: (id) => get().messages.find((m) => m.id === id),

  add: async (msg) => {
    set({ error: null });
    try {
      const newMsg: SystemMessage = {
        ...msg,
        id: generateMessageId(),
        timestamp: new Date().toISOString(),
      };
      await messageRepository.create(newMsg);
      set((state) => ({ messages: [...state.messages, newMsg] }));
      return newMsg;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  create: async (msg) => {
    set({ error: null });
    try {
      const created = await messageRepository.create(msg);
      set((state) => ({ messages: [...state.messages, created] }));
      return created;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  update: async (id, updates) => {
    set({ error: null });
    try {
      await messageRepository.update(id, updates);
      set((state) => ({
        messages: state.messages.map((m) => (m.id === id ? { ...m, ...updates } : m)),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  delete: async (id) => {
    set({ error: null });
    try {
      await messageRepository.delete(id);
      set((state) => ({ messages: state.messages.filter((m) => m.id !== id) }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  hydrate: async () => {
    set({ isLoading: true, error: null });
    try {
      const messages = await messageRepository.getAll();
      set({ messages, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  refetch: async () => {
    const messages = await messageRepository.getAll();
    set({ messages });
  },
}));
