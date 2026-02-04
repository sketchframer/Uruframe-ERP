import { useCallback } from 'react';
import { useJobStore } from '@/entities/job';
import { useMachineStore } from '@/entities/machine';
import { useProjectStore } from '@/entities/project';
import { useEventStore } from '@/entities/event';
import { useAlertStore } from '@/entities/alert';
import { useUserStore } from '@/entities/user';
import { MachineStatus, EventType } from '@/shared/types';
import {
  areAllConformadoraJobsComplete,
  areAllJobsComplete,
  createPanelizadoJob,
} from '../lib/jobSequencing';
import { useLogisticsAlerts } from '@/features/logistics-messaging';

/**
 * Single handler for job updates: progress-only or full completion.
 * On completion: logs event, resets machine, runs CC→Panelizado sequencing,
 * and if project is fully complete, adds READY_FOR_DELIVERY alert and notifies dispatch.
 */
export function useJobActions() {
  const currentUser = useUserStore((s) => s.currentUser);
  const { notifyDispatchTeam } = useLogisticsAlerts();

  const handleJobUpdate = useCallback(
    async (
      jobId: string,
      qty: number,
      isComplete: boolean,
      operatorNotes?: string
    ) => {
      const jobStore = useJobStore.getState();
      const machineStore = useMachineStore.getState();
      const projectStore = useProjectStore.getState();
      const eventStore = useEventStore.getState();
      const alertStore = useAlertStore.getState();

      const jobToUpdate = jobStore.getById(jobId);
      if (!jobToUpdate) return;

      if (!isComplete) {
        await jobStore.updateProgress(jobId, qty);
        return;
      }

      await jobStore.complete(jobId, operatorNotes);
      const machineId = jobToUpdate.assignedMachineId ?? 'TALLER';
      await eventStore.add({
        machineId,
        type: EventType.JOB_COMPLETE,
        description: `Finalizado: ${jobToUpdate.productName} por ${currentUser?.name ?? 'Operador'}`,
        severity: 'INFO',
      });

      if (jobToUpdate.assignedMachineId) {
        await machineStore.setCurrentJob(jobToUpdate.assignedMachineId, null);
        await machineStore.updateStatus(
          jobToUpdate.assignedMachineId,
          MachineStatus.IDLE
        );
      }

      // CC → Panelizado sequencing (use fresh state after complete)
      const jobs = useJobStore.getState().jobs;
      const machines = useMachineStore.getState().machines;

      if (jobToUpdate.machineType === 'CONFORMADORA') {
        const projectJobs = jobs.filter(
          (j) => j.projectId === jobToUpdate.projectId
        );
        const allCCFinished = areAllConformadoraJobsComplete(
          jobs,
          jobToUpdate.projectId,
          jobId
        );

        if (allCCFinished) {
          const panelizadoMachine = machines.find((m) => m.type === 'PANELIZADO');
          const existingPanelJob = projectJobs.find(
            (j) => j.machineType === 'PANELIZADO'
          );

          if (panelizadoMachine) {
            if (existingPanelJob) {
              await jobStore.updateStatus(existingPanelJob.id, 'PENDING');
            } else {
              const project = projectStore.getById(jobToUpdate.projectId);
              await jobStore.create(
                createPanelizadoJob(
                  jobToUpdate.projectId,
                  project?.name ?? 'Proyecto',
                  panelizadoMachine.id
                )
              );
            }
          }
        }
      }

      // Project ready for delivery: alert + logistics
      const jobsAfter = useJobStore.getState().jobs;
      if (areAllJobsComplete(jobsAfter, jobToUpdate.projectId)) {
        const project = projectStore.getById(jobToUpdate.projectId);
        if (project) {
          await alertStore.add({
            type: 'READY_FOR_DELIVERY',
            message: `PROYECTO LISTO: ${project.name} está pronto para despacho.`,
            severity: 'HIGH',
            relatedId: project.id,
          });
          await notifyDispatchTeam(project);
        }
      }
    },
    [currentUser?.name, notifyDispatchTeam]
  );

  return { handleJobUpdate };
}
