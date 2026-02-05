import {
  createLocalStorageRepository,
  createApiRepository,
  USE_API,
} from '@/shared/api';
import type { Client } from '@/shared/types';

export const clientRepository = USE_API
  ? createApiRepository<Client>('/api/clients')
  : createLocalStorageRepository<Client>('clients');
