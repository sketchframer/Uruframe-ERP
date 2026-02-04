import React from 'react';
import { useProjectStore } from '@/entities/project';
import { useJobStore } from '@/entities/job';
import { useMachineStore } from '@/entities/machine';
import { useUserStore } from '@/entities/user';
import { Truck, Calendar, Users as UsersIcon } from 'lucide-react';

export function LoadingSchedule() {
  const projects = useProjectStore((s) => s.projects);
  const jobs = useJobStore((s) => s.jobs);
  const machines = useMachineStore((s) => s.machines);
  const users = useUserStore((s) => s.users);

  const today = new Date().toISOString().split('T')[0];
  const loadingProjects = projects.filter((p) => {
    const isDueToday = p.deadline === today;
    const projectJobs = jobs.filter((j) => j.projectId === p.id);
    const allFinished =
      projectJobs.length > 0 &&
      projectJobs.every((j) => j.status === 'COMPLETED');
    return isDueToday && allFinished;
  });

  const loadingTeamMachine = machines.find((m) => m.type === 'CARGA');
  const loadingTeam = users.filter((u) =>
    loadingTeamMachine?.operatorIds.includes(u.id)
  );

  if (loadingProjects.length === 0) return null;

  return (
    <div className="bg-slate-900 border-2 border-blue-500/50 p-8 rounded-[3.5rem] shadow-2xl shadow-blue-500/10 flex flex-col md:flex-row gap-8 items-center">
      <div className="bg-blue-600 p-8 rounded-[2.5rem] shadow-xl shadow-blue-600/30">
        <Truck className="text-white" size={48} />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <span className="bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full border border-blue-500/20">
            Programado para Hoy
          </span>
        </div>
        <h2 className="text-4xl font-black text-white uppercase tracking-tighter leading-none mb-4">
          {loadingProjects.length === 1
            ? loadingProjects[0].name
            : `${loadingProjects.length} Proyectos en Carga`}
        </h2>
        <div className="flex flex-wrap gap-4">
          {loadingProjects.map((p) => (
            <div
              key={p.id}
              className="text-sm font-bold text-slate-400 flex items-center gap-2"
            >
              <Calendar size={14} className="text-blue-500" /> {p.name}
            </div>
          ))}
        </div>
      </div>
      <div className="w-full md:w-auto bg-slate-800/50 p-6 rounded-[2.5rem] border border-slate-700">
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <UsersIcon size={14} className="text-blue-500" /> Equipo de Carga
          Destinado
        </div>
        <div className="flex -space-x-3 overflow-hidden">
          {loadingTeam.length > 0 ? (
            loadingTeam.map((op) => (
              <div
                key={op.id}
                title={op.name}
                className="inline-block h-12 w-12 rounded-2xl ring-4 ring-slate-800 bg-blue-600 flex items-center justify-center font-black text-white shadow-lg border border-white/10 uppercase"
              >
                {op.name.charAt(0)}
              </div>
            ))
          ) : (
            <span className="text-red-500 text-[10px] font-black uppercase italic tracking-widest">
              Sin equipo asignado
            </span>
          )}
        </div>
        {loadingTeam.length > 0 && (
          <div className="mt-3 text-[10px] text-slate-400 font-bold uppercase">
            {loadingTeam.length} Operarios en ruta
          </div>
        )}
      </div>
    </div>
  );
}
