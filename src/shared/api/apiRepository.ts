import type { Repository } from './repository';
import { api } from './apiClient';
import { ApiError } from './apiClient';

export function createApiRepository<T extends { id: string }>(
  endpoint: string
): Repository<T> {
  return {
    async getAll(): Promise<T[]> {
      return api.get<T[]>(endpoint);
    },

    async getById(id: string): Promise<T | null> {
      try {
        return await api.get<T>(`${endpoint}/${id}`);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
      }
    },

    async create(item: Omit<T, 'id'> & { id?: string }): Promise<T> {
      return api.post<T>(endpoint, item);
    },

    async update(id: string, updates: Partial<T>): Promise<T> {
      return api.patch<T>(`${endpoint}/${id}`, updates);
    },

    async delete(id: string): Promise<void> {
      await api.delete(`${endpoint}/${id}`);
    },

    async query(predicate: (item: T) => boolean): Promise<T[]> {
      const all = await this.getAll();
      return all.filter(predicate);
    },
  };
}
