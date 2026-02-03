
import React from 'react';
import { Machine, FactoryEvent, Job, SystemAlert, Project, MachineStatus, SystemMessage, User } from '../types';
import { MachineCard } from '../components/MachineCard';
import { PieChart, Pie, Cell } from 'recharts';
import { Activity, AlertOctagon, Factory, BarChart3, TrendingUp, Scissors, MessageSquare, Info, AlertTriangle, ChevronRight, AlertCircle, Truck, Calendar, Users as UsersIcon } from 'lucide-react';

interface DashboardViewProps {
  machines: Machine[];
  events: FactoryEvent[];
  jobs: Job[];
  projects: Project[];
  alerts: SystemAlert[];
  messages: SystemMessage[];
  users: User[];
  onNavigateToMachine: (machineId: string) => void;
  onEditMachine: (machineId: string) => void;
  onAlertClick?: (alert: SystemAlert) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
    machines, events, jobs, projects, alerts, messages, users,
    onNavigateToMachine, onEditMachine, onAlertClick 
}) => {
  const avgOee = Math.round(machines.reduce((acc, m) => acc + m.efficiency, 0) / machines.length) || 0;
  
  const oeeComponents = [
    { name: 'Disponibilidad', value: 92, color: '#3b82f6' },
    { name: 'Rendimiento', value: 88, color: '#8b5cf6' },
    { name: 'Calidad', value: 98, color: '#10b981' },
  ];

  const today = new Date().toISOString().split('T')[0];
  
  // Detectar proyectos finalizados que vencen hoy (Carga del día)
  const loadingProjects = projects.filter(p => {
    const isDueToday = p.deadline === today;
    const projectJobs = jobs.filter(j => j.projectId === p.id);
    const allFinished = projectJobs.length > 0 && projectJobs.every(j => j.status === 'COMPLETED');
    return isDueToday && allFinished;
  });

  const loadingTeamMachine = machines.find(m => m.type === 'CARGA');
  const loadingTeam = users.filter(u => loadingTeamMachine?.operatorIds.includes(u.id));

  const criticalAlerts = alerts.filter(a => a.severity === 'HIGH' && a.type !== 'READY_FOR_DELIVERY');

  return (
    <div className="space-y-6 animate-fade-in pb-10 overflow-y-auto h-full pr-2 custom-scrollbar">
      
      {/* SECCIÓN: CARGA DEL DÍA (Atención Especial) */}
      {loadingProjects.length > 0 && (
          <div className="bg-slate-900 border-2 border-blue-500/50 p-8 rounded-[3.5rem] shadow-2xl shadow-blue-500/10 flex flex-col md:flex-row gap-8 items-center">
              <div className="bg-blue-600 p-8 rounded-[2.5rem] shadow-xl shadow-blue-600/30">
                  <Truck className="text-white" size={48} />
              </div>
              <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full border border-blue-500/20">Programado para Hoy</span>
                  </div>
                  <h2 className="text-4xl font-black text-white uppercase tracking-tighter leading-none mb-4">
                      {loadingProjects.length === 1 ? loadingProjects[0].name : `${loadingProjects.length} Proyectos en Carga`}
                  </h2>
                  <div className="flex flex-wrap gap-4">
                      {loadingProjects.map(p => (
                          <div key={p.id} className="text-sm font-bold text-slate-400 flex items-center gap-2">
                              <Calendar size={14} className="text-blue-500"/> {p.name}
                          </div>
                      ))}
                  </div>
              </div>
              <div className="w-full md:w-auto bg-slate-800/50 p-6 rounded-[2.5rem] border border-slate-700">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <UsersIcon size={14} className="text-blue-500"/> Equipo de Carga Destinado
                  </div>
                  <div className="flex -space-x-3 overflow-hidden">
                      {loadingTeam.length > 0 ? loadingTeam.map(op => (
                          <div key={op.id} title={op.name} className="inline-block h-12 w-12 rounded-2xl ring-4 ring-slate-800 bg-blue-600 flex items-center justify-center font-black text-white shadow-lg border border-white/10 uppercase">
                              {op.name.charAt(0)}
                          </div>
                      )) : (
                          <span className="text-red-500 text-[10px] font-black uppercase italic tracking-widest">Sin equipo asignado</span>
                      )}
                  </div>
                  {loadingTeam.length > 0 && <div className="mt-3 text-[10px] text-slate-400 font-bold uppercase">{loadingTeam.length} Operarios en ruta</div>}
              </div>
          </div>
      )}

      {/* Alertas Críticas Banner */}
      {criticalAlerts.length > 0 && (
          <div className="space-y-3">
              <div className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] pl-2 flex items-center gap-2">
                  <AlertCircle size={14} /> {criticalAlerts.length} Incidentes Detectados
              </div>
              {criticalAlerts.map(alert => (
                  <button 
                    key={alert.id}
                    onClick={() => onAlertClick?.(alert)}
                    className="w-full bg-red-600/10 border-2 border-red-500/30 p-5 rounded-[2rem] flex items-center justify-between hover:bg-red-600/20 transition-all group"
                  >
                      <div className="flex items-center gap-6">
                          <div className="bg-red-500 p-2.5 rounded-2xl shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse">
                            <AlertTriangle className="w-6 h-6 text-white" />
                          </div>
                          <div className="text-left">
                              <div className="text-white font-black uppercase text-base tracking-tighter">{alert.type.replace('_', ' ')}</div>
                              <div className="text-red-400 text-sm font-bold">{alert.message}</div>
                          </div>
                      </div>
                      <div className="flex items-center gap-2 text-red-500 font-black uppercase text-[10px] tracking-widest bg-red-500/10 px-4 py-2 rounded-xl">
                        <span>Solucionar</span>
                        <ChevronRight className="group-hover:translate-x-1 transition-transform" size={14} />
                      </div>
                  </button>
              ))}
          </div>
      )}

      {/* KPI Principal Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity"><Activity className="w-24 h-24 text-blue-500" /></div>
          <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">OEE Global</div>
          <div className="text-5xl font-black text-white tracking-tighter">{avgOee}%</div>
          <div className="flex items-center gap-1 text-[10px] text-green-400 mt-2 font-black uppercase tracking-widest"><TrendingUp size={12}/> +1.2% Trend</div>
        </div>

        <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity"><Truck className="w-24 h-24 text-blue-500" /></div>
          <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Órdenes Activas</div>
          <div className="text-5xl font-black text-white tracking-tighter">{jobs.filter(j => j.status === 'IN_PROGRESS').length}</div>
          <div className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest">Carga de Turno</div>
        </div>

        <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl lg:col-span-2 flex items-center gap-6">
            <div className="flex-1">
                <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4">Métricas de Rendimiento</div>
                <div className="space-y-4">
                    {oeeComponents.map(comp => (
                        <div key={comp.name}>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span className="text-slate-400 font-black uppercase tracking-widest">{comp.name}</span>
                                <span className="text-white font-black">{comp.value}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${comp.value}%`, backgroundColor: comp.color }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="hidden sm:block shrink-0">
                <PieChart width={120} height={120}>
                    <Pie data={oeeComponents} innerRadius={40} outerRadius={55} paddingAngle={5} dataKey="value" stroke="none">
                        {oeeComponents.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                </PieChart>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Estatus de Planta</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {machines.map(m => {
                    const hasHighAlert = alerts.some(a => a.relatedId === m.id && a.severity === 'HIGH');
                    const assignedOperators = users.filter(u => m.operatorIds.includes(u.id));
                    return (
                        <div key={m.id} className="relative">
                            {hasHighAlert && (
                                <div className="absolute -top-2 -right-2 z-20 animate-bounce">
                                    <div className="bg-red-600 text-white p-1.5 rounded-full shadow-lg border-2 border-slate-800">
                                        <AlertTriangle size={14} />
                                    </div>
                                </div>
                            )}
                            <MachineCard 
                                machine={m} 
                                operators={assignedOperators}
                                projectName={projects.find(p => p.id === jobs.find(j => j.id === m.currentJobId)?.projectId)?.name}
                                onClick={() => onNavigateToMachine(m.id)}
                                onEdit={onEditMachine as any}
                                className={hasHighAlert ? 'ring-2 ring-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : ''}
                            />
                        </div>
                    );
                })}
              </div>
          </div>

          <div className="space-y-6">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Eventos de Hoy</h2>
              <div className="bg-slate-800 rounded-3xl border border-slate-700 overflow-hidden flex flex-col h-[450px] shadow-2xl">
                    <div className="bg-slate-900 px-4 py-3 border-b border-slate-700 text-[10px] text-slate-500 font-black uppercase tracking-widest">Logs en Tiempo Real</div>
                    <div className="overflow-y-auto p-4 space-y-4 flex-1 custom-scrollbar">
                        {events.length === 0 && <p className="text-slate-500 text-center py-10 text-[10px] font-black uppercase tracking-widest opacity-20">Esperando Señal...</p>}
                        {events.map((event) => (
                            <div key={event.id} className="flex gap-3 pb-3 border-b border-slate-700/50 last:border-0 hover:bg-slate-700/20 p-2 rounded-2xl transition-colors">
                                <div className={`mt-1 min-w-[8px] h-2 rounded-full ${event.severity === 'CRITICAL' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-blue-500'}`} />
                                <div>
                                    <div className="flex justify-between w-full gap-2">
                                        <span className="text-[10px] font-black text-slate-200 uppercase tracking-widest truncate">{machines.find(m => m.id === event.machineId)?.name || event.machineId}</span>
                                        <span className="text-[9px] text-slate-600 font-mono shrink-0">{new Date(event.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1 leading-relaxed font-medium">{event.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
              </div>
          </div>
      </div>
    </div>
  );
};
