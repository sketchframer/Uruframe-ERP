import type { Job, Machine, Project } from '@/shared/types';
import { Button, Input, Select } from '@/shared/ui';
import {
  Clock, Settings, Hammer, Activity, Layers, Layout, Upload, PaintBucket, Trash2,
} from 'lucide-react';

interface ManufacturingWizardProps {
  wizardStep: 1 | 2 | 3;
  newJob: Partial<Job>;
  selectedCatalogSku: string;
  catalogOptions: { value: string; label: string }[];
  machineAssignOptions: { value: string; label: string }[];
  filteredMachines: Machine[];
  selectedProject: Project;
  projectJobs: Job[];
  machines: Machine[];
  onStepChange: (step: 1 | 2 | 3) => void;
  onNewJobChange: (job: Partial<Job>) => void;
  onCatalogSelect: (sku: string) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddJob: () => void;
  onDeleteJob: (id: string) => void;
  onJobClick: (job: Job) => void;
}

export function ManufacturingWizard({
  wizardStep,
  newJob,
  selectedCatalogSku,
  catalogOptions,
  machineAssignOptions,
  filteredMachines,
  selectedProject,
  projectJobs,
  machines,
  onStepChange,
  onNewJobChange,
  onCatalogSelect,
  onFileUpload,
  onAddJob,
  onDeleteJob,
  onJobClick,
}: ManufacturingWizardProps) {
  const getMachineColor = (job: Job) => {
    const m = machines.find((ma) => ma.id === job.assignedMachineId);
    return m?.color || '#64748b';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-white flex items-center">
          <Settings className="w-5 h-5 mr-2 text-orange-400" />
          Elementos de Fabricación
        </h3>
      </div>

      <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
        <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex justify-between">
          <span>Agregar Tarea: Paso {wizardStep} de 3</span>
          {wizardStep > 1 && (
            <button
              onClick={() => onStepChange((wizardStep - 1) as 1 | 2 | 3)}
              className="text-blue-400"
            >
              Atrás
            </button>
          )}
        </h4>

        {wizardStep === 1 && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { type: 'CONFORMADORA', label: 'Conformado', icon: <Settings /> },
              { type: 'HERRERIA', label: 'Herrería', icon: <Hammer /> },
              { type: 'SOLDADURA', label: 'Soldadura', icon: <Activity /> },
              { type: 'PINTURA', label: 'Pintura', icon: <PaintBucket /> },
              { type: 'PANELIZADO', label: 'Panelizado', icon: <Layers /> },
              { type: 'PANELES_SIP', label: 'Paneles SIP', icon: <Layout /> },
            ].map((opt) => (
              <Button
                key={opt.type}
                variant="outline"
                className="flex-col h-auto py-4 gap-2"
                onClick={() => {
                  onNewJobChange({ ...newJob, machineType: opt.type as Job['machineType'] });
                  onStepChange(2);
                }}
              >
                <div className="text-blue-400">{opt.icon}</div>
                <span className="text-xs font-bold text-white normal-case">{opt.label}</span>
              </Button>
            ))}
          </div>
        )}

        {wizardStep === 2 &&
          (newJob.machineType === 'CONFORMADORA' ? (
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="flex-col h-auto py-4"
                onClick={() => {
                  onNewJobChange({ ...newJob, isStock: true });
                  onStepChange(3);
                }}
              >
                <div className="font-bold text-white mb-1 normal-case">Perfiles Stock</div>
                <div className="text-xs text-slate-400 normal-case">Medidas Standard (Catálogo)</div>
              </Button>
              <Button
                variant="outline"
                className="flex-col h-auto py-4"
                onClick={() => {
                  onNewJobChange({ ...newJob, isStock: false });
                  onStepChange(3);
                }}
              >
                <div className="font-bold text-white mb-1 normal-case">Perfiles a Medida</div>
                <div className="text-xs text-slate-400 normal-case">Lista de Corte (CSV)</div>
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <p className="mb-4 text-sm text-slate-400 italic">
                Configure los detalles manuales para este proceso de taller.
              </p>
              <Button variant="primary" onClick={() => onStepChange(3)}>
                Continuar
              </Button>
            </div>
          ))}

        {wizardStep === 3 && (
          <div className="space-y-3">
            {newJob.isStock ? (
              <Select
                label="Perfil de Catálogo"
                options={catalogOptions}
                placeholder="Seleccione..."
                value={selectedCatalogSku}
                onChange={(e) => onCatalogSelect(e.target.value)}
              />
            ) : (
              <Input
                label="Nombre del Item / Estructura"
                value={newJob.productName || ''}
                onChange={(e) => onNewJobChange({ ...newJob, productName: e.target.value })}
                placeholder={selectedProject?.name}
              />
            )}

            {!newJob.isStock && (
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                  Archivo Adjunto / Lista de Corte
                </label>
                <label className="flex w-full bg-slate-800 border-2 border-slate-700 rounded-xl p-3 cursor-pointer hover:bg-slate-700 items-center justify-center gap-2 transition-all">
                  <Upload className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-white truncate">
                    {newJob.fileUrl || 'Seleccionar archivo...'}
                  </span>
                  <input type="file" className="hidden" onChange={onFileUpload} />
                </label>
              </div>
            )}

            <div className="flex gap-3">
              <Input
                label="Cantidad"
                type="number"
                value={newJob.targetQuantity || 0}
                onChange={(e) =>
                  onNewJobChange({ ...newJob, targetQuantity: Number(e.target.value) })
                }
                className="flex-1"
              />
              <Input
                label="Unidad"
                value={newJob.unit || 'units'}
                onChange={(e) => onNewJobChange({ ...newJob, unit: e.target.value })}
                className="flex-1"
              />
            </div>

            <Select
              label="Asignar Unidad de Producción"
              options={machineAssignOptions}
              placeholder="-- Sin Asignar --"
              value={newJob.assignedMachineId || ''}
              onChange={(e) => onNewJobChange({ ...newJob, assignedMachineId: e.target.value })}
            />
            {filteredMachines.length === 0 && (
              <p className="text-[9px] text-red-400 mt-1 uppercase font-bold tracking-widest animate-pulse">
                Error: No hay estaciones registradas para {newJob.machineType}
              </p>
            )}

            <Button
              variant="primary"
              className="w-full bg-green-600 hover:bg-green-500 shadow-green-600/20 mt-4"
              disabled={!newJob.assignedMachineId}
              onClick={onAddJob}
            >
              Confirmar y Agregar a Proyecto
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-2 mt-6">
        {projectJobs.length === 0 && (
          <p className="text-slate-500 text-sm italic py-4 text-center">
            No hay órdenes de fabricación creadas.
          </p>
        )}
        {projectJobs.map((job) => (
          <button
            key={job.id}
            onClick={() => onJobClick(job)}
            className="w-full flex justify-between items-center bg-slate-900 border border-slate-700 p-4 rounded-2xl hover:bg-slate-700/50 group transition-all text-left"
            style={{ borderLeft: `6px solid ${getMachineColor(job)}` }}
          >
            <div>
              <div className="font-black text-xs text-white uppercase tracking-tight">
                {job.productName}
              </div>
              <div className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1 mt-1">
                {job.machineType}
                {job.assignedMachineId && (
                  <span className="text-slate-400">
                    &bull; {machines.find((m) => m.id === job.assignedMachineId)?.name}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span
                className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border flex items-center gap-1 ${
                  job.status === 'COMPLETED'
                    ? 'bg-green-600/10 border-green-500 text-green-400'
                    : job.status === 'PENDING'
                      ? 'bg-slate-800 border-slate-600 text-slate-400 animate-pulse'
                      : 'bg-blue-600/10 border-blue-500 text-blue-400'
                }`}
              >
                {job.status === 'PENDING' && <Clock size={10} />}
                {job.status}
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteJob(job.id);
                }}
                className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
