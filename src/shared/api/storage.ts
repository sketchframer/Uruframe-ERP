import { STORAGE_KEY } from '../constants/storage';

export interface StorageData {
  machines: unknown[];
  jobs: unknown[];
  projects: unknown[];
  users: unknown[];
  clients: unknown[];
  inventory: unknown[];
  alerts: unknown[];
  messages: unknown[];
  events: unknown[];
  projectAccessories: unknown[];
}

const defaultData: StorageData = {
  machines: [],
  jobs: [],
  projects: [],
  users: [],
  clients: [],
  inventory: [],
  alerts: [],
  messages: [],
  events: [],
  projectAccessories: [],
};

export const storage = {
  load(): StorageData {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...defaultData, ...JSON.parse(saved) } : defaultData;
    } catch {
      console.error('Failed to load storage');
      return defaultData;
    }
  },

  save(data: StorageData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save storage', error);
    }
  },

  getCollection<T>(key: keyof StorageData): T[] {
    const data = this.load();
    return (data[key] as T[]) ?? [];
  },

  setCollection<T>(key: keyof StorageData, items: T[]): void {
    const data = this.load();
    data[key] = items as unknown[];
    this.save(data);
  },
};
