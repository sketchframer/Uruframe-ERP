import {
  createLocalStorageRepository,
  createApiRepository,
  USE_API,
} from '@/shared/api';
import type { Job } from '@/shared/types';

export const jobRepository = USE_API
  ? createApiRepository<Job>('/api/jobs')
  : createLocalStorageRepository<Job>('jobs');
