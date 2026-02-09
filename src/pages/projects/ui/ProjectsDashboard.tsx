import type { Project, Job, Client } from '@/shared/types';
import { StatCard } from '@/shared/ui';

interface ProjectsDashboardProps {
  projects: Project[];
  jobs: Job[];
  clients: Client[];
  calculateProgress: (pId: string) => number;
}

export function ProjectsDashboard({ projects, jobs, clients, calculateProgress }: ProjectsDashboardProps) {
  const activeProjects = projects.filter((p) => p.status === 'IN_PROGRESS').length;
  const delayedProjects = projects.filter((p) => p.status === 'DELAYED').length;
  const totalJobs = jobs.length;
  const completedJobs = jobs.filter((j) => j.status === 'COMPLETED').length;

  return (
    <div className="p-6 space-y-8 animate-fade-in h-full overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Proyectos Activos" value={activeProjects} />
        <StatCard label="Proyectos Atrasados" value={delayedProjects} variant="warning" />
        <StatCard
          label="Avance Global Órdenes"
          value={`${Math.round((completedJobs / totalJobs) * 100) || 0}%`}
          variant="success"
        />
        <StatCard
          label="Próxima Entrega"
          value={
            projects
              .filter((p) => p.status !== 'COMPLETED' && p.status !== 'ARCHIVED')
              .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())[0]
              ?.deadline ?? 'N/A'
          }
          className="[&>div:last-child]:text-xl [&>div:last-child]:mt-2"
        />
      </div>

      <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700">
        <h3 className="text-lg font-bold text-white mb-6">Evolución de Proyectos (Gantt)</h3>
        <div className="space-y-6">
          {projects
            .filter((p) => p.status !== 'ARCHIVED')
            .map((p) => {
              const progress = calculateProgress(p.id);
              const clientName = clients.find((c) => c.id === p.clientId)?.name || 'N/A';
              return (
                <div key={p.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-bold text-slate-200 w-1/4 truncate">{p.name}</span>
                    <span className="text-slate-500 w-1/4 truncate">{clientName}</span>
                    <span className="text-slate-400 text-xs w-1/4 text-right">Entrega: {p.deadline}</span>
                    <span className="text-slate-400 text-xs w-1/12 text-right">{progress}%</span>
                  </div>
                  <div className="w-full h-6 bg-slate-800 rounded-full overflow-hidden relative">
                    <div className="absolute top-0 bottom-0 left-0 w-px bg-slate-700"></div>
                    <div className="absolute top-0 bottom-0 left-1/2 w-px bg-slate-700"></div>
                    <div
                      className={`h-full flex items-center justify-end px-2 text-[10px] font-bold text-white transition-all ${
                        p.status === 'COMPLETED'
                          ? 'bg-green-600'
                          : p.status === 'DELAYED'
                            ? 'bg-red-600'
                            : 'bg-blue-600'
                      }`}
                      style={{ width: `${Math.max(5, progress)}%` }}
                    >
                      {progress > 10 && 'Progreso'}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
