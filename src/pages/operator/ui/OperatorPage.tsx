import { useState } from 'react';
import { MachineStatus } from '@/shared/types';
import { useMachineStore } from '@/entities/machine';
import { useJobStore } from '@/entities/job';
import { useProjectStore } from '@/entities/project';
import { useUserStore } from '@/entities/user';
import { useMessageStore } from '@/entities/message';
import { useAlertStore } from '@/entities/alert';
import { useJobActions } from '@/features/job-management';
import { useAppNavigate } from '@/shared/hooks';
import { EmptyState } from '@/shared/ui';
import { Settings, Package, ArrowRight } from 'lucide-react';

import { useMachineSelection } from '../model/useMachineSelection';
import { useJobProgress } from '../model/useJobProgress';
import { OperatorSidebar } from './OperatorSidebar';
import { MachineHeader } from './MachineHeader';
import { ActiveJobPanel } from './ActiveJobPanel';
import { JobQueuePanel } from './JobQueuePanel';
import { JobHistoryPanel } from './JobHistoryPanel';
import { MessagesPanel } from './MessagesPanel';

interface OperatorPageProps {
  initialMachineId?: string;
}

export function OperatorPage({ initialMachineId }: OperatorPageProps) {
  const currentUser = useUserStore((s) => s.currentUser);
  const { handleJobUpdate } = useJobActions();
  const { toLogin } = useAppNavigate();

  const machines = useMachineStore((s) => s.machines);
  const jobs = useJobStore((s) => s.jobs);
  const projects = useProjectStore((s) => s.projects);
  const messages = useMessageStore((s) => s.messages);
  const alerts = useAlertStore((s) => s.alerts);

  const [viewTab, setViewTab] = useState<'CONTROLS' | 'MESSAGES'>('CONTROLS');

  const {
    selectedMachineId,
    handleMachineSwitch,
    showAlertDetails,
    setShowAlertDetails,
    onStatusChange,
    onLoadJob,
  } = useMachineSelection(currentUser?.id, machines, initialMachineId);

  if (!currentUser) return null;

  const selectedMachine = machines.find(m => m.id === selectedMachineId);
  const activeJob = jobs.find(j => j.id === selectedMachine?.currentJobId);
  const machineAlerts = alerts.filter(a => a.relatedId === selectedMachineId);
  const hasCriticalAlert = machineAlerts.some(a => a.severity === 'HIGH');

  const { progressPercent, handleSliderChange } = useJobProgress(activeJob, handleJobUpdate);

  const machineQueue = jobs
    .filter(j => j.assignedMachineId === selectedMachineId && j.status !== 'COMPLETED' && j.id !== selectedMachine?.currentJobId)
    .sort((a, b) => (a.priorityIndex || 0) - (b.priorityIndex || 0));

  const lastJob = jobs
    .filter(j => j.assignedMachineId === selectedMachineId && j.status === 'COMPLETED')
    .sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime())[0];

  const userMessages = messages.filter(m => m.to === 'ALL' || m.to === currentUser.id);

  const assignedMachines = machines.filter(m => m.operatorIds.includes(currentUser.id));
  const baseSidebarList = assignedMachines.length > 0 ? assignedMachines : machines;
  const selectedMachineInList = selectedMachineId && machines.find(m => m.id === selectedMachineId);
  const sidebarMachines =
    selectedMachineId && selectedMachineInList && !baseSidebarList.some(m => m.id === selectedMachineId)
      ? [selectedMachineInList, ...baseSidebarList]
      : baseSidebarList;
  const sidebarLabel = assignedMachines.length > 0 ? 'Mis Estaciones' : 'Todas las estaciones';

  return (
    <div className="h-full flex flex-col lg:flex-row gap-2 sm:gap-3 lg:gap-4 animate-fade-in relative overflow-hidden bg-slate-950 min-h-0">
      <OperatorSidebar
        currentUser={currentUser}
        viewTab={viewTab}
        onViewTabChange={setViewTab}
        sidebarMachines={sidebarMachines}
        sidebarLabel={sidebarLabel}
        selectedMachineId={selectedMachineId}
        onMachineSwitch={handleMachineSwitch}
        alerts={alerts}
        userMessages={userMessages}
        onLogout={toLogin}
      />

      <main className="flex-1 flex flex-col relative overflow-auto min-h-0 p-2 sm:p-3 lg:p-4 lg:pl-2">
        {selectedMachine ? (
          <div className="flex flex-col h-full gap-2 sm:gap-3 lg:gap-4 min-h-0">
            <MachineHeader
              selectedMachine={selectedMachine}
              currentUser={currentUser}
              hasCriticalAlert={hasCriticalAlert}
              machineAlerts={machineAlerts}
              showAlertDetails={showAlertDetails}
              onToggleAlertDetails={() => setShowAlertDetails(!showAlertDetails)}
              onCloseAlertDetails={() => setShowAlertDetails(false)}
            />

            {viewTab === 'CONTROLS' ? (
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-3 lg:gap-4 overflow-hidden min-h-0">
                <JobHistoryPanel lastJob={lastJob} />
                <ActiveJobPanel
                  activeJob={activeJob}
                  selectedMachine={selectedMachine}
                  projects={projects}
                  progressPercent={progressPercent}
                  onSliderChange={handleSliderChange}
                  onStatusChange={onStatusChange}
                  onCompleteJob={() => activeJob && handleJobUpdate(activeJob.id, activeJob.targetQuantity, true)}
                />
                <JobQueuePanel
                  machineQueue={machineQueue}
                  hasActiveJob={!!activeJob}
                  selectedMachineId={selectedMachine.id}
                  onLoadJob={onLoadJob}
                />
              </div>
            ) : (
              <MessagesPanel userMessages={userMessages} />
            )}

            {/* Notificación Emergente: Orden Lista */}
            {!activeJob && machineQueue.length > 0 && selectedMachine.status === MachineStatus.IDLE && (
              <div className="absolute left-2 right-2 sm:left-4 sm:right-4 lg:inset-x-8 bottom-2 sm:bottom-4 lg:bottom-6 z-[60] bg-blue-600 p-2.5 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl shadow-xl flex flex-wrap items-center justify-between gap-2 sm:gap-3 border-t-2 border-blue-400 animate-bounce-slow ring-2 ring-blue-600/20">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="bg-white/20 p-2 sm:p-2.5 rounded-lg shadow-inner shrink-0"><Package className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" /></div>
                  <div className="min-w-0">
                    <div className="text-white font-black uppercase text-[10px] tracking-wider opacity-90 mb-0.5">Carga de Producción Prioritaria</div>
                    <div className="text-white font-black text-sm sm:text-base lg:text-lg tracking-tighter uppercase leading-none truncate">{machineQueue[0].productName}</div>
                  </div>
                </div>
                <button
                  onClick={() => onLoadJob(selectedMachine.id, machineQueue[0].id)}
                  className="bg-white text-blue-600 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg font-black uppercase text-[10px] sm:text-xs shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 group/notif shrink-0"
                >
                  Empezar Ahora <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover/notif:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <EmptyState
            icon={<Settings className="animate-spin-slow" />}
            message="Seleccione una Estación"
            className="h-full text-slate-400 bg-slate-900/40 border-2 border-dashed border-slate-800 rounded-lg sm:rounded-xl animate-pulse m-2 sm:m-4 [&>div]:[&>svg]:w-12 [&>div]:[&>svg]:h-12"
          />
        )}
      </main>
    </div>
  );
}
