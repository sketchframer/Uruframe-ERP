import { createLocalStorageRepository } from '@/shared/api/localStorageRepository';
import type { Project } from '@/shared/types';

export const projectRepository = createLocalStorageRepository<Project>('projects');
