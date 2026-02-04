import { create } from 'zustand';
import type { FactoryEvent } from '@/shared/types';
import { eventRepository } from '../api/eventRepository';
import { generateEventId } from '@/shared/utils/id';

interface EventState {
  events: FactoryEvent[];
  isLoading: boolean;
}

interface EventActions {
  fetchAll: () => Promise<void>;
  add: (event: Omit<FactoryEvent, 'id' | 'timestamp'>) => Promise<FactoryEvent>;
  create: (event: Omit<FactoryEvent, 'id'>) => Promise<FactoryEvent>;
  hydrate: () => Promise<void>;
}

export const useEventStore = create<EventState & EventActions>()((set, get) => ({
  events: [],
  isLoading: false,

  fetchAll: async () => {
    set({ isLoading: true });
    const events = await eventRepository.getAll();
    set({ events, isLoading: false });
  },

  add: async (event) => {
    const newEvent: FactoryEvent = {
      ...event,
      id: generateEventId(),
      timestamp: new Date().toISOString(),
    };
    await eventRepository.create(newEvent);
    set((state) => ({ events: [newEvent, ...state.events] }));
    return newEvent;
  },

  create: async (event) => {
    const created = await eventRepository.create(event);
    set((state) => ({ events: [created, ...state.events] }));
    return created;
  },

  hydrate: async () => {
    set({ isLoading: true });
    const events = await eventRepository.getAll();
    set({ events, isLoading: false });
  },
}));
