import {
  createLocalStorageRepository,
  createApiRepository,
  USE_API,
} from '@/shared/api';
import type { FactoryEvent } from '@/shared/types';

export const eventRepository = USE_API
  ? createApiRepository<FactoryEvent>('/api/events')
  : createLocalStorageRepository<FactoryEvent>('events');
