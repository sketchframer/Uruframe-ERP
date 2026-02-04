import React from 'react';
import { useMachineStore, useAverageOee } from '@/entities/machine';
import { useJobStore } from '@/entities/job';
import { useProjectStore } from '@/entities/project';
import { useUserStore } from '@/entities/user';
import { useAlertStore } from '@/entities/alert';
import { Activity, TrendingUp, Truck } from 'lucide-react';
import { MachineGrid } from './MachineGrid';
import { OeeChart } from './OeeChart';

interface MachineDashboardProps {
  onMachineClick: (machineId: string) => void;
  onMachineEdit: (machineId: string) => void;
  /** Optional right column content (e.g. Eventos de Hoy + EventFeed) */
  rightColumn?: React.ReactNode;
}

export function MachineDashboard({
  onMachineClick,
  onMachineEdit,
  rightColumn,
}: MachineDashboardProps) {
  const machines = useMachineStore((s) => s.machines);
  const jobs = useJobStore((s) => s.jobs);
  const projects = useProjectStore((s) => s.projects);
  const users = useUserStore((s) => s.users);
  const alerts = useAlertStore((s) => s.alerts);
  const avgOee = useAverageOee();
  const activeOrdersCount = jobs.filter((j) => j.status === 'IN_PROGRESS').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Activity className="w-24 h-24 text-blue-500" />
          </div>
          <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">
            OEE Global
          </div>
          <div className="text-5xl font-black text-white tracking-tighter">
            {avgOee}%
          </div>
          <div className="flex items-center gap-1 text-[10px] text-green-400 mt-2 font-black uppercase tracking-widest">
            <TrendingUp size={12} /> +1.2% Trend
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Truck className="w-24 h-24 text-blue-500" />
          </div>
          <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">
            Órdenes Activas
          </div>
          <div className="text-5xl font-black text-white tracking-tighter">
            {activeOrdersCount}
          </div>
          <div className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest">
            Carga de Turno
          </div>
        </div>

        <div className="lg:col-span-2">
          <OeeChart />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
            Estatus de Planta
          </h2>
          <MachineGrid
            machines={machines}
            jobs={jobs}
            projects={projects}
            users={users}
            alerts={alerts}
            onMachineClick={onMachineClick}
            onMachineEdit={onMachineEdit}
          />
        </div>
        {rightColumn && (
          <div className="space-y-6">{rightColumn}</div>
        )}
      </div>
    </div>
  );
}
