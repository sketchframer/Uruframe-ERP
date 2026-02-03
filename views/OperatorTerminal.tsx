
import React, { useState, useEffect, useRef } from 'react';
import { Machine, MachineStatus, EventType, Job, Project, User, Role, SystemMessage, SystemAlert } from '../types';
import { 
  Play, Square, AlertTriangle, Box, User as UserIcon, LogOut, CheckCircle, Clock, Bell, Settings, Info, MessageSquare, ChevronRight, AlertCircle, X, Package, ArrowRight, Monitor
} from 'lucide-react';

interface OperatorTerminalProps {
  machines: Machine[];
  jobs: Job[];
  projects: Project[];
  users: User[];
  messages: SystemMessage[];
  alerts: SystemAlert[];
  onLogEvent: (machineId: string, type: EventType, description: string, severity: 'INFO' | 'WARNING' | 'CRITICAL') => void;
  onStatusChange: (machineId: string, status: MachineStatus, reason?: string) => void;
  onJobUpdate: (jobId: string, qty: number, isComplete: boolean, operatorNotes?: string) => void;
  onLoadJob: (machineId: string, jobId: string) => void;
  initialMachineId?: string;
  onLogout: () => void;
  authenticatedUser: User;
}

export const OperatorTerminal: React.FC<OperatorTerminalProps> = ({ 
  machines, jobs, projects, users, messages, alerts,
  onLogEvent, onStatusChange, onJobUpdate, onLoadJob,
  onLogout, initialMachineId, authenticatedUser
}) => {
  const [selectedMachineId, setSelectedMachineId] = useState<string>('');
  const [viewTab, setViewTab] = useState<'CONTROLS' | 'MESSAGES'>('CONTROLS');
  const [showAlertDetails, setShowAlertDetails] = useState(false);
  const prevMachineIdRef = useRef<string>('');

  useEffect(() => {
    const assigned = machines.filter(m => m.operatorIds.includes(authenticatedUser.id));
    if (assigned.length === 1) {
        setSelectedMachineId(assigned[0].id);
        prevMachineIdRef.current = assigned[0].id;
    } else if (initialMachineId) {
        setSelectedMachineId(initialMachineId);
        prevMachineIdRef.current = initialMachineId;
    }
  }, [authenticatedUser, initialMachineId]);

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

  const userMessages = messages.filter(m => m.to === 'ALL' || m.to === authenticatedUser.id);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!activeJob) return;
      const percent = parseInt(e.target.value);
      const newQty = Math.round((percent / 100) * activeJob.targetQuantity);
      onJobUpdate(activeJob.id, newQty, false);
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 animate-fade-in relative overflow-hidden bg-slate-950">
      
      {/* Sidebar: Operario */}
      <aside className="w-full lg:w-1/4 flex flex-col gap-4 p-4 lg:p-0">
        <div className="bg-slate-900 p-8 rounded-[3rem] border border-slate-800 shadow-2xl h-full flex flex-col">
          <div className="flex justify-between items-center mb-8 pb-8 border-b border-slate-800">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center font-black text-white text-3xl uppercase shadow-xl shadow-blue-600/30">
                {authenticatedUser.name.charAt(0)}
              </div>
              <div>
                <div className="font-black text-lg text-white uppercase tracking-tighter leading-tight">{authenticatedUser.name}</div>
                <div className="text-[10px] text-blue-500 font-black uppercase tracking-[0.2em] mt-1">{authenticatedUser.role} ACTIVO</div>
              </div>
            </div>
            <button onClick={onLogout} className="text-slate-700 hover:text-red-500 p-3 transition-colors bg-slate-950 rounded-2xl border border-slate-800" title="Cerrar Sesión">
                <LogOut size={24} />
            </button>
          </div>
          
          <nav className="flex gap-2 bg-slate-950 p-2 rounded-[1.5rem] mb-10">
            <button 
                onClick={() => setViewTab('CONTROLS')} 
                className={`flex-1 py-4 text-[10px] font-black uppercase rounded-2xl transition-all ${viewTab === 'CONTROLS' ? 'bg-slate-800 text-white shadow-xl ring-1 ring-slate-700' : 'text-slate-600 hover:text-slate-400'}`}
            >Controles</button>
            <button 
                onClick={() => setViewTab('MESSAGES')} 
                className={`flex-1 py-4 text-[10px] font-black uppercase rounded-2xl transition-all flex items-center justify-center gap-2 ${viewTab === 'MESSAGES' ? 'bg-slate-800 text-white shadow-xl ring-1 ring-slate-700' : 'text-slate-600 hover:text-slate-400'}`}
            >
              Mensajes {userMessages.length > 0 && <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-[8px] animate-pulse">{userMessages.length}</span>}
            </button>
          </nav>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            <h3 className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em] mb-4 pl-2 flex justify-between items-center">
                <span>Mis Estaciones</span>
                <span className="bg-slate-950 px-2 py-1 rounded-lg text-blue-500 border border-slate-800">
                    {machines.filter(m => m.operatorIds.includes(authenticatedUser.id)).length}
                </span>
            </h3>
            <div className="space-y-3">
                {machines.filter(m => m.operatorIds.includes(authenticatedUser.id)).map(m => {
                    const machineAlert = alerts.find(a => a.relatedId === m.id && a.severity === 'HIGH');
                    return (
                      <button 
                        key={m.id} 
                        onClick={() => handleMachineSwitch(m.id)}
                        className={`w-full p-6 rounded-[2rem] text-left border-2 transition-all relative ${selectedMachineId === m.id ? 'bg-blue-600 border-blue-400 text-white shadow-2xl scale-[1.02]' : 'bg-slate-950/40 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                      >
                        {machineAlert && (
                            <div className="absolute top-3 right-3 animate-bounce text-red-500 bg-red-500/10 p-1 rounded-lg">
                                <AlertTriangle size={16} />
                            </div>
                        )}
                        <div className="font-black text-xs uppercase mb-1">{m.name}</div>
                        <div className="flex justify-between items-center">
                            <span className="text-[9px] font-black opacity-60 uppercase tracking-widest">{m.type}</span>
                            <span className={`w-2 h-2 rounded-full ${m.status === 'RUNNING' ? 'bg-green-400 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse' : 'bg-slate-800'}`} />
                        </div>
                      </button>
                    );
                })}
            </div>
          </div>
        </div>
      </aside>

      {/* Área Central: Estación de Trabajo */}
      <main className="flex-1 flex flex-col relative overflow-hidden p-4 lg:p-6 lg:pl-2">
        {selectedMachine ? (
          <div className="flex flex-col h-full gap-6">
            
            {/* Header: Máquina y Operario Responsable */}
            <div className="bg-slate-900 p-8 rounded-[3.5rem] border border-slate-800 flex justify-between items-center shadow-2xl shrink-0">
              <div className="flex items-center gap-8">
                <div className={`p-6 rounded-[2rem] ${hasCriticalAlert ? 'bg-red-600/10 text-red-500 shadow-lg shadow-red-500/10' : 'bg-blue-600/10 text-blue-500 shadow-lg shadow-blue-600/10'}`}>
                    {hasCriticalAlert ? <AlertTriangle size={40} className="animate-pulse" /> : <Monitor size={40} />}
                </div>
                <div>
                  <div className="flex items-center gap-4">
                    <h2 className="text-5xl font-black text-white uppercase tracking-tighter leading-none">{selectedMachine.name}</h2>
                    <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${selectedMachine.status === 'RUNNING' ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-slate-800 text-slate-600 border border-slate-700'}`}>
                        {selectedMachine.status === 'RUNNING' && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                        {selectedMachine.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-black uppercase tracking-widest">
                          <UserIcon size={14} className="text-blue-500" /> Responsable: <span className="text-white">{authenticatedUser.name}</span>
                      </div>
                      <div className="h-4 w-px bg-slate-800" />
                      <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                          Rendimiento: <span className="text-blue-400">{selectedMachine.efficiency}%</span>
                      </div>
                  </div>
                </div>
              </div>

              {/* Botón de Incidentes */}
              <button 
                onClick={() => setShowAlertDetails(!showAlertDetails)}
                className={`flex items-center gap-4 px-8 py-5 rounded-[1.5rem] border-2 transition-all relative ${machineAlerts.length > 0 ? 'bg-red-600/10 border-red-500/50 text-red-500 hover:bg-red-600/20' : 'bg-slate-800 border-slate-800 text-slate-700 opacity-20 cursor-not-allowed'}`}
                disabled={machineAlerts.length === 0}
              >
                  <AlertCircle size={24} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Incidencias ({machineAlerts.length})</span>
                  {showAlertDetails && (
                      <div className="absolute right-0 top-full mt-6 w-96 bg-slate-900 border-2 border-slate-700 rounded-[2.5rem] shadow-[0_20px_80px_rgba(0,0,0,0.6)] z-50 p-8 animate-fade-in text-left ring-1 ring-slate-800">
                          <div className="flex justify-between items-center mb-6">
                              <h4 className="text-xs font-black text-white uppercase tracking-[0.3em]">Gestión de Incidentes</h4>
                              <button onClick={(e) => { e.stopPropagation(); setShowAlertDetails(false); }} className="text-slate-500 hover:text-white p-2 bg-slate-950 rounded-xl"><X size={16} /></button>
                          </div>
                          <div className="space-y-4">
                              {machineAlerts.map(a => (
                                  <div key={a.id} className="p-5 bg-red-600/10 border border-red-500/30 rounded-3xl">
                                      <div className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">{a.type.replace('_', ' ')}</div>
                                      <p className="text-sm text-slate-200 font-bold leading-tight">{a.message}</p>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}
              </button>
            </div>

            {viewTab === 'CONTROLS' ? (
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden min-h-0">
                
                {/* 1. HISTORIAL (Lateral Izquierdo) */}
                <div className="lg:col-span-3 flex flex-col h-full">
                    <div className="bg-slate-900/40 p-8 rounded-[3rem] border border-slate-800 flex-1 flex flex-col shadow-xl">
                        <div className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                            <CheckCircle size={18} className="text-green-500" /> Pasado
                        </div>
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            {lastJob ? (
                                <div className="space-y-6">
                                    <div className="bg-slate-950/50 p-6 rounded-[2rem] border border-slate-800 transition-all hover:border-slate-700">
                                        <div className="text-white font-black uppercase text-xs leading-snug mb-2">{lastJob.productName}</div>
                                        <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2">
                                            <Package size={12}/> {lastJob.targetQuantity} {lastJob.unit}
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-slate-800 text-[9px] text-slate-700 font-mono flex items-center gap-2">
                                            <Clock size={12} /> {new Date(lastJob.completedAt || '').toLocaleTimeString()}
                                        </div>
                                    </div>
                                    <p className="text-[9px] text-slate-700 font-black uppercase text-center tracking-[0.2em] pt-4">Historial de Turno Actual</p>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-slate-800 opacity-20">
                                    <Box size={40} className="mb-4" />
                                    <div className="text-[10px] font-black uppercase tracking-widest">Sin registros</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. ORDEN EN CURSO (Panel Dominante Central) */}
                <div className="lg:col-span-6 flex flex-col h-full">
                    <div className={`p-1 flex flex-col h-full rounded-[4rem] transition-all duration-700 ${activeJob ? 'bg-blue-600/30' : 'bg-slate-900/50 border-2 border-dashed border-slate-800'}`}>
                        <div className="bg-slate-900 p-12 rounded-[3.8rem] h-full flex flex-col relative overflow-hidden shadow-2xl">
                            
                            {!activeJob && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-700 z-0 p-10 text-center">
                                    <Box size={100} className="mb-8 opacity-5 animate-pulse" />
                                    <h3 className="text-2xl font-black uppercase tracking-widest opacity-20 mb-4">Cámara de Trabajo Vacía</h3>
                                    <p className="text-sm font-bold opacity-10 uppercase tracking-widest">Por favor, cargue una orden desde el panel de "Siguiente" para comenzar la producción.</p>
                                </div>
                            )}

                            {activeJob && (
                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="shrink-0 mb-12">
                                        <div className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4 flex items-center gap-3">
                                            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.8)] animate-pulse" /> Presente: Producción
                                        </div>
                                        <h3 className="text-6xl font-black text-white uppercase tracking-tighter leading-none mb-4">{activeJob.productName}</h3>
                                        <div className="flex items-center gap-3">
                                            <div className="px-4 py-1.5 bg-blue-600/10 text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-600/20">
                                                {projects.find(p => p.id === activeJob.projectId)?.name || 'STOCK GENERAL'}
                                            </div>
                                            {activeJob.isStock && <span className="bg-yellow-500/10 text-yellow-500 text-[9px] font-black px-3 py-1 rounded-lg border border-yellow-500/20 tracking-[0.2em] uppercase">PERFIL CATÁLOGO</span>}
                                        </div>
                                    </div>

                                    <div className="flex-1 flex flex-col justify-center gap-14">
                                        {/* Contador Gigante */}
                                        <div className="flex justify-between items-end bg-slate-950/30 p-8 rounded-[2.5rem] border border-slate-800">
                                            <div className="flex flex-col">
                                                <span className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] mb-4 pl-2 border-l-2 border-blue-500">Unidades Logradas</span>
                                                <div className="text-[12rem] font-black text-white leading-none tracking-tighter tabular-nums drop-shadow-2xl">
                                                    {activeJob.completedQuantity}
                                                </div>
                                            </div>
                                            <div className="text-right pb-10">
                                                <div className="text-slate-600 text-[10px] font-black uppercase tracking-widest mb-2 opacity-50">Meta Total</div>
                                                <div className="text-6xl font-black text-slate-700 tracking-tighter tabular-nums">/ {activeJob.targetQuantity}</div>
                                                <div className="text-[10px] text-slate-700 font-black uppercase tracking-widest mt-2">{activeJob.unit}</div>
                                            </div>
                                        </div>

                                        {/* Progreso */}
                                        <div className="space-y-8">
                                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.4em]">
                                                <span className="text-slate-600">Avance Real de Turno</span>
                                                <span className={progressPercent === 100 ? "text-green-500" : "text-blue-500 shadow-blue-500/20"}>{progressPercent}% COMPLETADO</span>
                                            </div>
                                            <div className="h-6 bg-slate-950 rounded-full overflow-hidden shadow-inner ring-1 ring-slate-800 p-1">
                                                <div 
                                                    className={`h-full transition-all duration-1000 ease-out rounded-full ${progressPercent === 100 ? 'bg-green-500 shadow-[0_0_30px_rgba(34,197,94,0.4)]' : 'bg-blue-600 shadow-[0_0_30px_rgba(37,99,235,0.4)]'}`} 
                                                    style={{ width: `${progressPercent}%` }} 
                                                />
                                            </div>
                                            
                                            <div className="pt-8 border-t border-slate-800/50 space-y-5">
                                                <label className="text-[10px] text-slate-700 font-black uppercase tracking-[0.3em] block text-center">Reporte Manual de Avance Físico</label>
                                                <input 
                                                    type="range" min="0" max="100" step="1"
                                                    value={progressPercent}
                                                    onChange={handleSliderChange}
                                                    disabled={selectedMachine.status !== MachineStatus.RUNNING}
                                                    className="w-full h-12 bg-slate-950 rounded-3xl appearance-none cursor-pointer border-2 border-slate-800 accent-blue-600 disabled:opacity-10 transition-all hover:border-slate-700"
                                                />
                                            </div>
                                        </div>

                                        {/* Controles de Acción */}
                                        <div className="grid grid-cols-2 gap-6 pt-6">
                                            <button 
                                                onClick={() => onStatusChange(selectedMachine.id, MachineStatus.RUNNING)} 
                                                disabled={selectedMachine.status === 'RUNNING'}
                                                className="bg-green-600 hover:bg-green-500 disabled:bg-slate-800 disabled:text-slate-700 p-10 rounded-[3rem] flex flex-col items-center gap-4 transition-all active:scale-95 shadow-2xl shadow-green-600/20 ring-1 ring-green-400/20 group"
                                            >
                                                <Play size={40} className="text-white group-hover:scale-110 transition-transform"/>
                                                <span className="text-white font-black uppercase text-xs tracking-[0.3em]">Iniciar Producción</span>
                                            </button>
                                            <div className="relative group">
                                                <button 
                                                    onClick={() => onJobUpdate(activeJob.id, activeJob.targetQuantity, true)} 
                                                    disabled={selectedMachine.status !== 'RUNNING' || progressPercent < 100} 
                                                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-700 p-10 rounded-[3rem] flex flex-col items-center gap-4 transition-all active:scale-95 shadow-2xl shadow-blue-600/20 ring-1 ring-blue-400/20"
                                                >
                                                    <Square size={40} className={progressPercent === 100 ? "text-white" : "text-slate-700"}/>
                                                    <span className="font-black uppercase text-xs tracking-[0.3em]">Finalizar y Liberar</span>
                                                </button>
                                                {progressPercent < 100 && selectedMachine.status === 'RUNNING' && (
                                                    <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-slate-950 text-[10px] font-black text-slate-400 uppercase py-3 px-6 rounded-2xl border border-slate-800 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all shadow-2xl pointer-events-none">
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
                <div className="lg:col-span-3 flex flex-col h-full">
                    <div className="bg-slate-900/40 p-8 rounded-[3rem] border border-slate-800 flex-1 flex flex-col shadow-xl overflow-hidden">
                        <div className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                            <Clock size={18} className="text-blue-500" /> Futuro
                        </div>
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            {machineQueue.length > 0 ? (
                                <div className="space-y-4">
                                    {machineQueue.map((job, idx) => (
                                        <div key={job.id} className={`bg-slate-950/50 p-6 rounded-[2rem] border transition-all ${idx === 0 ? 'border-blue-500/50 shadow-lg shadow-blue-500/5' : 'border-slate-800 opacity-60'}`}>
                                            <div className="text-white font-black uppercase text-xs leading-snug mb-3 truncate" title={job.productName}>{job.productName}</div>
                                            <div className="flex justify-between items-center">
                                                <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2">
                                                    <Package size={12}/> {job.targetQuantity} {job.unit}
                                                </div>
                                                <div className="text-[9px] bg-slate-800 px-2 py-1 rounded-md text-slate-400 font-black uppercase">{job.status}</div>
                                            </div>
                                            {idx === 0 && (
                                                <button 
                                                    onClick={() => onLoadJob(selectedMachine.id, job.id)}
                                                    disabled={!!activeJob}
                                                    className="w-full bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white text-[10px] font-black uppercase py-4 rounded-2xl border border-blue-500/30 transition-all flex items-center justify-center gap-3 mt-6 group/btn"
                                                >
                                                    Cargar en Terminal <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <p className="text-[9px] text-slate-700 font-black uppercase text-center tracking-[0.2em] pt-4">Tareas en Espera</p>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-slate-800 opacity-20 py-20">
                                    <Clock size={40} className="mb-4" />
                                    <div className="text-[10px] font-black uppercase tracking-widest">Cola vacía</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
              </div>
            ) : (
              /* TAB DE MENSAJERÍA */
              <div className="space-y-4 overflow-y-auto max-h-full pr-4 custom-scrollbar flex-1">
                {userMessages.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-40 text-slate-800 opacity-20">
                        <MessageSquare size={100} className="mb-8" />
                        <p className="font-black uppercase tracking-[0.4em] text-lg">Bandeja de Entrada Vacía</p>
                    </div>
                )}
                {userMessages.slice().reverse().map(m => (
                  <div key={m.id} className={`p-10 rounded-[3rem] border-2 transition-all ${m.to === 'ALL' ? 'bg-blue-600/10 border-blue-500/30 shadow-2xl shadow-blue-600/10' : 'bg-slate-900 border-slate-800'}`}>
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${m.to === 'ALL' ? 'bg-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.8)]' : 'bg-slate-700'}`} />
                          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">De: <span className="text-white">{m.from}</span></span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-700 bg-slate-950 px-3 py-1 rounded-lg">{new Date(m.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-2xl text-slate-100 leading-relaxed font-bold">{m.content}</p>
                  </div>
                ))}
              </div>
            )}
            
            {/* Notificación Emergente: Orden Lista */}
            {!activeJob && machineQueue.length > 0 && selectedMachine.status === MachineStatus.IDLE && (
              <div className="absolute inset-x-20 bottom-12 z-[60] bg-blue-600 p-10 rounded-[3.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.6)] flex items-center justify-between border-t-4 border-blue-400 animate-bounce-slow ring-4 ring-blue-600/20">
                  <div className="flex items-center gap-8">
                      <div className="bg-white/20 p-5 rounded-[2rem] shadow-inner"><Package size={40} className="text-white"/></div>
                      <div>
                          <div className="text-white font-black uppercase text-[10px] tracking-[0.4em] opacity-80 mb-2">Carga de Producción Prioritaria</div>
                          <div className="text-white font-black text-3xl tracking-tighter uppercase leading-none">{machineQueue[0].productName}</div>
                      </div>
                  </div>
                  <button 
                    onClick={() => onLoadJob(selectedMachine.id, machineQueue[0].id)}
                    className="bg-white text-blue-600 px-12 py-6 rounded-[1.5rem] font-black uppercase text-sm shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 group/notif"
                  >
                      Empezar Ahora <ArrowRight size={20} className="group-hover/notif:translate-x-1 transition-transform" />
                  </button>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-800 bg-slate-900/40 border-4 border-dashed border-slate-800 rounded-[5rem] animate-pulse m-10">
            <Settings className="w-32 h-32 mb-10 opacity-10 animate-spin-slow" />
            <p className="font-black uppercase tracking-[0.5em] text-2xl opacity-10">Seleccione una Estación</p>
          </div>
        )}
      </main>
    </div>
  );
};
