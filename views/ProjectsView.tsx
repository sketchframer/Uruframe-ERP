
import React, { useState } from 'react';
import { Project, Job, Machine, InventoryItem, ProjectAccessory, Client, ProfileCatalogItem } from '../types';
/* Added PaintBucket and Info to the imports */
import { 
  Calendar, Clock, Plus, Save, Briefcase, 
  Settings, PenTool, Package, Trash2, CheckSquare, 
  BarChart3, Layout, ChevronRight, Hammer, Activity, Layers, ArrowRight, CheckCircle, Upload, Archive, Eye, X, AlertCircle, PaintBucket, Info
} from 'lucide-react';

interface ProjectsViewProps {
  projects: Project[];
  jobs: Job[];
  machines: Machine[];
  inventory: InventoryItem[];
  projectAccessories: ProjectAccessory[];
  clients: Client[];
  catalog: ProfileCatalogItem[];
  onAddProject: (p: Project) => void;
  onUpdateProject: (p: Project) => void;
  onAddJob: (j: Job) => void;
  onDeleteJob: (jobId: string) => void;
  onAddAccessory: (acc: ProjectAccessory) => void;
  onRemoveAccessory: (accId: string) => void;
  onNavigateToMachine: (machineId: string) => void;
  onDeliverProject?: (projectId: string) => void;
  onArchiveProject?: (projectId: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({ 
  projects, jobs, machines, inventory, projectAccessories, clients, catalog,
  onAddProject, onUpdateProject, onAddJob, onDeleteJob, onAddAccessory, onRemoveAccessory, onNavigateToMachine, onDeliverProject, onArchiveProject
}) => {
  const [viewMode, setViewMode] = useState<'LIST' | 'DASHBOARD'>('LIST');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [statusExplanation, setStatusExplanation] = useState<Job | null>(null);

  // --- WIZARD STATE ---
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [newJob, setNewJob] = useState<Partial<Job>>({
    productName: '', targetQuantity: 0, unit: 'units', machineType: 'CONFORMADORA', status: 'PENDING'
  });
  const [selectedCatalogSku, setSelectedCatalogSku] = useState('');

  const [newAccessory, setNewAccessory] = useState({ itemId: '', qty: 0 });

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const projectJobs = jobs.filter(j => j.projectId === selectedProjectId);
  const projectAccs = projectAccessories.filter(a => a.projectId === selectedProjectId);

  const visibleProjects = projects.filter(p => showArchived ? p.status === 'ARCHIVED' : p.status !== 'ARCHIVED');

  const handleSelectProject = (project: Project) => {
    setSelectedProjectId(project.id);
    setTempProject(project);
    setIsEditing(false);
    setViewMode('LIST');
    resetWizard();
  };

  const resetWizard = () => {
      setWizardStep(1);
      const defaultName = selectedProject ? selectedProject.name : '';
      setNewJob({ productName: defaultName, targetQuantity: 0, unit: 'units', machineType: 'CONFORMADORA', status: 'PENDING' });
      setSelectedCatalogSku('');
  };

  const [tempProject, setTempProject] = useState<Partial<Project>>({});

  const handleCreateNewProject = () => {
    const newId = `PRJ-${Date.now()}`;
    const emptyProject: Project = {
        id: newId,
        name: 'Nuevo Proyecto',
        clientId: '',
        deadline: new Date().toISOString().split('T')[0],
        status: 'PLANNING',
        description: ''
    };
    onAddProject(emptyProject);
    handleSelectProject(emptyProject);
    setIsEditing(true);
  };

  const handleSaveChanges = () => {
    if (selectedProjectId && tempProject.id) {
        onUpdateProject(tempProject as Project);
        setIsEditing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          setNewJob({ 
              ...newJob, 
              fileUrl: file.name, 
              targetQuantity: 1, 
              unit: 'lote' 
          });
      }
  };

  const handleWizardAddJob = () => {
    if (!newJob.productName || !newJob.targetQuantity || !selectedProjectId) return;
    
    let stages = undefined;
    if (newJob.machineType === 'HERRERIA' || newJob.machineType === 'SOLDADURA' || newJob.machineType === 'PINTURA') {
        stages = [
            { name: 'CORTE', isCompleted: false },
            { name: 'SOLDADURA', isCompleted: false },
            { name: 'PINTURA', isCompleted: false },
            { name: 'TERMINADO', isCompleted: false }
        ];
    }

    onAddJob({
        id: `JOB-${Date.now()}`,
        projectId: selectedProjectId,
        productName: newJob.productName,
        targetQuantity: Number(newJob.targetQuantity),
        completedQuantity: 0,
        unit: newJob.unit || 'units',
        machineType: newJob.machineType as any,
        status: 'PENDING',
        priorityIndex: projectJobs.length + 1,
        assignedMachineId: newJob.assignedMachineId,
        isStock: newJob.isStock,
        tonnage: newJob.tonnage,
        fileUrl: newJob.fileUrl,
        workflowStages: stages as any
    });
    resetWizard();
  };

  const handleAddAccessoryToProject = () => {
    if (!newAccessory.itemId || !newAccessory.qty || !selectedProjectId) return;
    
    onAddAccessory({
        id: `ACC-${Date.now()}`,
        projectId: selectedProjectId,
        inventoryItemId: newAccessory.itemId,
        quantityRequired: Number(newAccessory.qty),
        quantityAllocated: 0,
        isFulfilled: false
    });
    setNewAccessory({ itemId: '', qty: 0 });
  };

  const calculateProgress = (pId: string) => {
      const pJobs = jobs.filter(j => j.projectId === pId);
      if (pJobs.length === 0) return 0;
      const total = pJobs.reduce((acc, j) => acc + j.targetQuantity, 0);
      const done = pJobs.reduce((acc, j) => acc + j.completedQuantity, 0);
      return Math.round((done / total) * 100) || 0;
  };

  const getMachineColor = (job: Job) => {
      const m = machines.find(ma => ma.id === job.assignedMachineId);
      return m?.color || '#64748b';
  };

  const renderDashboard = () => {
      const activeProjects = projects.filter(p => p.status === 'IN_PROGRESS').length;
      const delayedProjects = projects.filter(p => p.status === 'DELAYED').length;
      const totalJobs = jobs.length;
      const completedJobs = jobs.filter(j => j.status === 'COMPLETED').length;

      return (
          <div className="p-6 space-y-8 animate-fade-in h-full overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                      <div className="text-slate-400 text-xs uppercase font-bold">Proyectos Activos</div>
                      <div className="text-3xl font-bold text-white mt-1">{activeProjects}</div>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                      <div className="text-slate-400 text-xs uppercase font-bold">Proyectos Atrasados</div>
                      <div className="text-3xl font-bold text-red-400 mt-1">{delayedProjects}</div>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                      <div className="text-slate-400 text-xs uppercase font-bold">Avance Global Órdenes</div>
                      <div className="text-3xl font-bold text-blue-400 mt-1">{Math.round((completedJobs/totalJobs)*100) || 0}%</div>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                       <div className="text-slate-400 text-xs uppercase font-bold">Próxima Entrega</div>
                       <div className="text-xl font-bold text-white mt-2">
                           {projects
                            .filter(p => p.status !== 'COMPLETED' && p.status !== 'ARCHIVED')
                            .sort((a,b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())[0]?.deadline || 'N/A'
                           }
                       </div>
                  </div>
              </div>

              <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700">
                  <h3 className="text-lg font-bold text-white mb-6">Evolución de Proyectos (Gantt)</h3>
                  <div className="space-y-6">
                      {projects.filter(p => p.status !== 'ARCHIVED').map(p => {
                          const progress = calculateProgress(p.id);
                          const clientName = clients.find(c => c.id === p.clientId)?.name || 'N/A';
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
                                              p.status === 'COMPLETED' ? 'bg-green-600' :
                                              p.status === 'DELAYED' ? 'bg-red-600' : 'bg-blue-600'
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
  };
  
  const isProjectReadyToDeliver = selectedProject && projectJobs.length > 0 && projectJobs.every(j => j.status === 'COMPLETED');

  return (
    <div className="h-full flex flex-col md:flex-row gap-6 animate-fade-in pb-4">
      
      {/* Sidebar List */}
      <div className="w-full md:w-1/3 lg:w-1/4 bg-slate-800 rounded-xl border border-slate-700 flex flex-col">
          <div className="p-4 border-b border-slate-700 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-200">Proyectos</h3>
                <button 
                    onClick={handleCreateNewProject}
                    className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex bg-slate-900 rounded-lg p-1">
                  <button 
                    onClick={() => setViewMode('LIST')}
                    className={`flex-1 text-xs py-1.5 rounded flex justify-center items-center ${viewMode === 'LIST' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}
                  >
                      <Layout className="w-3 h-3 mr-1"/> Lista
                  </button>
                  <button 
                    onClick={() => { setViewMode('DASHBOARD'); setSelectedProjectId(null); }}
                    className={`flex-1 text-xs py-1.5 rounded flex justify-center items-center ${viewMode === 'DASHBOARD' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}
                  >
                      <BarChart3 className="w-3 h-3 mr-1"/> Dashboard
                  </button>
              </div>
              <button 
                onClick={() => setShowArchived(!showArchived)}
                className={`text-xs flex items-center justify-center p-2 rounded border ${showArchived ? 'bg-purple-900/30 border-purple-500 text-purple-300' : 'border-slate-700 text-slate-500 hover:text-slate-300'}`}
              >
                  <Archive className="w-3 h-3 mr-2" />
                  {showArchived ? 'Ocultar Archivados' : 'Ver Archivados'}
              </button>
          </div>
          
          <div className="overflow-y-auto flex-1 p-2 space-y-2">
              {visibleProjects.length === 0 && <p className="text-center text-slate-500 text-xs py-4">No hay proyectos.</p>}
              {visibleProjects.map(p => {
                  const progress = calculateProgress(p.id);
                  const clientName = clients.find(c => c.id === p.clientId)?.name || 'Sin Cliente';
                  return (
                    <button 
                        key={p.id}
                        onClick={() => handleSelectProject(p)}
                        className={`w-full text-left p-3 rounded-lg border transition-all ${
                            selectedProjectId === p.id 
                            ? 'bg-blue-900/30 border-blue-500/50' 
                            : 'bg-slate-700/20 border-transparent hover:bg-slate-700/50'
                        }`}
                    >
                        <div className="font-bold text-slate-200 text-sm truncate">{p.name}</div>
                        <div className="text-xs text-slate-500 mb-2 truncate">{clientName}</div>
                        <div className="flex items-center gap-2">
                             <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                 <div className="h-full bg-green-500" style={{ width: `${progress}%` }}></div>
                             </div>
                             <span className="text-xs text-slate-400">{progress}%</span>
                        </div>
                    </button>
                  );
              })}
          </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden relative">
          
          {viewMode === 'DASHBOARD' ? renderDashboard() : (
              !selectedProject ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500">
                    <Briefcase className="w-16 h-16 mb-4 opacity-20" />
                    <p>Seleccione un proyecto para ver sus detalles</p>
                </div>
            ) : (
                <div className="flex flex-col h-full overflow-y-auto">
                    {/* Header Info */}
                    <div className="p-6 border-b border-slate-700 bg-slate-900/30">
                        <div className="flex justify-between items-start mb-4">
                            {isEditing ? (
                                <div className="w-full grid grid-cols-2 gap-4">
                                    <input type="text" className="bg-slate-800 border border-slate-600 p-2 rounded text-white" value={tempProject.name} onChange={e => setTempProject({...tempProject, name: e.target.value})} placeholder="Nombre Proyecto" />
                                    <select 
                                        className="bg-slate-800 border border-slate-600 p-2 rounded text-white" 
                                        value={tempProject.clientId || ''} 
                                        onChange={e => setTempProject({...tempProject, clientId: e.target.value})}
                                    >
                                        <option value="">Seleccionar Cliente</option>
                                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                    <input type="date" className="bg-slate-800 border border-slate-600 p-2 rounded text-white" value={tempProject.deadline} onChange={e => setTempProject({...tempProject, deadline: e.target.value})} />
                                    <select className="bg-slate-800 border border-slate-600 p-2 rounded text-white" value={tempProject.status} onChange={e => setTempProject({...tempProject, status: e.target.value as any})}>
                                        <option value="PLANNING">Planificación</option>
                                        <option value="IN_PROGRESS">En Progreso</option>
                                        <option value="COMPLETED">Completado</option>
                                        <option value="DELAYED">Retrasado</option>
                                        <option value="ARCHIVED">Archivado</option>
                                    </select>
                                    <textarea className="col-span-2 bg-slate-800 border border-slate-600 p-2 rounded text-white" value={tempProject.description} onChange={e => setTempProject({...tempProject, description: e.target.value})} placeholder="Descripción" />
                                </div>
                            ) : (
                                <div>
                                    <h1 className="text-2xl font-bold text-white mb-1 flex items-center">
                                        {selectedProject.name}
                                        {selectedProject.status === 'ARCHIVED' && <span className="ml-3 text-xs bg-purple-900 text-purple-300 px-2 py-0.5 rounded border border-purple-500">ARCHIVADO</span>}
                                    </h1>
                                    <div className="flex items-center text-slate-400 text-sm gap-4">
                                        <span className="flex items-center"><Briefcase className="w-4 h-4 mr-1"/> {clients.find(c => c.id === selectedProject.clientId)?.name || 'Sin Cliente'}</span>
                                        <span className="flex items-center"><Calendar className="w-4 h-4 mr-1"/> Entrega: {selectedProject.deadline}</span>
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase border ${
                                            selectedProject.status === 'IN_PROGRESS' ? 'border-blue-500 text-blue-400' : 
                                            selectedProject.status === 'DELAYED' ? 'border-red-500 text-red-400' : 
                                            selectedProject.status === 'COMPLETED' ? 'border-green-500 text-green-400' : 
                                            'border-slate-500 text-slate-400'
                                        }`}>{selectedProject.status}</span>
                                    </div>
                                    <p className="text-slate-500 mt-2 text-sm max-w-2xl">{selectedProject.description}</p>
                                </div>
                            )}
                            <div className="flex gap-2">
                                {isProjectReadyToDeliver && selectedProject.status !== 'COMPLETED' && selectedProject.status !== 'ARCHIVED' && !isEditing && (
                                    <button 
                                        onClick={() => onDeliverProject && onDeliverProject(selectedProject.id)}
                                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold flex items-center shadow-lg shadow-green-500/20 animate-pulse"
                                    >
                                        <CheckCircle className="w-5 h-5 mr-2" />
                                        ENTREGAR PROYECTO
                                    </button>
                                )}

                                {selectedProject.status === 'COMPLETED' && !isEditing && (
                                    <button 
                                        onClick={() => onArchiveProject && onArchiveProject(selectedProject.id)}
                                        className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-bold flex items-center"
                                    >
                                        <Archive className="w-4 h-4 mr-2" />
                                        ARCHIVAR
                                    </button>
                                )}
                                
                                <button 
                                    onClick={isEditing ? handleSaveChanges : () => setIsEditing(true)}
                                    className={`px-4 py-2 rounded-lg font-bold flex items-center transition-colors ${isEditing ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'}`}
                                >
                                    {isEditing ? <><Save className="w-4 h-4 mr-2" /> Guardar</> : <><PenTool className="w-4 h-4 mr-2" /> Editar</>}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                        
                        {/* WIZARD: Elementos de Fabricación */}
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
                                    {wizardStep > 1 && <button onClick={() => setWizardStep(prev => prev - 1 as any)} className="text-blue-400">Atrás</button>}
                                </h4>

                                {wizardStep === 1 && (
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { type: 'CONFORMADORA', label: 'Conformado', icon: <Settings/> },
                                            { type: 'HERRERIA', label: 'Herrería', icon: <Hammer/> },
                                            { type: 'SOLDADURA', label: 'Soldadura', icon: <Activity/> },
                                            { type: 'PINTURA', label: 'Pintura', icon: <PaintBucket/> },
                                            { type: 'PANELIZADO', label: 'Panelizado', icon: <Layers/> },
                                            { type: 'PANELES_SIP', label: 'Paneles SIP', icon: <Layout/> },
                                        ].map((opt) => (
                                            <button 
                                                key={opt.type}
                                                onClick={() => { 
                                                    setNewJob({...newJob, machineType: opt.type as any}); 
                                                    setWizardStep(2); 
                                                }}
                                                className="bg-slate-800 hover:bg-slate-700 p-4 rounded border border-slate-600 flex flex-col items-center justify-center gap-2"
                                            >
                                                <div className="text-blue-400">{opt.icon}</div>
                                                <span className="text-xs font-bold text-white">{opt.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {wizardStep === 2 && (
                                    newJob.machineType === 'CONFORMADORA' ? (
                                        <div className="grid grid-cols-2 gap-3">
                                            <button 
                                                onClick={() => { setNewJob({...newJob, isStock: true}); setWizardStep(3); }}
                                                className="bg-slate-800 hover:bg-slate-700 p-4 rounded border border-slate-600 text-center"
                                            >
                                                <div className="font-bold text-white mb-1">Perfiles Stock</div>
                                                <div className="text-xs text-slate-400">Medidas Standard (Catálogo)</div>
                                            </button>
                                            <button 
                                                onClick={() => { setNewJob({...newJob, isStock: false}); setWizardStep(3); }}
                                                className="bg-slate-800 hover:bg-slate-700 p-4 rounded border border-slate-600 text-center"
                                            >
                                                <div className="font-bold text-white mb-1">Perfiles a Medida</div>
                                                <div className="text-xs text-slate-400">Lista de Corte (CSV)</div>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <p className="mb-4 text-sm text-slate-400 italic">Configure los detalles manuales para este proceso de taller.</p>
                                            <button onClick={() => setWizardStep(3)} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Continuar</button>
                                        </div>
                                    )
                                )}

                                {wizardStep === 3 && (
                                    <div className="space-y-3">
                                        {newJob.isStock ? (
                                            <div>
                                                <label className="text-[10px] text-slate-500 uppercase">Perfil de Catálogo</label>
                                                <select 
                                                    className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm"
                                                    onChange={(e) => {
                                                        const item = catalog.find(i => i.sku === e.target.value);
                                                        if(item) {
                                                            setNewJob({...newJob, productName: item.name, unit: 'unidades (6m)'});
                                                            setSelectedCatalogSku(item.sku);
                                                        }
                                                    }}
                                                    value={selectedCatalogSku}
                                                >
                                                    <option value="">Seleccione...</option>
                                                    {catalog.map(c => <option key={c.sku} value={c.sku}>{c.name}</option>)}
                                                </select>
                                            </div>
                                        ) : (
                                            <div>
                                                <label className="text-[10px] text-slate-500 uppercase">Nombre del Item / Estructura</label>
                                                <input 
                                                    className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm"
                                                    value={newJob.productName} 
                                                    onChange={e => setNewJob({...newJob, productName: e.target.value})}
                                                    placeholder={selectedProject?.name}
                                                />
                                            </div>
                                        )}
                                        
                                        {!newJob.isStock && (
                                            <div>
                                                <label className="text-[10px] text-slate-500 uppercase flex justify-between">
                                                    <span>Archivo Adjunto / Lista de Corte</span>
                                                    <span className="text-blue-400 text-[9px] cursor-help">Ayuda (?)</span>
                                                </label>
                                                <label className="flex w-full bg-slate-800 border border-slate-600 rounded p-2 cursor-pointer hover:bg-slate-700 flex items-center justify-center gap-2">
                                                    <Upload className="w-4 h-4 text-slate-400"/>
                                                    <span className="text-xs text-white truncate">{newJob.fileUrl || "Seleccionar archivo..."}</span>
                                                    <input type="file" className="hidden" onChange={handleFileUpload} />
                                                </label>
                                            </div>
                                        )}

                                        <div className="flex gap-3">
                                            <div className="flex-1">
                                                <label className="text-[10px] text-slate-500 uppercase">Cantidad</label>
                                                <input 
                                                    type="number" 
                                                    className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm"
                                                    value={newJob.targetQuantity} 
                                                    onChange={e => setNewJob({...newJob, targetQuantity: Number(e.target.value)})}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-[10px] text-slate-500 uppercase">Unidad</label>
                                                <input className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm" value={newJob.unit || 'units'} onChange={e => setNewJob({...newJob, unit: e.target.value})}/>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[10px] text-slate-500 uppercase font-black">Asignar Unidad de Producción</label>
                                            <select 
                                                className="w-full bg-slate-800 border-2 border-blue-500/50 rounded-xl p-3 text-white text-sm font-bold shadow-lg shadow-blue-500/10"
                                                value={newJob.assignedMachineId || ''}
                                                onChange={e => setNewJob({...newJob, assignedMachineId: e.target.value})}
                                            >
                                                <option value="">-- Sin Asignar --</option>
                                                {machines
                                                    .filter(m => {
                                                        // Broaden the filter: Manual processes can go to HERRERIA workshop
                                                        if (newJob.machineType === 'CONFORMADORA') return m.type === 'CONFORMADORA';
                                                        if (newJob.machineType === 'PANELIZADO' || newJob.machineType === 'PANELES_SIP') return m.type === 'PANELIZADO' || m.type === 'PANELES_SIP';
                                                        // Everything else is manual workshop (Herrería, Soldadura, Pintura)
                                                        return m.type === 'HERRERIA' || m.type === 'SOLDADURA' || m.type === 'PINTURA';
                                                    })
                                                    .map(m => (
                                                        <option key={m.id} value={m.id}>{m.name} ({m.type})</option>
                                                    ))
                                                }
                                            </select>
                                            {machines.filter(m => {
                                                if (newJob.machineType === 'CONFORMADORA') return m.type === 'CONFORMADORA';
                                                return m.type === 'HERRERIA' || m.type === 'SOLDADURA' || m.type === 'PINTURA';
                                            }).length === 0 && (
                                                <p className="text-[9px] text-red-400 mt-1 uppercase font-bold tracking-widest animate-pulse">
                                                    Error: No hay estaciones registradas para {newJob.machineType}
                                                </p>
                                            )}
                                        </div>

                                        <button 
                                            onClick={handleWizardAddJob} 
                                            disabled={!newJob.assignedMachineId}
                                            className="w-full bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-black uppercase text-xs py-3 rounded-xl mt-4 shadow-lg transition-all active:scale-95"
                                        >
                                            Confirmar y Agregar a Proyecto
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2 mt-6">
                                {projectJobs.length === 0 && <p className="text-slate-500 text-sm italic py-4 text-center">No hay órdenes de fabricación creadas.</p>}
                                {projectJobs.map(job => (
                                    <button 
                                        key={job.id} 
                                        onClick={() => job.status === 'PENDING' && setStatusExplanation(job)}
                                        className="w-full flex justify-between items-center bg-slate-900 border border-slate-700 p-4 rounded-2xl hover:bg-slate-700/50 group transition-all text-left"
                                        style={{ borderLeft: `6px solid ${getMachineColor(job)}` }}
                                    >
                                        <div>
                                            <div className="font-black text-xs text-white uppercase tracking-tight">{job.productName}</div>
                                            <div className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1 mt-1">
                                                {job.machineType} 
                                                {job.assignedMachineId && <span className="text-slate-400">• {machines.find(m => m.id === job.assignedMachineId)?.name}</span>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border flex items-center gap-1 ${
                                                job.status === 'COMPLETED' ? 'bg-green-600/10 border-green-500 text-green-400' : 
                                                job.status === 'PENDING' ? 'bg-slate-800 border-slate-600 text-slate-400 animate-pulse' :
                                                'bg-blue-600/10 border-blue-500 text-blue-400'
                                            }`}>
                                                {job.status === 'PENDING' && <Clock size={10} />}
                                                {job.status}
                                            </span>
                                            
                                            <button onClick={(e) => { e.stopPropagation(); onDeleteJob(job.id); }} className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Accessories Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-white flex items-center">
                                    <Package className="w-5 h-5 mr-2 text-purple-400" />
                                    Accesorios y Stock
                                </h3>
                            </div>

                            <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700 flex gap-2 items-end">
                                <div className="flex-1">
                                    <label className="text-[10px] text-slate-500 uppercase">Item de Inventario</label>
                                    <select className="w-full bg-slate-800 rounded border border-slate-600 p-1.5 text-xs text-white"
                                        value={newAccessory.itemId} onChange={e => setNewAccessory({...newAccessory, itemId: e.target.value})}>
                                        <option value="">Seleccionar Material...</option>
                                        {inventory.map(item => (
                                            <option key={item.id} value={item.id}>{item.name} ({item.quantity} {item.unit} disp.)</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="w-24">
                                    <label className="text-[10px] text-slate-500 uppercase">Cantidad</label>
                                    <input type="number" className="w-full bg-slate-800 rounded border border-slate-600 p-1.5 text-xs text-white" 
                                        value={newAccessory.qty || ''} onChange={e => setNewAccessory({...newAccessory, qty: parseInt(e.target.value)})} />
                                </div>
                                <button onClick={handleAddAccessoryToProject} className="bg-purple-600 hover:bg-purple-500 text-white p-1.5 rounded h-[30px] w-[30px] flex items-center justify-center">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-2">
                                {projectAccs.length === 0 && <p className="text-slate-500 text-sm italic text-center py-4">No hay accesorios asignados.</p>}
                                {projectAccs.map(acc => {
                                    const item = inventory.find(i => i.id === acc.inventoryItemId);
                                    return (
                                        <div key={acc.id} className="flex justify-between items-center bg-slate-900 border border-slate-700 p-4 rounded-2xl hover:border-slate-500 group">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-slate-800 p-2 rounded-xl text-slate-400">
                                                    <Package className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="font-black text-xs text-white uppercase">{item?.name || 'Item Desconocido'}</div>
                                                    <div className="text-[10px] text-slate-500 font-bold uppercase">Requerido: {acc.quantityRequired} {item?.unit}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {item && item.quantity >= acc.quantityRequired ? (
                                                    <span className="text-green-500 flex items-center text-[10px] font-black uppercase"><CheckSquare size={14} className="mr-1"/> OK</span>
                                                ) : (
                                                    <span className="text-red-500 flex items-center text-[10px] font-black uppercase tracking-widest animate-pulse">Faltante</span>
                                                )}
                                                <button onClick={() => onRemoveAccessory(acc.id)} className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                    </div>
                </div>
            )
          )}
      </div>

      {/* Modal Explicación PENDING */}
      {statusExplanation && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[200] flex items-center justify-center p-4">
              <div className="bg-slate-800 border-2 border-slate-700 p-10 rounded-[3rem] w-full max-w-lg shadow-[0_20px_100px_rgba(0,0,0,0.5)]">
                  <div className="flex justify-between items-center mb-8">
                      <div className="bg-blue-600/20 p-3 rounded-2xl"><Info className="text-blue-500" size={32}/></div>
                      <button onClick={() => setStatusExplanation(null)} className="text-slate-500 hover:text-white"><X size={24}/></button>
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Estatus: Pendiente de Inicio</h3>
                  <div className="space-y-6">
                      <p className="text-slate-300 font-medium leading-relaxed">
                          La orden de trabajo <span className="text-blue-400 font-black">"{statusExplanation.productName}"</span> ya está volcada al taller. 
                          Ha sido asignada a la unidad <span className="text-white font-bold">{machines.find(m => m.id === statusExplanation.assignedMachineId)?.name}</span>.
                      </p>
                      <div className="p-5 bg-slate-900 rounded-[1.5rem] border border-slate-700">
                          <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">Próximos Pasos del Operario:</div>
                          <ol className="text-sm text-slate-400 space-y-3 font-bold">
                              <li className="flex gap-3"><span className="text-blue-500">1.</span> Iniciar sesión en la terminal del taller.</li>
                              <li className="flex gap-3"><span className="text-blue-500">2.</span> Cargar la orden desde la cola lateral.</li>
                              <li className="flex gap-3"><span className="text-blue-500">3.</span> Presionar "INICIAR" para comenzar el conteo.</li>
                          </ol>
                      </div>
                  </div>
                  <button 
                    onClick={() => setStatusExplanation(null)}
                    className="w-full bg-blue-600 py-5 rounded-2xl text-white font-black uppercase text-sm mt-8 shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
                  >
                      Entendido
                  </button>
              </div>
          </div>
      )}

    </div>
  );
};
