import React from 'react';
import type { Machine, Job, Project, User } from '@/shared/types';
import type { SystemAlert } from '@/shared/types';
import { MachineCard } from '@/entities/machine';
import { AlertTriangle } from 'lucide-react';

interface MachineGridProps {
  machines: Machine[];
  jobs: Job[];
  projects: Project[];
  users: User[];
  alerts?: SystemAlert[];
  onMachineClick: (machineId: string) => void;
  onMachineEdit: (machineId: string) => void;
}

export function MachineGrid({
  machines,
  jobs,
  projects,
  users,
  alerts = [],
  onMachineClick,
  onMachineEdit,
}: MachineGridProps) {
  const activeMachines = machines.filter((m) => m.isActive);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {activeMachines.map((machine) => {
        const hasHighAlert = alerts.some(
          (a) => a.relatedId === machine.id && a.severity === 'HIGH'
        );
        const assignedOperators = users.filter((u) =>
          machine.operatorIds.includes(u.id)
        );
        const activeJob = machine.currentJobId
          ? jobs.find((j) => j.id === machine.currentJobId)
          : undefined;
        const projectName = activeJob
          ? projects.find((p) => p.id === activeJob.projectId)?.name
          : undefined;

        return (
          <div key={machine.id} className="relative">
            {hasHighAlert && (
              <div className="absolute -top-2 -right-2 z-20 animate-bounce">
                <div className="bg-red-600 text-white p-1.5 rounded-full shadow-lg border-2 border-slate-800">
                  <AlertTriangle size={14} />
                </div>
              </div>
            )}
            <MachineCard
              machine={machine}
              operators={assignedOperators}
              activeJob={activeJob}
              projectName={projectName}
              onClick={() => onMachineClick(machine.id)}
              onEdit={() => onMachineEdit(machine.id)}
              className={
                hasHighAlert
                  ? 'ring-2 ring-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                  : ''
              }
            />
          </div>
        );
      })}
    </div>
  );
}
