
import React from 'react';
import { Machine, MachineStatus, Job, User } from '../types';
import { Activity, AlertTriangle, Thermometer, User as UserIcon, Settings, FileText, Users, Hammer } from 'lucide-react';

interface MachineCardProps {
  machine: Machine;
  projectName?: string;
  activeJob?: Job;
  operators?: User[]; 
  onClick: () => void;
  onEdit: () => void;
  className?: string;
}

const statusColors = {
  [MachineStatus.RUNNING]: 'bg-green-500/20 border-green-500 text-green-400',
  [MachineStatus.IDLE]: 'bg-yellow-500/20 border-yellow-500 text-yellow-400',
  [MachineStatus.ERROR]: 'bg-red-500/20 border-red-500 text-red-400',
  [MachineStatus.MAINTENANCE]: 'bg-orange-500/20 border-orange-500 text-orange-400',
  [MachineStatus.OFFLINE]: 'bg-slate-700/50 border-slate-600 text-slate-400',
};

export const MachineCard: React.FC<MachineCardProps> = ({ machine, projectName, activeJob, operators, onClick, onEdit, className }) => {
  
  let subStatus = "";
  if (machine.type === 'HERRERIA' && machine.status === 'RUNNING' && activeJob?.workflowStages) {
      const activeStage = activeJob.workflowStages.find(s => !s.isCompleted);
      if (activeStage) {
          subStatus = `ETAPA: ${activeStage.name}`;
      }
  }

  return (
    <div 
      className={`relative p-5 rounded-[1.5rem] border-l-8 transition-all bg-slate-800 shadow-lg hover:shadow-xl hover:scale-[1.01] ${className} ${statusColors[machine.status].replace('bg-', 'border-l-')}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div onClick={onClick} className="cursor-pointer flex-1">
          <h3 className="text-xl font-black text-white tracking-tighter uppercase">{machine.name}</h3>
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{machine.brand || machine.type}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
            <div className={`px-3 py-1 rounded-lg text-[10px] font-black border uppercase tracking-widest ${statusColors[machine.status]}`}>
            {machine.status}
            </div>
            <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="text-slate-600 hover:text-white p-1 transition-colors">
                <Settings className="w-4 h-4" />
            </button>
        </div>
      </div>

      <div onClick={onClick} className="space-y-3 mt-4 cursor-pointer">
        {machine.status === MachineStatus.RUNNING && (
           <div className="flex items-center text-xs text-slate-300 font-bold">
             <Activity className="w-4 h-4 mr-2 text-blue-400" />
             <span className="uppercase tracking-wide">{subStatus ? subStatus : `Eficiencia: ${machine.efficiency}%`}</span>
           </div>
        )}
        
        <div className="flex flex-col gap-1">
          <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1 flex items-center gap-2">
            <UserIcon size={12} /> Personal Asignado
          </div>
          {operators && operators.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {operators.map(op => (
                <span key={op.id} className="bg-slate-700/50 text-slate-300 text-[10px] px-2 py-0.5 rounded-md font-bold">
                  {op.name}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-red-500/60 text-[10px] font-black uppercase italic tracking-widest">Sin Operadores</span>
          )}
        </div>
        
        <div className="pt-3 border-t border-slate-700/50 flex flex-col gap-1">
            <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1 flex items-center gap-2">
                <FileText size={12} /> Orden Activa
            </div>
            <div className="text-xs font-bold text-slate-100 truncate">
                {projectName ? projectName : <span className="text-slate-600 italic">No hay carga de trabajo</span>}
            </div>
        </div>
      </div>
      
      {machine.status === MachineStatus.ERROR && (
        <div className="absolute top-4 right-16 animate-pulse">
           <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
      )}
    </div>
  );
};
