import { useState, useEffect, useRef, type ChangeEvent } from 'react';
import { Link } from '@tanstack/react-router';
import { MachineStatus, EventType } from '@/shared/types';
import { useMachineStore } from '@/entities/machine';
import { useJobStore } from '@/entities/job';
import { useProjectStore } from '@/entities/project';
import { useUserStore } from '@/entities/user';
import { useMessageStore } from '@/entities/message';
import { useAlertStore } from '@/entities/alert';
import { useEventStore } from '@/entities/event';
import { useJobActions } from '@/features/job-management';
import { useAppNavigate } from '@/shared/hooks';
import {
  Play, Square, AlertTriangle, Box, User as UserIcon, LogOut, CheckCircle, Clock, Settings, MessageSquare, AlertCircle, X, Package, ArrowRight, Monitor
} from 'lucide-react';

interface OperatorPageProps {
  initialMachineId?: string;
}

export function OperatorPage({ initialMachineId }: OperatorPageProps) {
  const currentUser = useUserStore((s) => s.currentUser);
  const { handleJobUpdate } = useJobActions();
  const { toLogin } = useAppNavigate();

  const eventStore = useEventStore.getState();
  const machineStore = useMachineStore.getState();
  const jobStore = useJobStore.getState();

  const onLogEvent = (machineId: string, type: EventType, description: string, severity: 'INFO' | 'WARNING' | 'CRITICAL') => {
    eventStore.add({ machineId, type, description, severity });
  };
  const onStatusChange = (id: string, status: MachineStatus, reason?: string) => {
    machineStore.updateStatus(id, status, reason);
  };
  const onLoadJob = (machineId: string, jobId: string) => {
    machineStore.setCurrentJob(machineId, jobId);
    jobStore.updateStatus(jobId, 'IN_PROGRESS');
  };
  const machines = useMachineStore((s) => s.machines);
  const jobs = useJobStore((s) => s.jobs);
  const projects = useProjectStore((s) => s.projects);
  const messages = useMessageStore((s) => s.messages);
  const alerts = useAlertStore((s) => s.alerts);
  const [selectedMachineId, setSelectedMachineId] = useState<string>('');
  const [viewTab, setViewTab] = useState<'CONTROLS' | 'MESSAGES'>('CONTROLS');
  const [showAlertDetails, setShowAlertDetails] = useState(false);
  const prevMachineIdRef = useRef<string>('');

  useEffect(() => {
    if (!currentUser) return;
    const assigned = machines.filter(m => m.operatorIds.includes(currentUser.id));
    if (assigned.length === 1) {
        setSelectedMachineId(assigned[0].id);
        prevMachineIdRef.current = assigned[0].id;
    } else if (initialMachineId) {
        setSelectedMachineId(initialMachineId);
        prevMachineIdRef.current = initialMachineId;
    }
  }, [currentUser, initialMachineId, machines]);

  if (!currentUser) return null;

  const handleMachineSwitch = (newMachineId: string) => {
    const currentMachine = machines.find(m => m.id === selectedMachineId);
    if (currentMachine && currentMachine.status === MachineStatus.RUNNING) {
        onStatusChange(currentMachine.id, MachineStatus.IDLE, 'Cambio de puesto automático');
        onLogEvent(currentMachine.id, EventType.STAGE_COMPLETE, 'Pausa automática por cambio de puesto', 'INFO');
    }
    
    setSelectedMachineId(newMachineId);
    prevMachineIdRef.current = newMachineId;
    setShowAlertDetails(false);
  };

  const selectedMachine = machines.find(m => m.id === selectedMachineId);
  const activeJob = jobs.find(j => j.id === selectedMachine?.currentJobId);
  const machineAlerts = alerts.filter(a => a.relatedId === selectedMachineId);
  const hasCriticalAlert = machineAlerts.some(a => a.severity === 'HIGH');
  
  const progressPercent = activeJob 
    ? Math.round((activeJob.completedQuantity / activeJob.targetQuantity) * 100) 
    : 0;

  // Cola: Incluye todo lo que esté asignado a esta máquina y no esté completado
  const machineQueue = jobs
    .filter(j => j.assignedMachineId === selectedMachineId && j.status !== 'COMPLETED' && j.id !== selectedMachine?.currentJobId)
    .sort((a, b) => (a.priorityIndex || 0) - (b.priorityIndex || 0));

  const lastJob = jobs
    .filter(j => j.assignedMachineId === selectedMachineId && j.status === 'COMPLETED')
    .sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime())[0];

  const userMessages = messages.filter(m => m.to === 'ALL' || m.to === currentUser.id);

  const assignedMachines = machines.filter(m => m.operatorIds.includes(currentUser.id));
  const baseSidebarList = assignedMachines.length > 0 ? assignedMachines : machines;
  const selectedMachineInList = selectedMachineId && machines.find(m => m.id === selectedMachineId);
  const sidebarMachines =
    selectedMachineId && selectedMachineInList && !baseSidebarList.some(m => m.id === selectedMachineId)
      ? [selectedMachineInList, ...baseSidebarList]
      : baseSidebarList;
  const sidebarLabel = assignedMachines.length > 0 ? 'Mis Estaciones' : 'Todas las estaciones';

  const handleSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
      if (!activeJob) return;
      const percent = parseInt(e.target.value);
      const newQty = Math.round((percent / 100) * activeJob.targetQuantity);
      handleJobUpdate(activeJob.id, newQty, false);
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-2 sm:gap-3 lg:gap-4 animate-fade-in relative overflow-hidden bg-slate-950 min-h-0">
      
      {/* Sidebar: Operario */}
      <aside className="w-full lg:w-48 xl:w-56 flex flex-col gap-2 p-2 sm:p-3 lg:p-0 shrink-0">
        <div className="bg-slate-900 p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl border border-slate-800 shadow-xl h-full flex flex-col min-h-0">
          <div className="flex justify-between items-center mb-2 pb-2 sm:mb-3 sm:pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-blue-600 rounded-lg flex items-center justify-center font-black text-white text-sm sm:text-base uppercase shadow-lg shadow-blue-600/30 shrink-0">
                {currentUser.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="font-black text-xs sm:text-sm text-white uppercase tracking-tighter leading-tight truncate">{currentUser.name}</div>
                <div className="text-[10px] text-blue-500 font-black uppercase tracking-wider mt-0.5">{currentUser.role} ACTIVO</div>
              </div>
            </div>
            <button onClick={toLogin} className="text-slate-400 hover:text-red-500 p-1.5 sm:p-2 transition-colors bg-slate-950 rounded-lg border border-slate-800 shrink-0" title="Cerrar Sesión">
                <LogOut size={18} className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
          
          <nav className="flex gap-1.5 bg-slate-950 p-1.5 rounded-lg mb-2 sm:mb-3">
            <button 
                onClick={() => setViewTab('CONTROLS')} 
                className={`flex-1 py-2 sm:py-2.5 text-[10px] font-black uppercase rounded-lg transition-all ${viewTab === 'CONTROLS' ? 'bg-slate-800 text-white ring-1 ring-slate-700' : 'text-slate-400 hover:text-slate-300'}`}
            >Controles</button>
            <button 
                onClick={() => setViewTab('MESSAGES')} 
                className={`flex-1 py-2 sm:py-2.5 text-[10px] font-black uppercase rounded-lg transition-all flex items-center justify-center gap-1 ${viewTab === 'MESSAGES' ? 'bg-slate-800 text-white ring-1 ring-slate-700' : 'text-slate-400 hover:text-slate-300'}`}
            >
              Mensajes {userMessages.length > 0 && <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-[9px] animate-pulse">{userMessages.length}</span>}
            </button>
          </nav>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            <h3 className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-2 pl-1 flex justify-between items-center">
                <span>{sidebarLabel}</span>
                <span className="bg-slate-950 px-1.5 py-0.5 rounded text-blue-500 border border-slate-800 text-[10px]">
                    {sidebarMachines.length}
                </span>
            </h3>
            <div className="space-y-1.5">
                {sidebarMachines.map(m => {
                    const machineAlert = alerts.find(a => a.relatedId === m.id && a.severity === 'HIGH');
                    return (
                      <button 
                        key={m.id} 
                        onClick={() => handleMachineSwitch(m.id)}
                        className={`w-full p-2 sm:p-2.5 lg:p-3 rounded-lg text-left border transition-all relative ${selectedMachineId === m.id ? 'bg-blue-600 border-blue-400 text-white shadow-lg scale-[1.01]' : 'bg-slate-950/40 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                      >
                        {machineAlert && (
                            <div className="absolute top-1.5 right-1.5 animate-bounce text-red-500 bg-red-500/10 p-0.5 rounded">
                                <AlertTriangle size={12} />
                            </div>
                        )}
                        <div className="font-black text-[10px] uppercase mb-0.5 leading-tight">{m.name}</div>
                        <div className="flex justify-between items-center">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{m.type}</span>
                            <span className={`w-1.5 h-1.5 rounded-full ${m.status === 'RUNNING' ? 'bg-green-400 shadow-[0_0_6px_rgba(34,197,94,0.6)] animate-pulse' : 'bg-slate-800'}`} />
                        </div>
                      </button>
                    );
                })}
            </div>
          </div>
        </div>
      </aside>

      {/* Área Central: Estación de Trabajo */}
      <main className="flex-1 flex flex-col relative overflow-auto min-h-0 p-2 sm:p-3 lg:p-4 lg:pl-2">
        {selectedMachine ? (
          <div className="flex flex-col h-full gap-2 sm:gap-3 lg:gap-4 min-h-0">
            
            {/* Header: Máquina y Operario Responsable */}
            <div className="bg-slate-900 p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl border border-slate-800 flex flex-wrap justify-between items-center gap-2 shadow-xl shrink-0">
              <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 min-w-0">
                <div className={`p-2 sm:p-2.5 rounded-lg shrink-0 ${hasCriticalAlert ? 'bg-red-600/10 text-red-500' : 'bg-blue-600/10 text-blue-500'}`}>
                    {hasCriticalAlert ? <AlertTriangle className="w-5 h-5 sm:w-5 sm:h-5 lg:w-6 lg:h-6 animate-pulse" /> : <Monitor className="w-5 h-5 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-black text-white uppercase tracking-tighter leading-none">{selectedMachine.name}</h2>
                    <span className={`px-2 py-1 sm:px-2.5 sm:py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${selectedMachine.status === 'RUNNING' ? 'bg-green-500 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                        {selectedMachine.status === 'RUNNING' && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                        {selectedMachine.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1 sm:mt-1.5">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-black uppercase tracking-wider">
                          <UserIcon size={12} className="text-blue-500 shrink-0" /> Responsable: <span className="text-white">{currentUser.name}</span>
                      </div>
                      <div className="h-3 w-px bg-slate-800 hidden sm:block" />
                      <div className="text-[10px] text-slate-400 font-black uppercase tracking-wider">
                          Rendimiento: <span className="text-blue-400">{selectedMachine.efficiency}%</span>
                      </div>
                  </div>
                </div>
              </div>

              {/* Botón de Incidentes */}
              <button 
                onClick={() => setShowAlertDetails(!showAlertDetails)}
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 py-2 sm:px-3 sm:py-2 rounded-lg border transition-all relative shrink-0 ${machineAlerts.length > 0 ? 'bg-red-600/10 border-red-500/50 text-red-500 hover:bg-red-600/20' : 'bg-slate-800 border-slate-800 text-slate-500 cursor-not-allowed'}`}
                disabled={machineAlerts.length === 0}
              >
                  <AlertCircle className="w-4 h-4 lg:w-4 lg:h-4" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Incidencias ({machineAlerts.length})</span>
                  {showAlertDetails && (
                      <div className="absolute right-0 top-full mt-2 w-[calc(100vw-1.5rem)] sm:w-80 max-w-sm bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 p-3 sm:p-4 animate-fade-in text-left ring-1 ring-slate-800">
                          <div className="flex justify-between items-center mb-2 sm:mb-3">
                              <h4 className="text-[10px] font-black text-white uppercase tracking-wider">Gestión de Incidentes</h4>
                              <button onClick={(e) => { e.stopPropagation(); setShowAlertDetails(false); }} className="text-slate-500 hover:text-white p-1.5 bg-slate-950 rounded-lg"><X size={14} /></button>
                          </div>
                          <div className="space-y-2">
                              {machineAlerts.map(a => (
                                  <div key={a.id} className="p-2.5 sm:p-3 bg-red-600/10 border border-red-500/30 rounded-lg">
                                      <div className="text-[10px] font-black text-red-500 uppercase tracking-wider mb-0.5">{a.type.replace('_', ' ')}</div>
                                      <p className="text-xs text-slate-200 font-bold leading-tight">{a.message}</p>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}
              </button>
            </div>

            {viewTab === 'CONTROLS' ? (
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-3 lg:gap-4 overflow-hidden min-h-0">
                
                {/* 1. HISTORIAL (Lateral Izquierdo) */}
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
                                            <Package size={10}/> {lastJob.targetQuantity} {lastJob.unit}
                                        </div>
                                        <div className="mt-2 pt-2 border-t border-slate-800 text-[9px] text-slate-400 font-mono flex items-center gap-1.5">
                                            <Clock size={10} /> {new Date(lastJob.completedAt || '').toLocaleTimeString()}
                                        </div>
                                    </div>
                                    <p className="text-[9px] text-slate-400 font-black uppercase text-center tracking-wider pt-2">Historial de Turno Actual</p>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-4">
                                    <Box className="w-6 h-6 sm:w-8 sm:h-8 mb-2 opacity-40" />
                                    <div className="text-[10px] font-black uppercase tracking-wider">Sin registros</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. ORDEN EN CURSO (Panel Dominante Central) */}
                <div className="lg:col-span-6 flex flex-col h-full min-h-0">
                    <div className={`p-0.5 flex flex-col h-full rounded-lg sm:rounded-xl transition-all duration-700 min-h-0 ${activeJob ? 'bg-blue-600/30' : 'bg-slate-900/50 border border-dashed border-slate-800'}`}>
                        <div className="bg-slate-900 p-2 sm:p-3 lg:p-5 rounded-lg sm:rounded-xl h-full flex flex-col relative overflow-hidden shadow min-h-0">
                            
                            {!activeJob && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center z-0 p-3 sm:p-4 text-center">
                                    <Box className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 mb-2 sm:mb-3 opacity-10 animate-pulse text-slate-600" />
                                    <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-400 mb-2">Cámara de Trabajo Vacía</h3>
                                    <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Cargue una orden desde &quot;Futuro&quot; para comenzar.</p>
                                    <p className="text-[10px] sm:text-xs text-slate-400">
                                        Asigne órdenes desde{' '}
                                        <Link to="/orders" className="text-blue-400 hover:text-blue-300 underline font-bold">Producción</Link>
                                        {' '}o{' '}
                                        <Link to="/projects" className="text-blue-400 hover:text-blue-300 underline font-bold">Proyectos</Link>.
                                    </p>
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
                                                <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block text-center">Reporte Manual de Avance Físico</label>
                                                <input 
                                                    type="range" min="0" max="100" step="1"
                                                    value={progressPercent}
                                                    onChange={handleSliderChange}
                                                    disabled={selectedMachine.status !== MachineStatus.RUNNING}
                                                    className="w-full h-5 sm:h-6 bg-slate-950 rounded-lg appearance-none cursor-pointer border border-slate-800 accent-blue-600 disabled:opacity-10 transition-all hover:border-slate-700"
                                                />
                                            </div>
                                        </div>

                                        {/* Controles de Acción */}
                                        <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-2 sm:pt-3">
                                            <button 
                                                onClick={() => onStatusChange(selectedMachine.id, MachineStatus.RUNNING)} 
                                                disabled={selectedMachine.status === 'RUNNING'}
                                                className="bg-green-600 hover:bg-green-500 disabled:bg-slate-800 disabled:text-slate-700 p-2 sm:p-3 lg:p-4 rounded-lg flex flex-col items-center gap-1 sm:gap-2 transition-all active:scale-95 shadow-lg shadow-green-600/20 ring-1 ring-green-400/20 group"
                                            >
                                                <Play className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white group-hover:scale-110 transition-transform"/>
                                                <span className="text-white font-black uppercase text-[10px] tracking-wider">Iniciar Producción</span>
                                            </button>
                                            <div className="relative group">
                                                <button 
                                                    onClick={() => handleJobUpdate(activeJob.id, activeJob.targetQuantity, true)} 
                                                    disabled={selectedMachine.status !== 'RUNNING' || progressPercent < 100} 
                                                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-700 p-2 sm:p-3 lg:p-4 rounded-lg flex flex-col items-center gap-1 sm:gap-2 transition-all active:scale-95 shadow-lg shadow-blue-600/20 ring-1 ring-blue-400/20"
                                                >
                                                    <Square className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${progressPercent === 100 ? "text-white" : "text-slate-700"}`}/>
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

                {/* 3. SIGUIENTE EN COLA (Lateral Derecho) */}
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
                                                    <Package size={10}/> {job.targetQuantity} {job.unit}
                                                </div>
                                                <div className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-black uppercase">{job.status}</div>
                                            </div>
                                            {idx === 0 && (
                                                <button 
                                                    onClick={() => onLoadJob(selectedMachine.id, job.id)}
                                                    disabled={!!activeJob}
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
                                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-4 sm:py-6 text-center px-3">
                                    <Clock className="w-6 h-6 sm:w-8 sm:h-8 mb-2 opacity-40" />
                                    <div className="text-[10px] font-black uppercase tracking-wider mb-1">Cola vacía</div>
                                    <p className="text-[10px] text-slate-400">
                                        Asigne órdenes desde{' '}
                                        <Link to="/orders" className="text-blue-400 hover:text-blue-300 underline font-bold">Producción</Link>
                                        {' '}o{' '}
                                        <Link to="/projects" className="text-blue-400 hover:text-blue-300 underline font-bold">Proyectos</Link>.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
              </div>
            ) : (
              /* TAB DE MENSAJERÍA */
              <div className="space-y-2 sm:space-y-3 overflow-y-auto max-h-full pr-1 sm:pr-2 custom-scrollbar flex-1 min-h-0">
                {userMessages.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-slate-500">
                        <MessageSquare className="w-8 h-8 sm:w-10 sm:h-10 mb-2 sm:mb-3 opacity-40" />
                        <p className="font-black uppercase tracking-wider text-xs sm:text-sm text-slate-400">Bandeja de Entrada Vacía</p>
                    </div>
                )}
                {userMessages.slice().reverse().map(m => (
                  <div key={m.id} className={`p-2.5 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl border transition-all ${m.to === 'ALL' ? 'bg-blue-600/10 border-blue-500/30 shadow shadow-blue-600/10' : 'bg-slate-900 border-slate-800'}`}>
                    <div className="flex flex-wrap justify-between items-center gap-1.5 mb-2 sm:mb-2.5">
                      <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full shrink-0 ${m.to === 'ALL' ? 'bg-blue-500' : 'bg-slate-700'}`} />
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">De: <span className="text-white">{m.from}</span></span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded">{new Date(m.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-xs sm:text-sm lg:text-base text-slate-100 leading-snug font-bold">{m.content}</p>
                  </div>
                ))}
              </div>
            )}
            
            {/* Notificación Emergente: Orden Lista */}
            {!activeJob && machineQueue.length > 0 && selectedMachine.status === MachineStatus.IDLE && (
              <div className="absolute left-2 right-2 sm:left-4 sm:right-4 lg:inset-x-8 bottom-2 sm:bottom-4 lg:bottom-6 z-[60] bg-blue-600 p-2.5 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl shadow-xl flex flex-wrap items-center justify-between gap-2 sm:gap-3 border-t-2 border-blue-400 animate-bounce-slow ring-2 ring-blue-600/20">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div className="bg-white/20 p-2 sm:p-2.5 rounded-lg shadow-inner shrink-0"><Package className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white"/></div>
                      <div className="min-w-0">
                          <div className="text-white font-black uppercase text-[10px] tracking-wider opacity-90 mb-0.5">Carga de Producción Prioritaria</div>
                          <div className="text-white font-black text-sm sm:text-base lg:text-lg tracking-tighter uppercase leading-none truncate">{machineQueue[0].productName}</div>
                      </div>
                  </div>
                  <button 
                    onClick={() => onLoadJob(selectedMachine.id, machineQueue[0].id)}
                    className="bg-white text-blue-600 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg font-black uppercase text-[10px] sm:text-xs shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 group/notif shrink-0"
                  >
                      Empezar Ahora <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover/notif:translate-x-1 transition-transform" />
                  </button>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-900/40 border-2 border-dashed border-slate-800 rounded-lg sm:rounded-xl animate-pulse m-2 sm:m-4">
            <Settings className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 mb-2 sm:mb-3 opacity-30 animate-spin-slow" />
            <p className="font-black uppercase tracking-wider text-sm sm:text-base lg:text-lg">Seleccione una Estación</p>
          </div>
        )}
      </main>
    </div>
  );
}
