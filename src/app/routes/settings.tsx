import React, { lazy, Suspense } from 'react';
import { createRoute, useParams } from '@tanstack/react-router';
import { authenticatedRoute } from './authenticated';
import { FullPageSpinner } from '@/shared/ui';

const SettingsPage = lazy(() =>
  import('@/pages/settings/ui/SettingsPage').then((m) => ({
    default: m.SettingsPage,
  }))
);

function SettingsRoute() {
  const { tab } = useParams({ from: settingsRoute.id });
  return (
    <Suspense fallback={<FullPageSpinner />}>
      <SettingsPage initialTab={tab} />
    </Suspense>
  );
}

export const settingsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: 'settings/$tab',
  component: SettingsRoute,
});
