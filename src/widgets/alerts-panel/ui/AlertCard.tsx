import React from 'react';
import type { SystemAlert } from '@/shared/types';
import { AlertTriangle, ChevronRight } from 'lucide-react';

interface AlertCardProps {
  alert: SystemAlert;
  onClick?: (alert: SystemAlert) => void;
}

export function AlertCard({ alert, onClick }: AlertCardProps) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(alert)}
      className="w-full bg-red-600/10 border-2 border-red-500/30 p-5 rounded-[2rem] flex items-center justify-between hover:bg-red-600/20 transition-all group"
    >
      <div className="flex items-center gap-6">
        <div className="bg-red-500 p-2.5 rounded-2xl shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse">
          <AlertTriangle className="w-6 h-6 text-white" />
        </div>
        <div className="text-left">
          <div className="text-white font-black uppercase text-base tracking-tighter">
            {alert.type.replace('_', ' ')}
          </div>
          <div className="text-red-400 text-sm font-bold">{alert.message}</div>
        </div>
      </div>
      <div className="flex items-center gap-2 text-red-500 font-black uppercase text-[10px] tracking-widest bg-red-500/10 px-4 py-2 rounded-xl">
        <span>Solucionar</span>
        <ChevronRight
          className="group-hover:translate-x-1 transition-transform"
          size={14}
        />
      </div>
    </button>
  );
}
