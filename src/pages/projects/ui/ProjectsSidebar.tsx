import type { Project, Client } from '@/shared/types';
import { Button, Tabs, SelectableList } from '@/shared/ui';
import { Plus, Layout, BarChart3, Archive } from 'lucide-react';

interface ProjectsSidebarProps {
  visibleProjects: Project[];
  selectedProjectId: string | null;
  viewMode: 'LIST' | 'DASHBOARD';
  showArchived: boolean;
  clients: Client[];
  calculateProgress: (pId: string) => number;
  onSelectProject: (project: Project) => void;
  onCreateProject: () => void;
  onViewModeChange: (mode: 'LIST' | 'DASHBOARD') => void;
  onToggleArchived: () => void;
}

export function ProjectsSidebar({
  visibleProjects,
  selectedProjectId,
  viewMode,
  showArchived,
  clients,
  calculateProgress,
  onSelectProject,
  onCreateProject,
  onViewModeChange,
  onToggleArchived,
}: ProjectsSidebarProps) {
  return (
    <>
      <div className="p-4 border-b border-slate-700 flex flex-col gap-3 shrink-0">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-200">Proyectos</h3>
          <Button variant="primary" size="sm" onClick={onCreateProject}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <Tabs
          tabs={[
            { id: 'LIST', label: 'Lista', icon: <Layout className="w-3 h-3" /> },
            { id: 'DASHBOARD', label: 'Dashboard', icon: <BarChart3 className="w-3 h-3" /> },
          ]}
          activeId={viewMode}
          onChange={(id) => onViewModeChange(id as 'LIST' | 'DASHBOARD')}
          className="!p-1 !rounded-lg !bg-slate-900"
        />
        <Button
          variant={showArchived ? 'primary' : 'outline'}
          size="sm"
          className={showArchived ? 'bg-purple-900/30 border-purple-500 text-purple-300 hover:bg-purple-900/50' : ''}
          onClick={onToggleArchived}
          leftIcon={<Archive className="w-3 h-3" />}
        >
          {showArchived ? 'Ocultar Archivados' : 'Ver Archivados'}
        </Button>
      </div>
      {visibleProjects.length === 0 ? (
        <p className="text-center text-slate-500 text-xs py-4 p-2">No hay proyectos.</p>
      ) : (
        <SelectableList<Project>
          items={visibleProjects}
          selectedId={selectedProjectId}
          onSelect={(id) => onSelectProject(visibleProjects.find((p) => p.id === id)!)}
          getItemId={(p) => p.id}
          renderItem={(p) => {
            const progress = calculateProgress(p.id);
            const clientName = clients.find((c) => c.id === p.clientId)?.name || 'Sin Cliente';
            return (
              <>
                <div className="font-bold text-slate-200 text-sm truncate">{p.name}</div>
                <div className="text-xs text-slate-500 mb-2 truncate">{clientName}</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: `${progress}%` }} />
                  </div>
                  <span className="text-xs text-slate-400">{progress}%</span>
                </div>
              </>
            );
          }}
        />
      )}
    </>
  );
}
