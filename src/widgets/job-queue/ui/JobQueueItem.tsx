import React from 'react';
import type { Job } from '@/shared/types';
import { Package, ArrowRight } from 'lucide-react';

interface JobQueueItemProps {
  job: Job;
  isFirst?: boolean;
  onLoad?: (jobId: string) => void;
  disabled?: boolean;
}

export function JobQueueItem({
  job,
  isFirst = false,
  onLoad,
  disabled,
}: JobQueueItemProps) {
  return (
    <div
      className={`bg-slate-950/50 p-6 rounded-[2rem] border transition-all ${
        isFirst
          ? 'border-blue-500/50 shadow-lg shadow-blue-500/5'
          : 'border-slate-800 opacity-60'
      }`}
    >
      <div className="text-white font-black uppercase text-xs leading-snug mb-3 truncate" title={job.productName}>
        {job.productName}
      </div>
      <div className="flex justify-between items-center">
        <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2">
          <Package size={12} /> {job.targetQuantity} {job.unit}
        </div>
        <div className="text-[9px] bg-slate-800 px-2 py-1 rounded-md text-slate-400 font-black uppercase">
          {job.status}
        </div>
      </div>
      {isFirst && onLoad && (
        <button
          type="button"
          onClick={() => onLoad(job.id)}
          disabled={disabled}
          className="w-full bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white text-[10px] font-black uppercase py-4 rounded-2xl border border-blue-500/30 transition-all flex items-center justify-center gap-3 mt-6 group/btn"
        >
          Cargar en Terminal{' '}
          <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
        </button>
      )}
    </div>
  );
}
