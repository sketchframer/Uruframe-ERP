import { create } from 'zustand';
import type { SystemMessage } from '@/shared/types';
import { messageRepository } from '../api/messageRepository';
import { generateMessageId } from '@/shared/utils/id';

interface MessageState {
  messages: SystemMessage[];
  isLoading: boolean;
}

interface MessageActions {
  fetchAll: () => Promise<void>;
  getById: (id: string) => SystemMessage | undefined;
  add: (msg: Omit<SystemMessage, 'id' | 'timestamp'>) => Promise<SystemMessage>;
  create: (msg: Omit<SystemMessage, 'id'>) => Promise<SystemMessage>;
  update: (id: string, updates: Partial<SystemMessage>) => Promise<void>;
  delete: (id: string) => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useMessageStore = create<MessageState & MessageActions>()((set, get) => ({
  messages: [],
  isLoading: false,

  fetchAll: async () => {
    set({ isLoading: true });
    const messages = await messageRepository.getAll();
    set({ messages, isLoading: false });
  },

  getById: (id) => get().messages.find((m) => m.id === id),

  add: async (msg) => {
    const newMsg: SystemMessage = {
      ...msg,
      id: generateMessageId(),
      timestamp: new Date().toISOString(),
    };
    await messageRepository.create(newMsg);
    set((state) => ({ messages: [...state.messages, newMsg] }));
    return newMsg;
  },

  create: async (msg) => {
    const created = await messageRepository.create(msg);
    set((state) => ({ messages: [...state.messages, created] }));
    return created;
  },

  update: async (id, updates) => {
    await messageRepository.update(id, updates);
    set((state) => ({
      messages: state.messages.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    }));
  },

  delete: async (id) => {
    await messageRepository.delete(id);
    set((state) => ({ messages: state.messages.filter((m) => m.id !== id) }));
  },

  hydrate: async () => {
    set({ isLoading: true });
    const messages = await messageRepository.getAll();
    set({ messages, isLoading: false });
  },
}));
