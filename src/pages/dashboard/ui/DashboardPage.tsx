import type { SystemAlert } from '@/shared/types';
import { useAppNavigate } from '@/shared/hooks';
import { LoadingSchedule } from '@/widgets/loading-schedule';
import { AlertsPanel } from '@/widgets/alerts-panel';
import { MachineDashboard } from '@/widgets/machine-dashboard';
import { EventFeed } from '@/widgets/event-feed';

export function DashboardPage() {
  const { toOperator, toSettings, toClients } = useAppNavigate();

  const handleAlertClick = (alert: SystemAlert) => {
    if (alert.type === 'READY_FOR_DELIVERY') toClients();
    else if (alert.relatedId) toOperator(alert.relatedId);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10 overflow-y-auto h-full pr-2 custom-scrollbar">
      <LoadingSchedule />

      <AlertsPanel onAlertClick={handleAlertClick} />

      <MachineDashboard
        onMachineClick={toOperator}
        onMachineEdit={() => toSettings('machines')}
        rightColumn={
          <>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
              Eventos de Hoy
            </h2>
            <EventFeed />
          </>
        }
      />
    </div>
  );
}
