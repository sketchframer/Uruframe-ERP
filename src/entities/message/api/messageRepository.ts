import {
  createLocalStorageRepository,
  createApiRepository,
  USE_API,
} from '@/shared/api';
import type { SystemMessage } from '@/shared/types';

export const messageRepository = USE_API
  ? createApiRepository<SystemMessage>('/api/messages')
  : createLocalStorageRepository<SystemMessage>('messages');
