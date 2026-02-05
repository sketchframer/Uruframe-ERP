import {
  createLocalStorageRepository,
  createApiRepository,
  USE_API,
} from '@/shared/api';
import type { InventoryItem } from '@/shared/types';

export const inventoryRepository = USE_API
  ? createApiRepository<InventoryItem>('/api/inventory')
  : createLocalStorageRepository<InventoryItem>('inventory');
