import React, { lazy, Suspense, useCallback, useEffect } from 'react';
import { createRoute, useNavigate } from '@tanstack/react-router';
import { rootRoute } from './root';
import { FullPageSpinner } from '@/shared/ui';
import { useUserStore } from '@/entities/user';
import { useMachineStore } from '@/entities/machine';

const LoginPage = lazy(() =>
  import('@/pages/login/ui/LoginPage').then((m) => ({
    default: m.LoginPage,
  }))
);

function LoginRoute() {
  const navigate = useNavigate();
  const currentUser = useUserStore((s) => s.currentUser);
  const navigateAfterLogin = useCallback(() => {
    const user = useUserStore.getState().currentUser;
    if (!user) return;

    if (user.role === 'OPERATOR') {
      const machines = useMachineStore.getState().machines;
      const assignedMachineId = machines.find((m) =>
        m.operatorIds.includes(user.id)
      )?.id;

      if (assignedMachineId) {
        navigate({
          to: '/operator/$machineId',
          params: { machineId: assignedMachineId },
        });
      } else {
        navigate({ to: '/' });
      }
      return;
    }

    navigate({ to: '/' });
  }, [navigate]);

  useEffect(() => {
    if (currentUser) {
      navigateAfterLogin();
    }
  }, [currentUser, navigateAfterLogin]);

  const handleLoginSuccess = () => {
    navigateAfterLogin();
  };

  return (
    <main id="main-content" tabIndex={-1} className="h-full">
      <Suspense fallback={<FullPageSpinner />}>
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      </Suspense>
    </main>
  );
}

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'login',
  component: LoginRoute,
});
