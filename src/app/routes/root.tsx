import React from 'react';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { SkipLink } from '@/shared/ui/layout/SkipLink';

function RootLayout() {
  return (
    <div className="h-screen bg-[#0f172a] text-slate-200 overflow-hidden relative">
      <SkipLink />
      <Outlet />
    </div>
  );
}

export const rootRoute = createRootRoute({
  component: RootLayout,
});
