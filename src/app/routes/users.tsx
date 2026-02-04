import { createRoute } from '@tanstack/react-router';
import { authenticatedRoute } from './authenticated';
import { lazyRoute } from './lazyRoute';

const UsersPage = lazyRoute(() =>
  import('@/pages/users/ui/UsersPage').then((m) => ({
    default: m.UsersPage,
  }))
);

export const usersRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: 'users',
  component: UsersPage,
});
