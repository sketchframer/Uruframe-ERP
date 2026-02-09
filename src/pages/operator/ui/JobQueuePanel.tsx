import { Link } from '@tanstack/react-router';
import type { Job } from '@/shared/types';
import { EmptyState } from '@/shared/ui';
import { Clock, Package, ArrowRight } from 'lucide-react';

interface JobQueuePanelProps {
  machineQueue: Job[];
  hasActiveJob: boolean;
  selectedMachineId: string;
  onLoadJob: (machineId: string, jobId: string) => void;
}

export function JobQueuePanel({
  machineQueue,
  hasActiveJob,
  selectedMachineId,
  onLoadJob,
}: JobQueuePanelProps) {
  return (
    <div className="lg:col-span-3 flex flex-col h-full min-h-0">
      <div className="bg-slate-900/40 p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl border border-slate-800 flex-1 flex flex-col shadow overflow-hidden min-h-0">
        <div className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-2 sm:mb-3 flex items-center gap-2">
          <Clock size={14} className="text-blue-500 shrink-0" /> Futuro
        </div>
        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-0">
          {machineQueue.length > 0 ? (
            <div className="space-y-2 sm:space-y-2.5">
              {machineQueue.map((job, idx) => (
                <div key={job.id} className={`bg-slate-950/50 p-2 sm:p-2.5 rounded-lg border transition-all ${idx === 0 ? 'border-blue-500/50 shadow shadow-blue-500/5' : 'border-slate-800 opacity-60'}`}>
                  <div className="text-white font-black uppercase text-[10px] leading-snug mb-1.5 truncate" title={job.productName}>{job.productName}</div>
                  <div className="flex justify-between items-center">
                    <div className="text-[10px] text-slate-400 font-black uppercase tracking-wider flex items-center gap-1.5">
                      <Package size={10} /> {job.targetQuantity} {job.unit}
                    </div>
                    <div className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-black uppercase">{job.status}</div>
                  </div>
                  {idx === 0 && (
                    <button
                      onClick={() => onLoadJob(selectedMachineId, job.id)}
                      disabled={hasActiveJob}
                      className="w-full bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white text-[10px] font-black uppercase py-2 sm:py-2.5 rounded-lg border border-blue-500/30 transition-all flex items-center justify-center gap-1.5 mt-2 sm:mt-3 group/btn"
                    >
                      Cargar en Terminal <ArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform shrink-0" />
                    </button>
                  )}
                </div>
              ))}
              <p className="text-[9px] text-slate-400 font-black uppercase text-center tracking-wider pt-2">Tareas en Espera</p>
            </div>
          ) : (
            <EmptyState
              icon={<Clock />}
              message="Cola vacía"
              description={
                <>
                  Asigne órdenes desde{' '}
                  <Link to="/orders" className="text-blue-400 hover:text-blue-300 underline font-bold">Producción</Link>
                  {' '}o{' '}
                  <Link to="/projects" className="text-blue-400 hover:text-blue-300 underline font-bold">Proyectos</Link>.
                </>
              }
              className="flex-1 py-4 sm:py-6 px-3 [&>div]:[&>svg]:w-8 [&>div]:[&>svg]:h-8"
            />
          )}
        </div>
      </div>
    </div>
  );
}
