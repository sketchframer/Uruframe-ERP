import { createLocalStorageRepository } from '@/shared/api/localStorageRepository';
import type { FactoryEvent } from '@/shared/types';

export const eventRepository = createLocalStorageRepository<FactoryEvent>('events');
