import { useState } from 'react';
import type { Job, Project } from '@/shared/types';
import { useJobStore } from '@/entities/job';
import { useProjectStore } from '@/entities/project';
import { useMachineStore } from '@/entities/machine';
import { useUserStore } from '@/entities/user';
import { EmptyState, SelectableList, Button, Input } from '@/shared/ui';
import { Plus, Trash2, ListTodo, Search, X, Pencil } from 'lucide-react';

export function OrdersPage() {
  const jobs = useJobStore((s) => s.jobs);
  const projects = useProjectStore((s) => s.projects);
  const machines = useMachineStore((s) => s.machines);
  const users = useUserStore((s) => s.users);
  const jobStore = useJobStore.getState();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Job>>({});
  const [searchTerm, setSearchTerm] = useState('');

  const [newJob, setNewJob] = useState<Partial<Job>>({
    productName: '', targetQuantity: 0, unit: 'units', status: 'PENDING', machineType: 'CONFORMADORA', isStock: false, notes: '', requiresPanelizado: false, operatorIds: []
  });

  const handleCreateJob = async () => {
    if (!newJob.projectId || !newJob.assignedMachineId || !newJob.productName || !newJob.targetQuantity) return;
    const selectedMachine = machines.find((m) => m.id === newJob.assignedMachineId);
    await jobStore.create({
      projectId: newJob.projectId,
      productName: newJob.productName!,
      targetQuantity: Number(newJob.targetQuantity),
      completedQuantity: 0,
      unit: newJob.unit || 'units',
      machineType: selectedMachine?.type ?? 'CONFORMADORA',
      status: 'PENDING',
      priorityIndex: jobs.length + 1,
      assignedMachineId: newJob.assignedMachineId,
      operatorIds: newJob.operatorIds ?? [],
      isStock: newJob.isStock,
      fileUrl: newJob.fileUrl,
      notes: newJob.notes,
    });
    setIsCreating(false);
    resetForm();
  };

  const resetForm = () => {
      setNewJob({ productName: '', targetQuantity: 0, unit: 'units', status: 'PENDING', machineType: 'CONFORMADORA', isStock: false, notes: '', operatorIds: [] });
  };

  const toggleOperator = (opId: string) => {
      const current = newJob.operatorIds || [];
      const updated = current.includes(opId) ? current.filter(id => id !== opId) : [...current, opId];
      setNewJob({...newJob, operatorIds: updated});
  };

  const toggleEditOperator = (opId: string) => {
    const current = editFormData.operatorIds ?? [];
    const updated = current.includes(opId) ? current.filter((id) => id !== opId) : [...current, opId];
    setEditFormData({ ...editFormData, operatorIds: updated });
  };

  const startEditingOrder = () => {
    if (!selectedJob) return;
    setEditFormData({
      projectId: selectedJob.projectId,
      assignedMachineId: selectedJob.assignedMachineId,
      operatorIds: selectedJob.operatorIds ?? [],
      productName: selectedJob.productName,
      targetQuantity: selectedJob.targetQuantity,
      unit: selectedJob.unit,
    });
    setIsEditingOrder(true);
  };

  const cancelEditOrder = () => {
    setIsEditingOrder(false);
    setEditFormData({});
  };

  const saveEditOrder = async () => {
    if (!selectedJob || !editFormData.projectId || !editFormData.assignedMachineId || !editFormData.productName || editFormData.targetQuantity == null) return;
    const selectedMachine = machines.find((m) => m.id === editFormData.assignedMachineId);
    const updates: Partial<Job> = {
      projectId: editFormData.projectId,
      assignedMachineId: editFormData.assignedMachineId,
      machineType: selectedMachine?.type ?? selectedJob.machineType,
      operatorIds: editFormData.operatorIds ?? [],
      productName: editFormData.productName,
      targetQuantity: Number(editFormData.targetQuantity),
      unit: editFormData.unit ?? 'units',
    };
    await jobStore.update(selectedJob.id, updates);
    const updated = jobStore.getById(selectedJob.id);
    if (updated) setSelectedJob(updated);
    setIsEditingOrder(false);
    setEditFormData({});
  };

  const filteredJobs = jobs.filter((j) =>
    j.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
             <>
              
               <Input
                 placeholder="Buscar..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 leftIcon={<Search className="w-4 h-4" />}
                 className="mt-4"
               />
               
             </>
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
                                <label className="text-xs text-slate-500 font-black uppercase mb-2 block">Proyecto</label>
                                <select className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-white" value={newJob.projectId} onChange={e => setNewJob({...newJob, projectId: e.target.value})}>
                                    <option value="">Seleccione Proyecto...</option>
                                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 font-black uppercase mb-2 block">Unidad de Planta</label>
                                <select className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-white" value={newJob.assignedMachineId} onChange={e => setNewJob({...newJob, assignedMachineId: e.target.value})}>
                                    <option value="">Seleccione Estación...</option>
                                    {machines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 font-black uppercase mb-2 block">Operarios Específicos (Opcional)</label>
                                <div className="flex flex-wrap gap-2">
                                    {users.filter(u => u.role === 'OPERATOR').map(u => (
                                        <button 
                                            key={u.id} 
                                            onClick={() => toggleOperator(u.id)}
                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border transition-all ${newJob.operatorIds?.includes(u.id) ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-500'}`}
                                        >
                                            {u.name.split(' ')[0]}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <input type="text" className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-white" placeholder="Nombre de la Orden" value={newJob.productName} onChange={e => setNewJob({...newJob, productName: e.target.value})} />
                            <div className="grid grid-cols-2 gap-4">
                                <input type="number" className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-white" placeholder="Cantidad" value={newJob.targetQuantity} onChange={e => setNewJob({...newJob, targetQuantity: Number(e.target.value)})} />
                                <input type="text" className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-white" placeholder="Unidad (m, kg, u)" value={newJob.unit} onChange={e => setNewJob({...newJob, unit: e.target.value})} />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="ghost" size="lg" className="flex-1" onClick={() => { setIsCreating(false); setSelectedJob(null); resetForm(); }}>
                                Cancelar
                            </Button>
                            <Button variant="primary" size="lg" className="flex-1" onClick={handleCreateJob}>
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
                                <label className="text-xs text-slate-500 font-black uppercase mb-2 block">Proyecto</label>
                                <select className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-white" value={editFormData.projectId ?? ''} onChange={(e) => setEditFormData({ ...editFormData, projectId: e.target.value })}>
                                    <option value="">Seleccione Proyecto...</option>
                                    {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 font-black uppercase mb-2 block">Unidad de Planta</label>
                                <select className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-white" value={editFormData.assignedMachineId ?? ''} onChange={(e) => setEditFormData({ ...editFormData, assignedMachineId: e.target.value })}>
                                    <option value="">Seleccione Estación...</option>
                                    {machines.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 font-black uppercase mb-2 block">Operarios Específicos (Opcional)</label>
                                <div className="flex flex-wrap gap-2">
                                    {users.filter((u) => u.role === 'OPERATOR').map((u) => (
                                        <button
                                            key={u.id}
                                            type="button"
                                            onClick={() => toggleEditOperator(u.id)}
                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border transition-all ${editFormData.operatorIds?.includes(u.id) ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-500'}`}
                                        >
                                            {u.name.split(' ')[0]}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <Input placeholder="Nombre de la Orden" value={editFormData.productName ?? ''} onChange={(e) => setEditFormData({ ...editFormData, productName: e.target.value })} />
                            <div className="grid grid-cols-2 gap-4">
                                <Input type="number" placeholder="Cantidad" value={editFormData.targetQuantity ?? ''} onChange={(e) => setEditFormData({ ...editFormData, targetQuantity: Number(e.target.value) })} />
                                <Input placeholder="Unidad (m, kg, u)" value={editFormData.unit ?? ''} onChange={(e) => setEditFormData({ ...editFormData, unit: e.target.value })} />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="ghost" size="lg" className="flex-1" onClick={cancelEditOrder}>
                                Cancelar
                            </Button>
                            <Button variant="primary" size="lg" className="flex-1" onClick={saveEditOrder}>
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
                            <Button variant="ghost" size="sm" leftIcon={<X className="w-4 h-4" />} onClick={() => setSelectedJob(null)} aria-label="Cerrar">
                                Cerrar
                            </Button>
                            <Button variant="secondary" size="sm" leftIcon={<Pencil className="w-4 h-4" />} onClick={startEditingOrder} aria-label="Editar">
                                Editar
                            </Button>
                            <Button variant="danger" size="sm" leftIcon={<Trash2 className="w-4 h-4" />} onClick={() => jobStore.delete(selectedJob.id)} aria-label="Eliminar">
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
