import React from 'react';
import type { FactoryEvent } from '@/shared/types';
import type { Machine } from '@/shared/types';

interface EventItemProps {
  event: FactoryEvent;
  machineName?: string;
}

export function EventItem({ event, machineName }: EventItemProps) {
  return (
    <div className="flex gap-3 pb-3 border-b border-slate-700/50 last:border-0 hover:bg-slate-700/20 p-2 rounded-2xl transition-colors">
      <div
        className={`mt-1 min-w-[8px] h-2 rounded-full shrink-0 ${
          event.severity === 'CRITICAL'
            ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
            : 'bg-blue-500'
        }`}
      />
      <div className="min-w-0">
        <div className="flex justify-between w-full gap-2">
          <span className="text-[10px] font-black text-slate-200 uppercase tracking-widest truncate">
            {machineName ?? event.machineId}
          </span>
          <span className="text-[9px] text-slate-600 font-mono shrink-0">
            {new Date(event.timestamp).toLocaleTimeString()}
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed font-medium">
          {event.description}
        </p>
      </div>
    </div>
  );
}
