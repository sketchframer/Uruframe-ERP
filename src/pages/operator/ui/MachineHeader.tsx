import type { Machine, User, SystemAlert } from '@/shared/types';
import { AlertTriangle, Monitor, User as UserIcon, AlertCircle, X } from 'lucide-react';

interface MachineHeaderProps {
  selectedMachine: Machine;
  currentUser: User;
  hasCriticalAlert: boolean;
  machineAlerts: SystemAlert[];
  showAlertDetails: boolean;
  onToggleAlertDetails: () => void;
  onCloseAlertDetails: () => void;
}

export function MachineHeader({
  selectedMachine,
  currentUser,
  hasCriticalAlert,
  machineAlerts,
  showAlertDetails,
  onToggleAlertDetails,
  onCloseAlertDetails,
}: MachineHeaderProps) {
  return (
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
        onClick={onToggleAlertDetails}
        className={`flex items-center gap-1.5 sm:gap-2 px-2.5 py-2 sm:px-3 sm:py-2 rounded-lg border transition-all relative shrink-0 ${machineAlerts.length > 0 ? 'bg-red-600/10 border-red-500/50 text-red-500 hover:bg-red-600/20' : 'bg-slate-800 border-slate-800 text-slate-500 cursor-not-allowed'}`}
        disabled={machineAlerts.length === 0}
      >
        <AlertCircle className="w-4 h-4 lg:w-4 lg:h-4" />
        <span className="text-[10px] font-black uppercase tracking-wider">Incidencias ({machineAlerts.length})</span>
        {showAlertDetails && (
          <div className="absolute right-0 top-full mt-2 w-[calc(100vw-1.5rem)] sm:w-80 max-w-sm bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 p-3 sm:p-4 animate-fade-in text-left ring-1 ring-slate-800">
            <div className="flex justify-between items-center mb-2 sm:mb-3">
              <h4 className="text-[10px] font-black text-white uppercase tracking-wider">Gestión de Incidentes</h4>
              <button onClick={(e) => { e.stopPropagation(); onCloseAlertDetails(); }} className="text-slate-500 hover:text-white p-1.5 bg-slate-950 rounded-lg"><X size={14} /></button>
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
  );
}
