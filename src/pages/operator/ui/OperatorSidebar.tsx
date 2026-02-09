import type { Machine, User, SystemAlert, SystemMessage } from '@/shared/types';
import { Tabs, Button } from '@/shared/ui';
import { LogOut, AlertTriangle } from 'lucide-react';

interface OperatorSidebarProps {
  currentUser: User;
  viewTab: 'CONTROLS' | 'MESSAGES';
  onViewTabChange: (tab: 'CONTROLS' | 'MESSAGES') => void;
  sidebarMachines: Machine[];
  sidebarLabel: string;
  selectedMachineId: string;
  onMachineSwitch: (id: string) => void;
  alerts: SystemAlert[];
  userMessages: SystemMessage[];
  onLogout: () => void;
}

export function OperatorSidebar({
  currentUser,
  viewTab,
  onViewTabChange,
  sidebarMachines,
  sidebarLabel,
  selectedMachineId,
  onMachineSwitch,
  alerts,
  userMessages,
  onLogout,
}: OperatorSidebarProps) {
  return (
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
          <Button variant="ghost" size="sm" onClick={onLogout} className="shrink-0 bg-slate-950 border border-slate-800" title="Cerrar Sesión">
            <LogOut size={18} className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>

        <Tabs
          tabs={[
            { id: 'CONTROLS', label: 'Controles' },
            {
              id: 'MESSAGES',
              label: (
                <>
                  Mensajes
                  {userMessages.length > 0 && (
                    <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-[9px] animate-pulse">
                      {userMessages.length}
                    </span>
                  )}
                </>
              ),
            },
          ]}
          activeId={viewTab}
          onChange={(id) => onViewTabChange(id as 'CONTROLS' | 'MESSAGES')}
          className="!flex !gap-1.5 !bg-slate-950 !p-1.5 !rounded-lg !border-slate-800 !border mb-2 sm:mb-3 !shadow-none"
        />

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
                  onClick={() => onMachineSwitch(m.id)}
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
  );
}
