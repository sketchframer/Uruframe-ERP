import { createLocalStorageRepository } from '@/shared/api/localStorageRepository';
import type { InventoryItem } from '@/shared/types';

export const inventoryRepository =
  createLocalStorageRepository<InventoryItem>('inventory');
