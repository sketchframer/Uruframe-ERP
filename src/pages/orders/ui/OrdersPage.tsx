import { useState, useMemo } from 'react';
import type { Job } from '@/shared/types';
import { useJobStore } from '@/entities/job';
import { useProjectStore } from '@/entities/project';
import { useMachineStore } from '@/entities/machine';
import { useUserStore } from '@/entities/user';
import { useForm } from '@/shared/hooks';
import { EmptyState, SelectableList, Button, Input, Select, toast, FullPageSpinner } from '@/shared/ui';
import { Plus, Trash2, ListTodo, Search, X, Pencil } from 'lucide-react';

const EMPTY_JOB = {
  projectId: '', assignedMachineId: '', productName: '', targetQuantity: 0,
  unit: 'units', operatorIds: [] as string[],
};

export function OrdersPage() {
  const jobs = useJobStore((s) => s.jobs);
  const isLoading = useJobStore((s) => s.isLoading);
  const projects = useProjectStore((s) => s.projects);
  const machines = useMachineStore((s) => s.machines);
  const users = useUserStore((s) => s.users);
  const jobStore = useJobStore.getState();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const projectOptions = useMemo(() => projects.map(p => ({ value: p.id, label: p.name })), [projects]);
  const machineOptions = useMemo(() => machines.map(m => ({ value: m.id, label: m.name })), [machines]);
  const operators = useMemo(() => users.filter(u => u.role === 'OPERATOR'), [users]);

  const createForm = useForm({
    initialValues: EMPTY_JOB,
    onSubmit: async (values) => {
      if (!values.projectId || !values.assignedMachineId || !values.productName || !values.targetQuantity) return;
      const selectedMachine = machines.find((m) => m.id === values.assignedMachineId);
      await jobStore.create({
        projectId: values.projectId,
        productName: values.productName,
        targetQuantity: Number(values.targetQuantity),
        completedQuantity: 0,
        unit: values.unit || 'units',
        machineType: selectedMachine?.type ?? 'CONFORMADORA',
        status: 'PENDING',
        priorityIndex: jobs.length + 1,
        assignedMachineId: values.assignedMachineId,
        operatorIds: values.operatorIds ?? [],
        isStock: false,
      });
      toast.success('Orden creada correctamente');
      setIsCreating(false);
      createForm.reset();
    },
  });

  const editForm = useForm({
    initialValues: EMPTY_JOB,
    onSubmit: async (values) => {
      if (!selectedJob || !values.projectId || !values.assignedMachineId || !values.productName || !values.targetQuantity) return;
      const selectedMachine = machines.find((m) => m.id === values.assignedMachineId);
      const updates: Partial<Job> = {
        projectId: values.projectId,
        assignedMachineId: values.assignedMachineId,
        machineType: selectedMachine?.type ?? selectedJob.machineType,
        operatorIds: values.operatorIds ?? [],
        productName: values.productName,
        targetQuantity: Number(values.targetQuantity),
        unit: values.unit ?? 'units',
      };
      await jobStore.update(selectedJob.id, updates);
      const updated = jobStore.getById(selectedJob.id);
      if (updated) setSelectedJob(updated);
      toast.success('Orden actualizada');
      setIsEditingOrder(false);
    },
  });

  const toggleCreateOperator = (opId: string) => {
    const current = createForm.values.operatorIds || [];
    const updated = current.includes(opId) ? current.filter(id => id !== opId) : [...current, opId];
    createForm.setValues({ ...createForm.values, operatorIds: updated });
  };

  const toggleEditOperator = (opId: string) => {
    const current = editForm.values.operatorIds || [];
    const updated = current.includes(opId) ? current.filter(id => id !== opId) : [...current, opId];
    editForm.setValues({ ...editForm.values, operatorIds: updated });
  };

  const startEditingOrder = () => {
    if (!selectedJob) return;
    editForm.setValues({
      projectId: selectedJob.projectId,
      assignedMachineId: selectedJob.assignedMachineId ?? '',
      operatorIds: selectedJob.operatorIds ?? [],
      productName: selectedJob.productName,
      targetQuantity: selectedJob.targetQuantity,
      unit: selectedJob.unit,
    });
    setIsEditingOrder(true);
  };

  const cancelEditOrder = () => {
    setIsEditingOrder(false);
    editForm.reset();
  };

  const filteredJobs = jobs.filter((j) =>
    j.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <FullPageSpinner />;

  return (
    <div className="flex h-full gap-6 animate-fade-in overflow-hidden p-2">
       <div className={`${selectedJob || isCreating ? 'hidden md:flex md:w-1/3 lg:w-1/4' : 'w-full'} flex-col bg-slate-800 rounded-xl border border-slate-700 h-full min-w-0 overflow-hidden`}>
         <SelectableList<Job>
           items={filteredJobs}
           selectedId={selectedJob?.id ?? null}
           onSelect={(id) => {
             const job = jobs.find((j) => j.id === id);
             if (job) {
               setIsCreating(false);
               setIsEditingOrder(false);
               setSelectedJob(job);
             }
           }}
           getItemId={(j) => j.id}
           title={
             <Input
               placeholder="Buscar..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               leftIcon={<Search className="w-4 h-4" />}
               className="mt-4"
             />
           }
           renderItem={(job) => (
             <>
               <div className="font-bold text-white text-sm">{job.productName}</div>
               <div className="text-[10px] text-slate-400 mt-1 uppercase font-black">{job.status} • {job.machineType}</div>
             </>
           )}
           itemClassName="rounded-xl"
         />
       </div>

       <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col h-full relative min-w-0">
            {isCreating ? (
                <div className="flex flex-col h-full p-8 overflow-y-auto">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-8">Nueva Carga de Trabajo</h2>
                    <div className="space-y-6 max-w-2xl">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <Select label="Proyecto" options={projectOptions} placeholder="Seleccione Proyecto..." value={createForm.values.projectId} onChange={(e) => createForm.handleChange('projectId', e.target.value)} />
                            </div>
                            <Select label="Unidad de Planta" options={machineOptions} placeholder="Seleccione Estación..." value={createForm.values.assignedMachineId} onChange={(e) => createForm.handleChange('assignedMachineId', e.target.value)} />
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Operarios Específicos (Opcional)</label>
                                <div className="flex flex-wrap gap-2">
                                    {operators.map(u => (
                                        <Button
                                            key={u.id}
                                            variant={createForm.values.operatorIds?.includes(u.id) ? 'primary' : 'outline'}
                                            size="sm"
                                            onClick={() => toggleCreateOperator(u.id)}
                                        >
                                            {u.name.split(' ')[0]}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Input label="Nombre de la Orden" value={createForm.values.productName} onChange={(e) => createForm.handleChange('productName', e.target.value)} />
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Cantidad" type="number" value={createForm.values.targetQuantity} onChange={(e) => createForm.handleChange('targetQuantity', Number(e.target.value))} />
                                <Input label="Unidad" placeholder="m, kg, u" value={createForm.values.unit} onChange={(e) => createForm.handleChange('unit', e.target.value)} />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="ghost" size="lg" className="flex-1" onClick={() => { setIsCreating(false); setSelectedJob(null); createForm.reset(); }}>
                                Cancelar
                            </Button>
                            <Button variant="primary" size="lg" className="flex-1" onClick={createForm.handleSubmit} isLoading={createForm.isSubmitting}>
                                Crear Orden y Vincular
                            </Button>
                        </div>
                    </div>
                </div>
            ) : selectedJob && isEditingOrder ? (
                <div className="flex flex-col h-full p-8 overflow-y-auto">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-8">Editar Carga de Trabajo</h2>
                    <div className="space-y-6 max-w-2xl">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <Select label="Proyecto" options={projectOptions} placeholder="Seleccione Proyecto..." value={editForm.values.projectId} onChange={(e) => editForm.handleChange('projectId', e.target.value)} />
                            </div>
                            <Select label="Unidad de Planta" options={machineOptions} placeholder="Seleccione Estación..." value={editForm.values.assignedMachineId} onChange={(e) => editForm.handleChange('assignedMachineId', e.target.value)} />
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Operarios Específicos (Opcional)</label>
                                <div className="flex flex-wrap gap-2">
                                    {operators.map((u) => (
                                        <Button
                                            key={u.id}
                                            variant={editForm.values.operatorIds?.includes(u.id) ? 'primary' : 'outline'}
                                            size="sm"
                                            onClick={() => toggleEditOperator(u.id)}
                                        >
                                            {u.name.split(' ')[0]}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <Input label="Nombre de la Orden" value={editForm.values.productName} onChange={(e) => editForm.handleChange('productName', e.target.value)} />
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Cantidad" type="number" value={editForm.values.targetQuantity} onChange={(e) => editForm.handleChange('targetQuantity', Number(e.target.value))} />
                                <Input label="Unidad" placeholder="m, kg, u" value={editForm.values.unit} onChange={(e) => editForm.handleChange('unit', e.target.value)} />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="ghost" size="lg" className="flex-1" onClick={cancelEditOrder}>
                                Cancelar
                            </Button>
                            <Button variant="primary" size="lg" className="flex-1" onClick={editForm.handleSubmit} isLoading={editForm.isSubmitting}>
                                Guardar
                            </Button>
                        </div>
                    </div>
                </div>
            ) : selectedJob ? (
                <div className="p-10 flex flex-col h-full overflow-y-auto">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">{selectedJob.productName}</h1>
                            <div className="flex items-center gap-3">
                                <span className="bg-slate-950 px-3 py-1 rounded-lg text-blue-500 text-[10px] font-black border border-slate-700 uppercase tracking-widest">{selectedJob.status}</span>
                                <span className="text-slate-500 text-xs font-bold">{projects.find(p => p.id === selectedJob.projectId)?.name}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" leftIcon={<X className="w-4 h-4" />} onClick={() => setSelectedJob(null)}>
                                Cerrar
                            </Button>
                            <Button variant="secondary" size="sm" leftIcon={<Pencil className="w-4 h-4" />} onClick={startEditingOrder}>
                                Editar
                            </Button>
                            <Button variant="danger" size="sm" leftIcon={<Trash2 className="w-4 h-4" />} onClick={() => jobStore.delete(selectedJob.id)}>
                                Eliminar
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-10">
                        <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-700">
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Operarios para esta Tarea</h3>
                            <div className="flex flex-wrap gap-3">
                                {selectedJob.operatorIds && selectedJob.operatorIds.length > 0 ? (
                                    selectedJob.operatorIds.map(id => (
                                        <div key={id} className="bg-blue-600/10 border border-blue-500/30 px-4 py-2 rounded-2xl text-blue-400 font-black uppercase text-xs">
                                            {users.find(u => u.id === id)?.name || 'Op. Desconocido'}
                                        </div>
                                    ))
                                ) : (
                                    <span className="text-slate-600 italic text-sm">Usando operarios por defecto de la máquina</span>
                                )}
                            </div>
                        </div>

                        <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-700">
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Métrica de Avance</h3>
                            <div className="flex items-end gap-3 mb-4">
                                <span className="text-5xl font-black text-white leading-none">{selectedJob.completedQuantity}</span>
                                <span className="text-slate-600 font-bold mb-1">/ {selectedJob.targetQuantity} {selectedJob.unit}</span>
                            </div>
                            <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600" style={{ width: `${(selectedJob.completedQuantity / selectedJob.targetQuantity)*100}%` }} />
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <EmptyState
                  icon={<ListTodo />}
                  message="Seleccione Carga"
                  className="h-full"
                />
            )}
       </div>
    </div>
  );
}
