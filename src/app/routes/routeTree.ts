import { rootRoute } from './root';
import { loginRoute } from './login';
import { authenticatedRoute } from './authenticated';
import { dashboardRoute } from './dashboard';
import { operatorRoute } from './operator';
import { projectsRoute } from './projects';
import { ordersRoute } from './orders';
import { inventoryRoute } from './inventory';
import { clientsRoute } from './clients';
import { usersRoute } from './users';
import { settingsRoute } from './settings';

rootRoute.addChildren([loginRoute, authenticatedRoute]);

authenticatedRoute.addChildren([
  dashboardRoute,
  operatorRoute,
  projectsRoute,
  ordersRoute,
  inventoryRoute,
  clientsRoute,
  usersRoute,
  settingsRoute,
]);

export const routeTree = rootRoute;
