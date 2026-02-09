import type { Project, Client } from '@/shared/types';
import { Button, Input, Select, Textarea } from '@/shared/ui';
import { Calendar, Save, Briefcase, PenTool, CheckCircle, Archive } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'PLANNING', label: 'Planificación' },
  { value: 'IN_PROGRESS', label: 'En Progreso' },
  { value: 'COMPLETED', label: 'Completado' },
  { value: 'DELAYED', label: 'Retrasado' },
  { value: 'ARCHIVED', label: 'Archivado' },
];

type EditFormValues = {
  name: string;
  clientId: string;
  deadline: string;
  status: string;
  description: string;
};

interface ProjectHeaderProps {
  selectedProject: Project;
  isEditing: boolean;
  isProjectReadyToDeliver: boolean;
  editProjectForm: {
    values: EditFormValues;
    handleChange: (field: keyof EditFormValues, value: unknown) => void;
    handleSubmit: (e?: React.FormEvent) => Promise<void>;
    isSubmitting: boolean;
  };
  clientOptions: { value: string; label: string }[];
  clients: Client[];
  onEdit: () => void;
  onDeliver: () => void;
  onArchive: () => void;
}

export function ProjectHeader({
  selectedProject,
  isEditing,
  isProjectReadyToDeliver,
  editProjectForm,
  clientOptions,
  clients,
  onEdit,
  onDeliver,
  onArchive,
}: ProjectHeaderProps) {
  return (
    <div className="p-6 border-b border-slate-700 bg-slate-900/30">
      <div className="flex justify-between items-start mb-4">
        {isEditing ? (
          <div className="w-full grid grid-cols-2 gap-4">
            <Input
              label="Nombre Proyecto"
              value={editProjectForm.values.name}
              onChange={(e) => editProjectForm.handleChange('name', e.target.value)}
            />
            <Select
              label="Cliente"
              options={clientOptions}
              placeholder="Seleccionar Cliente"
              value={editProjectForm.values.clientId}
              onChange={(e) => editProjectForm.handleChange('clientId', e.target.value)}
            />
            <Input
              label="Fecha Entrega"
              type="date"
              value={editProjectForm.values.deadline}
              onChange={(e) => editProjectForm.handleChange('deadline', e.target.value)}
            />
            <Select
              label="Estado"
              options={STATUS_OPTIONS}
              value={editProjectForm.values.status}
              onChange={(e) => editProjectForm.handleChange('status', e.target.value)}
            />
            <div className="col-span-2">
              <Textarea
                label="Descripción"
                value={editProjectForm.values.description}
                onChange={(e) => editProjectForm.handleChange('description', e.target.value)}
                placeholder="Descripción"
              />
            </div>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-bold text-white mb-1 flex items-center">
              {selectedProject.name}
              {selectedProject.status === 'ARCHIVED' && (
                <span className="ml-3 text-xs bg-purple-900 text-purple-300 px-2 py-0.5 rounded border border-purple-500">
                  ARCHIVADO
                </span>
              )}
            </h1>
            <div className="flex items-center text-slate-400 text-sm gap-4">
              <span className="flex items-center">
                <Briefcase className="w-4 h-4 mr-1" />{' '}
                {clients.find((c) => c.id === selectedProject.clientId)?.name || 'Sin Cliente'}
              </span>
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" /> Entrega: {selectedProject.deadline}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-xs font-bold uppercase border ${
                  selectedProject.status === 'IN_PROGRESS'
                    ? 'border-blue-500 text-blue-400'
                    : selectedProject.status === 'DELAYED'
                      ? 'border-red-500 text-red-400'
                      : selectedProject.status === 'COMPLETED'
                        ? 'border-green-500 text-green-400'
                        : 'border-slate-500 text-slate-400'
                }`}
              >
                {selectedProject.status}
              </span>
            </div>
            <p className="text-slate-500 mt-2 text-sm max-w-2xl">{selectedProject.description}</p>
          </div>
        )}
        <div className="flex gap-2">
          {isProjectReadyToDeliver &&
            selectedProject.status !== 'COMPLETED' &&
            selectedProject.status !== 'ARCHIVED' &&
            !isEditing && (
              <Button
                variant="primary"
                className="bg-green-500 hover:bg-green-600 shadow-green-500/20 animate-pulse"
                leftIcon={<CheckCircle className="w-5 h-5" />}
                onClick={onDeliver}
              >
                ENTREGAR PROYECTO
              </Button>
            )}

          {selectedProject.status === 'COMPLETED' && !isEditing && (
            <Button
              variant="primary"
              className="bg-purple-600 hover:bg-purple-500"
              leftIcon={<Archive className="w-4 h-4" />}
              onClick={onArchive}
            >
              ARCHIVAR
            </Button>
          )}

          <Button
            variant={isEditing ? 'primary' : 'secondary'}
            className={isEditing ? 'bg-green-600 hover:bg-green-500' : ''}
            leftIcon={isEditing ? <Save className="w-4 h-4" /> : <PenTool className="w-4 h-4" />}
            onClick={isEditing ? editProjectForm.handleSubmit : onEdit}
            isLoading={editProjectForm.isSubmitting}
          >
            {isEditing ? 'Guardar' : 'Editar'}
          </Button>
        </div>
      </div>
    </div>
  );
}
