import { createRoute } from '@tanstack/react-router';
import { authenticatedRoute } from './authenticated';
import { lazyRoute } from './lazyRoute';

const OrdersPage = lazyRoute(() =>
  import('@/pages/orders/ui/OrdersPage').then((m) => ({
    default: m.OrdersPage,
  }))
);

export const ordersRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: 'orders',
  component: OrdersPage,
});
