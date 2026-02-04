import { createLocalStorageRepository } from '@/shared/api/localStorageRepository';
import type { User } from '@/shared/types';

export const userRepository = createLocalStorageRepository<User>('users');
