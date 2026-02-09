import { create } from 'zustand';
import type { FactoryEvent } from '@/shared/types';
import { eventRepository } from '../api/eventRepository';
import { generateEventId } from '@/shared/utils/id';

interface EventState {
  events: FactoryEvent[];
  isLoading: boolean;
  error: string | null;
}

interface EventActions {
  fetchAll: () => Promise<void>;
  add: (event: Omit<FactoryEvent, 'id' | 'timestamp'>) => Promise<FactoryEvent>;
  create: (event: Omit<FactoryEvent, 'id'>) => Promise<FactoryEvent>;
  hydrate: () => Promise<void>;
  refetch: () => Promise<void>;
}

export const useEventStore = create<EventState & EventActions>()((set) => ({
  events: [],
  isLoading: false,
  error: null,

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const events = await eventRepository.getAll();
      set({ events, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  add: async (event) => {
    set({ error: null });
    try {
      const newEvent: FactoryEvent = {
        ...event,
        id: generateEventId(),
        timestamp: new Date().toISOString(),
      };
      await eventRepository.create(newEvent);
      set((state) => ({ events: [newEvent, ...state.events] }));
      return newEvent;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  create: async (event) => {
    set({ error: null });
    try {
      const created = await eventRepository.create(event);
      set((state) => ({ events: [created, ...state.events] }));
      return created;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  hydrate: async () => {
    set({ isLoading: true, error: null });
    try {
      const events = await eventRepository.getAll();
      set({ events, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  refetch: async () => {
    const events = await eventRepository.getAll();
    set({ events });
  },
}));
