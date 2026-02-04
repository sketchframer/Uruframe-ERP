import { createRoute } from '@tanstack/react-router';
import { authenticatedRoute } from './authenticated';
import { lazyRoute } from './lazyRoute';

const ClientsPage = lazyRoute(() =>
  import('@/pages/clients/ui/ClientsPage').then((m) => ({
    default: m.ClientsPage,
  }))
);

export const clientsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: 'clients',
  component: ClientsPage,
});
