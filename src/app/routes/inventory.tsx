import { createRoute } from '@tanstack/react-router';
import { authenticatedRoute } from './authenticated';
import { lazyRoute } from './lazyRoute';

const InventoryPage = lazyRoute(() =>
  import('@/pages/inventory/ui/InventoryPage').then((m) => ({
    default: m.InventoryPage,
  }))
);

export const inventoryRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: 'inventory',
  component: InventoryPage,
});
