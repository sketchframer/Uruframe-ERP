import {
  createLocalStorageRepository,
  createApiRepository,
  USE_API,
} from '@/shared/api';
import type { Project } from '@/shared/types';

export const projectRepository = USE_API
  ? createApiRepository<Project>('/api/projects')
  : createLocalStorageRepository<Project>('projects');
