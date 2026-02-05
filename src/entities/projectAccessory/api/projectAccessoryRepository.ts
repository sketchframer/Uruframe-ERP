import {
  createLocalStorageRepository,
  createApiRepository,
  USE_API,
} from '@/shared/api';
import type { ProjectAccessory } from '@/shared/types';

export const projectAccessoryRepository = USE_API
  ? createApiRepository<ProjectAccessory>('/api/project-accessories')
  : createLocalStorageRepository<ProjectAccessory>('projectAccessories');
