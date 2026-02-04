import { createLocalStorageRepository } from '@/shared/api/localStorageRepository';
import type { ProjectAccessory } from '@/shared/types';

export const projectAccessoryRepository =
  createLocalStorageRepository<ProjectAccessory>('projectAccessories');
