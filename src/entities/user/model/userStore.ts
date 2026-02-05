import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/shared/types';
import { USE_API } from '@/shared/api';
import { userRepository } from '../api/userRepository';
import { INITIAL_USERS } from '@/shared/constants/seeds';

interface UserState {
  users: User[];
  currentUser: User | null;
  isLoading: boolean;
}

interface UserActions {
  fetchAll: () => Promise<void>;
  login: (pin: string) => Promise<User | null>;
  logout: () => void;
  setCurrentUser: (user: User | null) => void;
  create: (user: Omit<User, 'id'>) => Promise<User>;
  update: (id: string, updates: Partial<User>) => Promise<void>;
  delete: (id: string) => Promise<void>;
  hydrate: () => Promise<void>;
  refetch: () => Promise<void>;
}

export const useUserStore = create<UserState & UserActions>()(
  persist(
    (set, get) => ({
      users: [],
      currentUser: null,
      isLoading: false,

      fetchAll: async () => {
        const users = await userRepository.getAll();
        set({ users });
      },

      login: async (pin) => {
        const users = get().users;
        const user = users.find((u) => u.pin === pin);
        if (user) {
          set({ currentUser: user });
          return user;
        }
        return null;
      },

      logout: () => set({ currentUser: null }),

      setCurrentUser: (user) => set({ currentUser: user }),

      create: async (user) => {
        const created = await userRepository.create(user);
        set((state) => ({ users: [...state.users, created] }));
        return created;
      },

      update: async (id, updates) => {
        await userRepository.update(id, updates);
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, ...updates } : u)),
        }));
      },

      delete: async (id) => {
        await userRepository.delete(id);
        set((state) => ({ users: state.users.filter((u) => u.id !== id) }));
      },

      hydrate: async () => {
        set({ isLoading: true });
        let users = await userRepository.getAll();
        if (!USE_API && users.length === 0) {
          for (const user of INITIAL_USERS) {
            await userRepository.create(user);
          }
          users = INITIAL_USERS;
        }
        set({ users, isLoading: false });
      },

      refetch: async () => {
        const users = await userRepository.getAll();
        set({ users });
      },
    }),
    {
      name: 'structura-user-session',
      partialize: (state) => ({ currentUser: state.currentUser }),
    }
  )
);
