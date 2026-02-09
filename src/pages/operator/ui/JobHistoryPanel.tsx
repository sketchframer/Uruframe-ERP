import type { Job } from '@/shared/types';
import { EmptyState } from '@/shared/ui';
import { CheckCircle, Box, Package, Clock } from 'lucide-react';

interface JobHistoryPanelProps {
  lastJob: Job | undefined;
}

export function JobHistoryPanel({ lastJob }: JobHistoryPanelProps) {
  return (
    <div className="lg:col-span-3 flex flex-col h-full min-h-0">
      <div className="bg-slate-900/40 p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl border border-slate-800 flex-1 flex flex-col shadow min-h-0">
        <div className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-2 sm:mb-3 flex items-center gap-2">
          <CheckCircle size={14} className="text-green-500 shrink-0" /> Pasado
        </div>
        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-0">
          {lastJob ? (
            <div className="space-y-2 sm:space-y-3">
              <div className="bg-slate-950/50 p-2 sm:p-2.5 rounded-lg border border-slate-800 transition-all hover:border-slate-700">
                <div className="text-white font-black uppercase text-[10px] leading-snug mb-1">{lastJob.productName}</div>
                <div className="text-[10px] text-slate-400 font-black uppercase tracking-wider flex items-center gap-1.5">
                  <Package size={10} /> {lastJob.targetQuantity} {lastJob.unit}
                </div>
                <div className="mt-2 pt-2 border-t border-slate-800 text-[9px] text-slate-400 font-mono flex items-center gap-1.5">
                  <Clock size={10} /> {new Date(lastJob.completedAt || '').toLocaleTimeString()}
                </div>
              </div>
              <p className="text-[9px] text-slate-400 font-black uppercase text-center tracking-wider pt-2">Historial de Turno Actual</p>
            </div>
          ) : (
            <EmptyState
              icon={<Box />}
              message="Sin registros"
              className="flex-1 py-4 [&>div]:[&>svg]:w-8 [&>div]:[&>svg]:h-8"
            />
          )}
        </div>
      </div>
    </div>
  );
}
