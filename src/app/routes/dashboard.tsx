import { createRoute } from '@tanstack/react-router';
import { authenticatedRoute } from './authenticated';
import { lazyRoute } from './lazyRoute';

const DashboardPage = lazyRoute(() =>
  import('@/pages/dashboard/ui/DashboardPage').then((m) => ({
    default: m.DashboardPage,
  }))
);

export const dashboardRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/',
  component: DashboardPage,
});
