import { useState, useMemo } from 'react';
import type { Job, Machine } from '@/shared/types';
import { useJobStore } from '@/entities/job';
import { INITIAL_CATALOG } from '@/shared/constants';

interface UseProjectWizardParams {
  selectedProjectId: string | null;
  selectedProjectName?: string;
  projectJobsCount: number;
  machines: Machine[];
}

export function useProjectWizard({
  selectedProjectId,
  selectedProjectName,
  projectJobsCount,
  machines,
}: UseProjectWizardParams) {
  const catalog = INITIAL_CATALOG;
  const jobStore = useJobStore.getState();

  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [newJob, setNewJob] = useState<Partial<Job>>({
    productName: '',
    targetQuantity: 0,
    unit: 'units',
    machineType: 'CONFORMADORA',
    status: 'PENDING',
  });
  const [selectedCatalogSku, setSelectedCatalogSku] = useState('');

  const catalogOptions = useMemo(
    () => catalog.map((c) => ({ value: c.sku, label: c.name })),
    [catalog],
  );

  const filteredMachines = useMemo(() => {
    return machines.filter((m) => {
      if (newJob.machineType === 'CONFORMADORA') return m.type === 'CONFORMADORA';
      if (newJob.machineType === 'PANELIZADO' || newJob.machineType === 'PANELES_SIP')
        return m.type === 'PANELIZADO' || m.type === 'PANELES_SIP';
      return m.type === 'HERRERIA' || m.type === 'SOLDADURA' || m.type === 'PINTURA';
    });
  }, [machines, newJob.machineType]);

  const machineAssignOptions = useMemo(
    () => filteredMachines.map((m) => ({ value: m.id, label: `${m.name} (${m.type})` })),
    [filteredMachines],
  );

  const resetWizard = () => {
    setWizardStep(1);
    const defaultName = selectedProjectName || '';
    setNewJob({
      productName: defaultName,
      targetQuantity: 0,
      unit: 'units',
      machineType: 'CONFORMADORA',
      status: 'PENDING',
    });
    setSelectedCatalogSku('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewJob({ ...newJob, fileUrl: file.name, targetQuantity: 1, unit: 'lote' });
    }
  };

  const handleCatalogSelect = (sku: string) => {
    const item = catalog.find((i) => i.sku === sku);
    if (item) {
      setNewJob({ ...newJob, productName: item.name, unit: 'unidades (6m)' });
      setSelectedCatalogSku(item.sku);
    }
  };

  const handleWizardAddJob = async () => {
    if (!newJob.productName || !newJob.targetQuantity || !selectedProjectId) return;

    let stages: { name: string; isCompleted: boolean }[] | undefined;
    if (
      newJob.machineType === 'HERRERIA' ||
      newJob.machineType === 'SOLDADURA' ||
      newJob.machineType === 'PINTURA'
    ) {
      stages = [
        { name: 'CORTE', isCompleted: false },
        { name: 'SOLDADURA', isCompleted: false },
        { name: 'PINTURA', isCompleted: false },
        { name: 'TERMINADO', isCompleted: false },
      ];
    }

    await jobStore.create({
      projectId: selectedProjectId,
      productName: newJob.productName,
      targetQuantity: Number(newJob.targetQuantity),
      completedQuantity: 0,
      unit: newJob.unit || 'units',
      machineType: newJob.machineType as Job['machineType'],
      status: 'PENDING',
      priorityIndex: projectJobsCount + 1,
      assignedMachineId: newJob.assignedMachineId,
      isStock: newJob.isStock,
      tonnage: newJob.tonnage,
      fileUrl: newJob.fileUrl,
      workflowStages: stages,
    });
    resetWizard();
  };

  return {
    wizardStep,
    setWizardStep,
    newJob,
    setNewJob,
    selectedCatalogSku,
    setSelectedCatalogSku,
    catalogOptions,
    filteredMachines,
    machineAssignOptions,
    resetWizard,
    handleFileUpload,
    handleCatalogSelect,
    handleWizardAddJob,
  };
}
