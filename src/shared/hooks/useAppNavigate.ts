import { useNavigate } from '@tanstack/react-router';
import { useMachineStore } from '@/entities/machine';

export function useAppNavigate() {
  const navigate = useNavigate();

  return {
    toDashboard: () => navigate({ to: '/' }),
    toOperator: (machineId?: string) => {
      const fallbackMachineId = useMachineStore.getState().machines[0]?.id;
      const targetMachineId = machineId ?? fallbackMachineId;
      if (!targetMachineId) {
        return navigate({ to: '/' });
      }
      return navigate({
        to: '/operator/$machineId',
        params: { machineId: targetMachineId },
      });
    },
    toProjects: () => navigate({ to: '/projects' }),
    toOrders: () => navigate({ to: '/orders' }),
    toInventory: () => navigate({ to: '/inventory' }),
    toClients: () => navigate({ to: '/clients' }),
    toSettings: (tab: string = 'general') =>
      navigate({ to: '/settings/$tab', params: { tab } }),
    toLogin: () => navigate({ to: '/login' }),
  };
}
