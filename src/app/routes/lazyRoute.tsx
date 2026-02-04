import React, { lazy, Suspense } from 'react';
import { FullPageSpinner } from '@/shared/ui';

/**
 * Wraps a dynamic page import in Suspense with FullPageSpinner for code splitting.
 * Use for route components that need no props (e.g. DashboardPage, ProjectsPage).
 */
export function lazyRoute<T extends React.ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>
) {
  const Lazy = lazy(importFn);
  return function LazyRoute() {
    return (
      <Suspense fallback={<FullPageSpinner />}>
        <Lazy />
      </Suspense>
    );
  };
}
