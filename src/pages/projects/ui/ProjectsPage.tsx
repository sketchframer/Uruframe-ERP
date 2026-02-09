import { useState, useMemo, useCallback } from 'react';
import type { Project, Job } from '@/shared/types';
import { useProjectStore } from '@/entities/project';
import { useJobStore } from '@/entities/job';
import { useMachineStore } from '@/entities/machine';
import { useInventoryStore } from '@/entities/inventory';
import { useProjectAccessoryStore } from '@/entities/projectAccessory';
import { useClientStore } from '@/entities/client';
import { Modal, ModalFooter, Button, EmptyState, TwoColumnLayout, FullPageSpinner } from '@/shared/ui';
import { Briefcase, Info } from 'lucide-react';

import { useProjectWizard } from '../model/useProjectWizard';
import { useProjectEditing } from '../model/useProjectEditing';
import { ProjectsSidebar } from './ProjectsSidebar';
import { ProjectsDashboard } from './ProjectsDashboard';
import { ProjectDetailView } from './ProjectDetailView';
import { ProjectHeader } from './ProjectHeader';
import { ManufacturingWizard } from './ManufacturingWizard';
import { AccessoriesSection } from './AccessoriesSection';

export function ProjectsPage() {
  const projects = useProjectStore((s) => s.projects);
  const isLoading = useProjectStore((s) => s.isLoading);
  const jobs = useJobStore((s) => s.jobs);
  const machines = useMachineStore((s) => s.machines);
  const inventory = useInventoryStore((s) => s.inventory);
  const projectAccessories = useProjectAccessoryStore((s) => s.projectAccessories);
  const clients = useClientStore((s) => s.clients);
  const projectStore = useProjectStore.getState();
  const jobStore = useJobStore.getState();
  const projectAccessoryStore = useProjectAccessoryStore.getState();

  const [viewMode, setViewMode] = useState<'LIST' | 'DASHBOARD'>('LIST');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [statusExplanation, setStatusExplanation] = useState<Job | null>(null);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const projectJobs = jobs.filter((j) => j.projectId === selectedProjectId);
  const projectAccs = projectAccessories.filter((a) => a.projectId === selectedProjectId);
  const visibleProjects = projects.filter((p) =>
    showArchived ? p.status === 'ARCHIVED' : p.status !== 'ARCHIVED',
  );

  const clientOptions = useMemo(() => clients.map((c) => ({ value: c.id, label: c.name })), [clients]);
  const inventoryOptions = useMemo(
    () => inventory.map((i) => ({ value: i.id, label: `${i.name} (${i.quantity} ${i.unit} disp.)` })),
    [inventory],
  );

  const { isEditing, setIsEditing, editProjectForm } = useProjectEditing(selectedProjectId);
  const wizard = useProjectWizard({
    selectedProjectId,
    selectedProjectName: selectedProject?.name,
    projectJobsCount: projectJobs.length,
    machines,
  });

  const calculateProgress = useCallback(
    (pId: string) => {
      const pJobs = jobs.filter((j) => j.projectId === pId);
      if (pJobs.length === 0) return 0;
      const total = pJobs.reduce((acc, j) => acc + j.targetQuantity, 0);
      const done = pJobs.reduce((acc, j) => acc + j.completedQuantity, 0);
      return Math.round((done / total) * 100) || 0;
    },
    [jobs],
  );

  const handleSelectProject = (project: Project) => {
    setSelectedProjectId(project.id);
    editProjectForm.setValues({
      name: project.name,
      clientId: project.clientId,
      deadline: project.deadline,
      status: project.status,
      description: project.description || '',
    });
    setIsEditing(false);
    setViewMode('LIST');
    wizard.resetWizard();
  };

  const handleCreateNewProject = async () => {
    const created = await projectStore.create({
      name: 'Nuevo Proyecto',
      clientId: '',
      deadline: new Date().toISOString().split('T')[0],
      status: 'PLANNING',
      description: '',
    });
    handleSelectProject(created);
    setIsEditing(true);
  };

  const handleViewModeChange = (mode: 'LIST' | 'DASHBOARD') => {
    setViewMode(mode);
    if (mode === 'DASHBOARD') setSelectedProjectId(null);
  };

  const handleAddAccessory = async (itemId: string, qty: number) => {
    if (!selectedProjectId) return;
    await projectAccessoryStore.create({
      projectId: selectedProjectId,
      inventoryItemId: itemId,
      quantityRequired: Number(qty),
      quantityAllocated: 0,
      isFulfilled: false,
    });
  };

  const isProjectReadyToDeliver =
    !!selectedProject && projectJobs.length > 0 && projectJobs.every((j) => j.status === 'COMPLETED');

  if (isLoading) return <FullPageSpinner />;

  return (
    <>
      <TwoColumnLayout
        className="h-full animate-fade-in pb-4"
        sidebarClassName="w-full md:w-1/3 lg:w-1/4"
        mainClassName="p-0 overflow-hidden"
        sidebarChildren={
          <ProjectsSidebar
            visibleProjects={visibleProjects}
            selectedProjectId={selectedProjectId}
            viewMode={viewMode}
            showArchived={showArchived}
            clients={clients}
            calculateProgress={calculateProgress}
            onSelectProject={handleSelectProject}
            onCreateProject={handleCreateNewProject}
            onViewModeChange={handleViewModeChange}
            onToggleArchived={() => setShowArchived(!showArchived)}
          />
        }
        mainChildren={
          <div className="flex flex-col h-full overflow-hidden relative">
            {viewMode === 'DASHBOARD' ? (
              <ProjectsDashboard
                projects={projects}
                jobs={jobs}
                clients={clients}
                calculateProgress={calculateProgress}
              />
            ) : !selectedProject ? (
              <EmptyState
                icon={<Briefcase />}
                message="Seleccione un proyecto para ver sus detalles"
                className="h-full"
              />
            ) : (
              <ProjectDetailView
                header={
                  <ProjectHeader
                    selectedProject={selectedProject}
                    isEditing={isEditing}
                    isProjectReadyToDeliver={isProjectReadyToDeliver}
                    editProjectForm={editProjectForm}
                    clientOptions={clientOptions}
                    clients={clients}
                    onEdit={() => setIsEditing(true)}
                    onDeliver={() => projectStore.update(selectedProject.id, { status: 'COMPLETED' })}
                    onArchive={() => projectStore.update(selectedProject.id, { status: 'ARCHIVED' })}
                  />
                }
              >
                <ManufacturingWizard
                  wizardStep={wizard.wizardStep}
                  newJob={wizard.newJob}
                  selectedCatalogSku={wizard.selectedCatalogSku}
                  catalogOptions={wizard.catalogOptions}
                  machineAssignOptions={wizard.machineAssignOptions}
                  filteredMachines={wizard.filteredMachines}
                  selectedProject={selectedProject}
                  projectJobs={projectJobs}
                  machines={machines}
                  onStepChange={wizard.setWizardStep}
                  onNewJobChange={wizard.setNewJob}
                  onCatalogSelect={wizard.handleCatalogSelect}
                  onFileUpload={wizard.handleFileUpload}
                  onAddJob={wizard.handleWizardAddJob}
                  onDeleteJob={(id) => jobStore.delete(id)}
                  onJobClick={(job) => job.status === 'PENDING' && setStatusExplanation(job)}
                />
                <AccessoriesSection
                  projectAccs={projectAccs}
                  inventory={inventory}
                  inventoryOptions={inventoryOptions}
                  onAddAccessory={handleAddAccessory}
                  onDeleteAccessory={(id) => projectAccessoryStore.delete(id)}
                />
              </ProjectDetailView>
            )}
          </div>
        }
      />

      <Modal
        isOpen={!!statusExplanation}
        onClose={() => setStatusExplanation(null)}
        title="Estatus: Pendiente de Inicio"
        size="md"
      >
        {statusExplanation && (
          <>
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-600/20 p-3 rounded-2xl">
                <Info className="text-blue-500" size={32} />
              </div>
              <p className="text-slate-300 font-medium leading-relaxed">
                La orden de trabajo{' '}
                <span className="text-blue-400 font-black">
                  &quot;{statusExplanation.productName}&quot;
                </span>{' '}
                ya está volcada al taller. Ha sido asignada a la unidad{' '}
                <span className="text-white font-bold">
                  {machines.find((m) => m.id === statusExplanation.assignedMachineId)?.name}
                </span>
                .
              </p>
            </div>
            <div className="p-5 bg-slate-900 rounded-[1.5rem] border border-slate-700">
              <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">
                Próximos Pasos del Operario:
              </div>
              <ol className="text-sm text-slate-400 space-y-3 font-bold">
                <li className="flex gap-3">
                  <span className="text-blue-500">1.</span> Iniciar sesión en la terminal del taller.
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-500">2.</span> Cargar la orden desde la cola lateral.
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-500">3.</span> Presionar &quot;INICIAR&quot; para comenzar el
                  conteo.
                </li>
              </ol>
            </div>
            <ModalFooter>
              <Button variant="primary" className="w-full" onClick={() => setStatusExplanation(null)}>
                Entendido
              </Button>
            </ModalFooter>
          </>
        )}
      </Modal>
    </>
  );
}
