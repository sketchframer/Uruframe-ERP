import React from 'react';
import { createRoute, Outlet, redirect } from '@tanstack/react-router';
import { rootRoute } from './root';
import { Sidebar } from '@/widgets/sidebar';
import { useUserStore } from '@/entities/user';

function AuthenticatedLayout() {
  return (
    <div className="flex h-full">
      <Sidebar />
      <main id="main-content" className="flex-1 overflow-hidden" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  );
}

export const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: '_authenticated',
  beforeLoad: () => {
    const currentUser = useUserStore.getState().currentUser;
    if (!currentUser) {
      throw redirect({ to: '/login' });
    }
  },
  component: AuthenticatedLayout,
});
