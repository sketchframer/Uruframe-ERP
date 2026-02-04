import { createLocalStorageRepository } from '@/shared/api/localStorageRepository';
import type { Job } from '@/shared/types';

export const jobRepository = createLocalStorageRepository<Job>('jobs');
