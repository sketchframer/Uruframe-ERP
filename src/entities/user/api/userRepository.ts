import {
  createLocalStorageRepository,
  createApiRepository,
  USE_API,
} from '@/shared/api';
import type { User } from '@/shared/types';

export const userRepository = USE_API
  ? createApiRepository<User>('/api/users')
  : createLocalStorageRepository<User>('users');
