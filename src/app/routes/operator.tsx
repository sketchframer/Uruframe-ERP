import React, { lazy, Suspense } from 'react';
import { createRoute, useParams } from '@tanstack/react-router';
import { authenticatedRoute } from './authenticated';
import { FullPageSpinner } from '@/shared/ui';

const OperatorPage = lazy(() =>
  import('@/pages/operator/ui/OperatorPage').then((m) => ({
    default: m.OperatorPage,
  }))
);

function OperatorRoute() {
  const { machineId } = useParams({ from: operatorRoute.id });
  return (
    <Suspense fallback={<FullPageSpinner />}>
      <OperatorPage initialMachineId={machineId || undefined} />
    </Suspense>
  );
}

export const operatorRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: 'operator/$machineId',
  component: OperatorRoute,
});
