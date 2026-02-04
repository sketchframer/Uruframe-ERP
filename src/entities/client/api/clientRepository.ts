import { createLocalStorageRepository } from '@/shared/api/localStorageRepository';
import type { Client } from '@/shared/types';

export const clientRepository = createLocalStorageRepository<Client>('clients');
