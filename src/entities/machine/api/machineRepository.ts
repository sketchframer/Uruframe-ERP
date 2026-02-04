import {
  createLocalStorageRepository,
  createApiRepository,
  USE_API,
} from '@/shared/api';
import type { Machine } from '@/shared/types';

export const machineRepository = USE_API
  ? createApiRepository<Machine>('/api/machines')
  : createLocalStorageRepository<Machine>('machines');
