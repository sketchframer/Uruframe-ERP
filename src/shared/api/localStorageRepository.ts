import type { Repository } from './repository';
import { storage, type StorageData } from './storage';

export function createLocalStorageRepository<T extends { id: string }>(
  collectionKey: keyof StorageData
): Repository<T> {
  const getDedupedCollection = (): T[] => {
    const items = storage.getCollection<T>(collectionKey);
    const deduped = Array.from(
      new Map(items.map((item) => [item.id, item])).values()
    );

    // Self-heal duplicated IDs in persisted storage (can happen after repeated dev hydration).
    if (deduped.length !== items.length) {
      storage.setCollection(collectionKey, deduped);
    }

    return deduped;
  };

  return {
    async getAll(): Promise<T[]> {
      return getDedupedCollection();
    },

    async getById(id: string): Promise<T | null> {
      const items = getDedupedCollection();
      return items.find((item) => item.id === id) ?? null;
    },

    async create(item: Omit<T, 'id'> & { id?: string }): Promise<T> {
      const items = getDedupedCollection();
      const newItem = {
        ...item,
        id: item.id ?? `${String(collectionKey).toUpperCase()}-${Date.now()}`,
      } as T;

      // If an explicit ID already exists, upsert instead of creating duplicates.
      const existingIndex = items.findIndex((existing) => existing.id === newItem.id);
      if (existingIndex !== -1) {
        const updatedItems = [...items];
        updatedItems[existingIndex] = newItem;
        storage.setCollection(collectionKey, updatedItems);
      } else {
        storage.setCollection(collectionKey, [...items, newItem]);
      }

      return newItem;
    },

    async update(id: string, updates: Partial<T>): Promise<T> {
      const items = getDedupedCollection();
      const index = items.findIndex((item) => item.id === id);
      if (index === -1) throw new Error(`Item ${id} not found`);

      const updated = { ...items[index], ...updates };
      items[index] = updated;
      storage.setCollection(collectionKey, items);
      return updated;
    },

    async delete(id: string): Promise<void> {
      const items = getDedupedCollection();
      storage.setCollection(
        collectionKey,
        items.filter((item) => item.id !== id)
      );
    },

    async query(predicate: (item: T) => boolean): Promise<T[]> {
      const items = getDedupedCollection();
      return items.filter(predicate);
    },
  };
}
