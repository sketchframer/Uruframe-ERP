import { createRoute } from '@tanstack/react-router';
import { authenticatedRoute } from './authenticated';
import { lazyRoute } from './lazyRoute';

const ProjectsPage = lazyRoute(() =>
  import('@/pages/projects/ui/ProjectsPage').then((m) => ({
    default: m.ProjectsPage,
  }))
);

export const projectsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: 'projects',
  component: ProjectsPage,
});
