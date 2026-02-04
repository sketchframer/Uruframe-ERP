import { createLocalStorageRepository } from '@/shared/api/localStorageRepository';
import type { SystemMessage } from '@/shared/types';

export const messageRepository =
  createLocalStorageRepository<SystemMessage>('messages');
