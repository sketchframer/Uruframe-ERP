import React from 'react';
import type { Job } from '@/shared/types';
import { Clock } from 'lucide-react';
import { JobQueueItem } from './JobQueueItem';

interface JobQueueProps {
  jobs: Job[];
  currentJobId?: string | null;
  onLoadJob?: (jobId: string) => void;
  disabled?: boolean;
}

export function JobQueue({
  jobs,
  currentJobId,
  onLoadJob,
  disabled,
}: JobQueueProps) {
  const queue = jobs
    .filter(
      (j) =>
        j.status !== 'COMPLETED' &&
        j.id !== currentJobId
    )
    .sort((a, b) => (a.priorityIndex ?? 0) - (b.priorityIndex ?? 0));

  return (
    <div className="bg-slate-900/40 p-8 rounded-[3rem] border border-slate-800 flex-1 flex flex-col shadow-xl overflow-hidden">
      <div className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
        <Clock size={18} className="text-blue-500" /> Futuro
      </div>
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {queue.length > 0 ? (
          <div className="space-y-4">
            {queue.map((job, idx) => (
              <JobQueueItem
                key={job.id}
                job={job}
                isFirst={idx === 0}
                onLoad={onLoadJob}
                disabled={disabled}
              />
            ))}
            <p className="text-[9px] text-slate-700 font-black uppercase text-center tracking-[0.2em] pt-4">
              Tareas en Espera
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-800 opacity-20 py-20">
            <Clock size={40} className="mb-4" />
            <div className="text-[10px] font-black uppercase tracking-widest">
              Cola vacía
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
