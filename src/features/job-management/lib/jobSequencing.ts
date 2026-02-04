import type { Job } from '@/shared/types';

/**
 * Determines if all conformadora jobs are complete for a project
 * (including the one just completed, so we pass jobId to treat it as completed).
 */
export function areAllConformadoraJobsComplete(
  jobs: Job[],
  projectId: string,
  justCompletedJobId?: string
): boolean {
  const projectJobs = jobs.filter((j) => j.projectId === projectId);
  const ccJobs = projectJobs.filter((j) => j.machineType === 'CONFORMADORA');
  return (
    ccJobs.length > 0 &&
    ccJobs.every(
      (j) => j.status === 'COMPLETED' || j.id === justCompletedJobId
    )
  );
}

/**
 * Determines if all jobs for a project are complete
 */
export function areAllJobsComplete(jobs: Job[], projectId: string): boolean {
  const projectJobs = jobs.filter((j) => j.projectId === projectId);
  return (
    projectJobs.length > 0 &&
    projectJobs.every((j) => j.status === 'COMPLETED')
  );
}

/**
 * Creates a panelizado job payload for a project
 */
export function createPanelizadoJob(
  projectId: string,
  projectName: string,
  panelizadoMachineId: string
): Omit<Job, 'id'> {
  return {
    projectId,
    productName: `PANELIZADO: ${projectName}`,
    targetQuantity: 1,
    completedQuantity: 0,
    unit: 'proyecto',
    machineType: 'PANELIZADO',
    status: 'PENDING',
    assignedMachineId: panelizadoMachineId,
    priorityIndex: 99,
  };
}
