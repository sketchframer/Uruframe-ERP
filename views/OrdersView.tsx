
import React, { useState } from 'react';
import { Job, Project, Machine, ProfileCatalogItem, Client, User } from '../types';
import { 
  Search, AlertCircle, CheckCircle, Clock, PlayCircle, 
  Plus, Trash2, PauseCircle, ArrowRight, X, Activity, User as UserIcon, FileText, Hammer, PaintBucket, PenTool, Save, CheckCheck, Upload, File, FolderPlus, Users,
  ListTodo
} from 'lucide-react';

interface OrdersViewProps {
  jobs: Job[];
  projects: Project[];
  machines: Machine[];
  catalog: ProfileCatalogItem[];
  clients: Client[];
  onAddJob: (job: Job) => void;
  onUpdateJob: (job: Job) => void;
  onDeleteJob: (id: string) => void;
  onNavigateToMachine: (machineId: string) => void;
  onAddProject: (project: Project) => void;
  users?: User[]; // Prop añadida para selección de operarios
}

export const OrdersView: React.FC<OrdersViewProps> = ({ 
  jobs, projects, machines, catalog, clients, users = [],
  onAddJob, onUpdateJob, onDeleteJob, onNavigateToMachine, onAddProject
}) => {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false); 
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectData, setNewProjectData] = useState<Partial<Project>>({ name: '', clientId: '', deadline: new Date().toISOString().split('T')[0], status: 'PLANNING' });

  const [newJob, setNewJob] = useState<Partial<Job>>({
    productName: '', targetQuantity: 0, unit: 'units', status: 'PENDING', machineType: 'CONFORMADORA', isStock: false, notes: '', requiresPanelizado: false, operatorIds: []
  });
  const [creationMethod, setCreationMethod] = useState<'MANUAL' | 'FILE' | null>(null);

  const handleCreateJob = () => {
    if (!newJob.projectId || !newJob.assignedMachineId || !newJob.productName || !newJob.targetQuantity) return;
    const selectedMachine = machines.find(m => m.id === newJob.assignedMachineId);
    
    const job: Job = {
        id: `JOB-${Date.now()}`,
        projectId: newJob.projectId,
        productName: newJob.productName!,
        targetQuantity: Number(newJob.targetQuantity),
        completedQuantity: 0,
        unit: newJob.unit || 'units',
        machineType: selectedMachine?.type || 'CONFORMADORA',
        status: 'PENDING',
        priorityIndex: jobs.length + 1,
        assignedMachineId: newJob.assignedMachineId,
        operatorIds: newJob.operatorIds,
        isStock: newJob.isStock,
        fileUrl: newJob.fileUrl,
        notes: newJob.notes
    };
    onAddJob(job);
    setIsCreating(false);
    resetForm();
  };

  const resetForm = () => {
      setNewJob({ productName: '', targetQuantity: 0, unit: 'units', status: 'PENDING', machineType: 'CONFORMADORA', isStock: false, notes: '', operatorIds: [] });
      setCreationMethod(null);
  };

  const toggleOperator = (opId: string) => {
      const current = newJob.operatorIds || [];
      const updated = current.includes(opId) ? current.filter(id => id !== opId) : [...current, opId];
      setNewJob({...newJob, operatorIds: updated});
  };

  return (
    <div className="flex h-full gap-6 animate-fade-in overflow-hidden p-2">
       {/* PANEL IZQUIERDO */}
       <div className={`${selectedJob || isCreating ? 'hidden md:flex md:w-1/3 lg:w-1/4' : 'w-full'} flex-col bg-slate-800 rounded-xl border border-slate-700 h-full`}>
           <div className="p-4 border-b border-slate-700 space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white uppercase tracking-tighter">Órdenes</h2>
                    <button onClick={() => { setSelectedJob(null); setIsCreating(true); resetForm(); }} className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg"><Plus className="w-5 h-5" /></button>
                </div>
                <input type="text" placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm outline-none" />
           </div>
           <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {jobs.filter(j => j.productName.toLowerCase().includes(searchTerm.toLowerCase())).map(job => (
                    <button key={job.id} onClick={() => { setIsCreating(false); setSelectedJob(job); }} className={`w-full text-left p-3 rounded-xl border transition-all ${selectedJob?.id === job.id ? 'bg-blue-900/30 border-blue-500' : 'bg-slate-700/20 border-transparent hover:bg-slate-700/50'}`}>
                        <div className="font-bold text-white text-sm">{job.productName}</div>
                        <div className="text-[10px] text-slate-400 mt-1 uppercase font-black">{job.status} • {job.machineType}</div>
                    </button>
                ))}
           </div>
       </div>

       {/* PANEL DERECHO */}
       <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col h-full relative">
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

                        <button onClick={handleCreateJob} className="w-full bg-blue-600 py-4 rounded-xl text-white font-black uppercase shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all">Crear Orden y Vincular</button>
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
                        <button onClick={() => onDeleteJob(selectedJob.id)} className="bg-red-900/20 text-red-500 p-3 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2/></button>
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
                <div className="h-full flex flex-col items-center justify-center opacity-20">
                    {/* Fixed: Added missing ListTodo icon import and usage */}
                    <ListTodo size={100} className="mb-4" />
                    <p className="font-black uppercase tracking-widest">Seleccione Carga</p>
                </div>
            )}
       </div>
    </div>
  );
};
