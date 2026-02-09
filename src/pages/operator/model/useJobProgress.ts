import type { Job } from '@/shared/types';

export function useJobProgress(
  activeJob: Job | undefined,
  handleJobUpdate: (jobId: string, qty: number, isComplete: boolean, operatorNotes?: string) => void,
) {
  const progressPercent = activeJob
    ? Math.round((activeJob.completedQuantity / activeJob.targetQuantity) * 100)
    : 0;

  const handleSliderChange = (percent: number) => {
    if (!activeJob) return;
    const newQty = Math.round((percent / 100) * activeJob.targetQuantity);
    handleJobUpdate(activeJob.id, newQty, false);
  };

  return { progressPercent, handleSliderChange };
}
