import { Link } from '@tanstack/react-router';
import type { Job, Machine, Project, MachineStatus } from '@/shared/types';
import { EmptyState, Slider } from '@/shared/ui';
import { Play, Square, Box } from 'lucide-react';

interface ActiveJobPanelProps {
  activeJob: Job | undefined;
  selectedMachine: Machine;
  projects: Project[];
  progressPercent: number;
  onSliderChange: (percent: number) => void;
  onStatusChange: (id: string, status: MachineStatus, reason?: string) => void;
  onCompleteJob: () => void;
}

export function ActiveJobPanel({
  activeJob,
  selectedMachine,
  projects,
  progressPercent,
  onSliderChange,
  onStatusChange,
  onCompleteJob,
}: ActiveJobPanelProps) {
  return (
    <div className="lg:col-span-6 flex flex-col h-full min-h-0">
      <div className={`p-0.5 flex flex-col h-full rounded-lg sm:rounded-xl transition-all duration-700 min-h-0 ${activeJob ? 'bg-blue-600/30' : 'bg-slate-900/50 border border-dashed border-slate-800'}`}>
        <div className="bg-slate-900 p-2 sm:p-3 lg:p-5 rounded-lg sm:rounded-xl h-full flex flex-col relative overflow-hidden shadow min-h-0">

          {!activeJob && (
            <div className="absolute inset-0 z-0 p-3 sm:p-4">
              <EmptyState
                icon={<Box className="animate-pulse text-slate-600" />}
                message="Cámara de Trabajo Vacía"
                description={
                  <>
                    Cargue una orden desde &quot;Futuro&quot; para comenzar. Asigne órdenes desde{' '}
                    <Link to="/orders" className="text-blue-400 hover:text-blue-300 underline font-bold">Producción</Link>
                    {' '}o{' '}
                    <Link to="/projects" className="text-blue-400 hover:text-blue-300 underline font-bold">Proyectos</Link>.
                  </>
                }
                className="h-full [&>div]:[&>svg]:w-12 [&>div]:[&>svg]:h-12"
              />
            </div>
          )}

          {activeJob && (
            <div className="relative z-10 flex flex-col h-full min-h-0">
              <div className="shrink-0 mb-2 sm:mb-4 lg:mb-5">
                <div className="text-blue-500 text-[10px] font-black uppercase tracking-wider mb-1.5 sm:mb-2 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(37,99,235,0.8)] animate-pulse" /> Presente: Producción
                </div>
                <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-black text-white uppercase tracking-tighter leading-none mb-1.5 sm:mb-2">{activeJob.productName}</h3>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <div className="px-2 py-0.5 sm:py-1 bg-blue-600/10 text-blue-400 rounded text-[10px] font-black uppercase tracking-wider border border-blue-600/20">
                    {projects.find(p => p.id === activeJob.projectId)?.name || 'STOCK GENERAL'}
                  </div>
                  {activeJob.isStock && <span className="bg-yellow-500/10 text-yellow-500 text-[9px] font-black px-1.5 py-0.5 rounded border border-yellow-500/20 tracking-wider uppercase">PERFIL CATÁLOGO</span>}
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center gap-2 sm:gap-4 lg:gap-6 min-h-0">
                {/* Contador */}
                <div className="flex justify-between items-end bg-slate-950/30 p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl border border-slate-800">
                  <div className="flex flex-col min-w-0">
                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider mb-1 sm:mb-2 pl-1.5 border-l-2 border-blue-500">Unidades Logradas</span>
                    <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-none tracking-tighter tabular-nums">
                      {activeJob.completedQuantity}
                    </div>
                  </div>
                  <div className="text-right pb-2 sm:pb-3 shrink-0">
                    <div className="text-slate-400 text-[10px] font-black uppercase tracking-wider mb-0.5">Meta Total</div>
                    <div className="text-lg sm:text-xl lg:text-2xl font-black text-slate-400 tracking-tighter tabular-nums">/ {activeJob.targetQuantity}</div>
                    <div className="text-[10px] text-slate-400 font-black uppercase tracking-wider">{activeJob.unit}</div>
                  </div>
                </div>

                {/* Progreso */}
                <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
                    <span className="text-slate-400">Avance Real de Turno</span>
                    <span className={progressPercent === 100 ? "text-green-500" : "text-blue-500"}>{progressPercent}% COMPLETADO</span>
                  </div>
                  <div className="h-2.5 sm:h-3 bg-slate-950 rounded-full overflow-hidden ring-1 ring-slate-800 p-0.5">
                    <div
                      className={`h-full transition-all duration-1000 ease-out rounded-full ${progressPercent === 100 ? 'bg-green-500' : 'bg-blue-600'}`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <div className="pt-2 sm:pt-3 border-t border-slate-800/50 space-y-1.5 sm:space-y-2">
                    <Slider
                      label="Reporte Manual de Avance Físico"
                      value={progressPercent}
                      onChange={onSliderChange}
                      min={0}
                      max={100}
                      step={1}
                      showValue={false}
                    />
                  </div>
                </div>

                {/* Controles de Acción */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-2 sm:pt-3">
                  <button
                    onClick={() => onStatusChange(selectedMachine.id, 'RUNNING' as MachineStatus)}
                    disabled={selectedMachine.status === 'RUNNING'}
                    className="bg-green-600 hover:bg-green-500 disabled:bg-slate-800 disabled:text-slate-700 p-2 sm:p-3 lg:p-4 rounded-lg flex flex-col items-center gap-1 sm:gap-2 transition-all active:scale-95 shadow-lg shadow-green-600/20 ring-1 ring-green-400/20 group"
                  >
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white group-hover:scale-110 transition-transform" />
                    <span className="text-white font-black uppercase text-[10px] tracking-wider">Iniciar Producción</span>
                  </button>
                  <div className="relative group">
                    <button
                      onClick={onCompleteJob}
                      disabled={selectedMachine.status !== 'RUNNING' || progressPercent < 100}
                      className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-700 p-2 sm:p-3 lg:p-4 rounded-lg flex flex-col items-center gap-1 sm:gap-2 transition-all active:scale-95 shadow-lg shadow-blue-600/20 ring-1 ring-blue-400/20"
                    >
                      <Square className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${progressPercent === 100 ? "text-white" : "text-slate-700"}`} />
                      <span className="font-black uppercase text-[10px] tracking-wider">Finalizar y Liberar</span>
                    </button>
                    {progressPercent < 100 && selectedMachine.status === 'RUNNING' && (
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-950 text-[10px] font-black text-slate-400 uppercase py-1.5 px-3 rounded-lg border border-slate-800 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all shadow pointer-events-none">
                        Bloqueado: Avance insuficiente
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
