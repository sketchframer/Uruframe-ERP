import { createLocalStorageRepository } from '@/shared/api/localStorageRepository';
import type { SystemAlert } from '@/shared/types';

export const alertRepository = createLocalStorageRepository<SystemAlert>('alerts');
