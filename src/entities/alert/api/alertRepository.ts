import {
  createLocalStorageRepository,
  createApiRepository,
  USE_API,
} from '@/shared/api';
import type { SystemAlert } from '@/shared/types';

export const alertRepository = USE_API
  ? createApiRepository<SystemAlert>('/api/alerts')
  : createLocalStorageRepository<SystemAlert>('alerts');
