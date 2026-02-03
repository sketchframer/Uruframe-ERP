
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Settings, 
  MonitorPlay, 
  Package, 
  ClipboardList, 
  Factory,
  ListTodo,
  Users,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { DashboardView } from './views/DashboardView';
import { OperatorTerminal } from './views/OperatorTerminal';
import { InventoryView } from './views/InventoryView';
import { ProjectsView } from './views/ProjectsView';
import { OrdersView } from './views/OrdersView';
import { SettingsView } from './views/SettingsView';
import { ClientsView } from './views/ClientsView';
import { LoginView } from './views/LoginView';
import { Machine, Job, Project, FactoryEvent, MachineStatus, EventType, InventoryItem, User, ProjectAccessory, Client, SystemAlert, Role, ProfileCatalogItem, SystemMessage } from './types';

type View = 'DASHBOARD' | 'OPERATOR' | 'PROJECTS' | 'ORDERS' | 'INVENTORY' | 'CLIENTS' | 'SETTINGS';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      isActive 
      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    {icon}
    <span className="font-bold text-sm uppercase tracking-wider">{label}</span>
  </button>
);

const INITIAL_MACHINES: Machine[] = [
  { id: 'M-01', name: 'Conf. China 1', brand: 'China', type: 'CONFORMADORA', category: 'STANDARD', status: MachineStatus.IDLE, efficiency: 92, oee_availability: 95, oee_performance: 97, oee_quality: 99, operatorIds: ['U-002'], currentJobId: null, isActive: true, lastMaintenance: '2023-10-01', color: '#10b981', totalMetersProduced: 12000, nextMaintenanceMeters: 15000 },
  { id: 'M-02', name: 'Conf. Cunmac', brand: 'Cunmac', type: 'CONFORMADORA', category: 'STANDARD', status: MachineStatus.IDLE, efficiency: 0, oee_availability: 0, oee_performance: 0, oee_quality: 0, operatorIds: [], currentJobId: null, isActive: true, lastMaintenance: '2023-09-15', color: '#f59e0b', totalMetersProduced: 8000, nextMaintenanceMeters: 10000 },
  { id: 'M-03', name: 'Conf. Framemac', brand: 'Framemac', type: 'CONFORMADORA', category: 'STANDARD', status: MachineStatus.IDLE, efficiency: 88, oee_availability: 90, oee_performance: 95, oee_quality: 98, operatorIds: ['U-004'], currentJobId: null, isActive: true, lastMaintenance: '2023-10-10', color: '#06b6d4', totalMetersProduced: 15000, nextMaintenanceMeters: 20000 },
  { id: 'M-06', name: 'Taller Herrería', brand: 'Interno', type: 'HERRERIA', status: MachineStatus.IDLE, efficiency: 100, oee_availability: 100, oee_performance: 100, oee_quality: 100, operatorIds: ['U-004'], currentJobId: null, isActive: true, color: '#f97316', totalMetersProduced: 0, nextMaintenanceMeters: 0 },
  { id: 'M-07', name: 'Estación Panelizado', brand: 'Pinnacle', type: 'PANELIZADO', status: MachineStatus.IDLE, efficiency: 100, oee_availability: 100, oee_performance: 100, oee_quality: 100, operatorIds: ['U-003'], currentJobId: null, isActive: true, color: '#8b5cf6', totalMetersProduced: 0, nextMaintenanceMeters: 0 },
  { id: 'M-CARGA', name: 'Unidad de Despacho', brand: 'Logística', type: 'CARGA', status: MachineStatus.IDLE, efficiency: 100, oee_availability: 100, oee_performance: 100, oee_quality: 100, operatorIds: [], currentJobId: null, isActive: true, color: '#3b82f6', totalMetersProduced: 0, nextMaintenanceMeters: 0 },
];

const INITIAL_USERS: User[] = [
  { id: 'U-001', name: 'Admin Principal', role: 'ADMIN', pin: '1234' },
  { id: 'U-002', name: 'Juan Perez', role: 'OPERATOR', pin: '0000' },
  { id: 'U-003', name: 'Maria Gomez', role: 'OPERATOR', pin: '1111' },
  { id: 'U-004', name: 'Carlos Diaz', role: 'OPERATOR', pin: '2222' },
];

const STORAGE_KEY = 'structura_erp_factory_data_v3';

const App = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('DASHBOARD');
  
  const [machines, setMachines] = useState<Machine[]>(INITIAL_MACHINES);
  const [projects, setProjects] = useState<Project[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [messages, setMessages] = useState<SystemMessage[]>([]);
  const [events, setEvents] = useState<FactoryEvent[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projectAccessories, setProjectAccessories] = useState<ProjectAccessory[]>([]);
  const [catalog, setCatalog] = useState<ProfileCatalogItem[]>([
    { sku: 'P-M70', name: 'Perfil Montante 70', description: 'Perfil galvanizado para tabiquería' },
    { sku: 'P-S70', name: 'Perfil Solera 70', description: 'Perfil galvanizado base' }
  ]);
  
  const [selectedMachineForOperator, setSelectedMachineForOperator] = useState<string>('');
  const [settingsTabTarget, setSettingsTabTarget] = useState<{ tab: 'GENERAL' | 'USERS' | 'MACHINES' | 'WORKFORCE' | 'MESSAGES', machineId?: string } | undefined>(undefined);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMachines(parsed.machines || INITIAL_MACHINES);
        setProjects(parsed.projects || []);
        setJobs(parsed.jobs || []);
        setUsers(parsed.users || INITIAL_USERS);
        setAlerts(parsed.alerts || []);
        setMessages(parsed.messages || []);
        setEvents(parsed.events || []);
        setInventory(parsed.inventory || []);
        setClients(parsed.clients || []);
        setProjectAccessories(parsed.projectAccessories || []);
      } catch (e) { console.error(e); }
    }
    setDataLoaded(true);
  }, []);

  useEffect(() => {
    if (dataLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        machines, projects, jobs, users, alerts, messages, events, inventory, clients, projectAccessories
      }));
    }
  }, [machines, projects, jobs, users, alerts, messages, events, inventory, clients, projectAccessories, dataLoaded]);

  // Lógica de Mensajería Logística Automática
  const triggerLogisticsMessages = (project: Project) => {
    const loadingMachine = machines.find(m => m.type === 'CARGA');
    if (!loadingMachine || loadingMachine.operatorIds.length === 0) return;

    const today = new Date().toISOString().split('T')[0];
    if (project.deadline === today) {
        loadingMachine.operatorIds.forEach(opId => {
            // Evitar duplicados revisando si ya existe un mensaje similar hoy
            const alreadyNotified = messages.some(m => 
                m.to === opId && 
                m.content.includes(project.name) && 
                m.timestamp.startsWith(today)
            );

            if (!alreadyNotified) {
                const logisticsMsg: SystemMessage = {
                    id: `LOG-MSG-${Date.now()}-${opId}`,
                    from: 'LOGÍSTICA: CARGA DEL DÍA',
                    to: opId,
                    content: `INSTRUCCIÓN DE CARGA: El proyecto ${project.name} está finalizado y debe despacharse HOY. Repórtate en la zona de carga inmediatamente.`,
                    timestamp: new Date().toISOString(),
                    isRead: false
                };
                setMessages(prev => [...prev, logisticsMsg]);
            }
        });
    }
  };

  const handleJobUpdate = (jobId: string, qty: number, isComplete: boolean, operatorNotes?: string) => {
    const jobToUpdate = jobs.find(j => j.id === jobId);
    if (!jobToUpdate) return;

    const newJobs = jobs.map(j => (j.id === jobId ? { 
      ...j, 
      completedQuantity: qty, 
      status: isComplete ? 'COMPLETED' : 'IN_PROGRESS',
      operatorNotes: operatorNotes || j.operatorNotes,
      completedAt: isComplete ? new Date().toISOString() : undefined
    } as Job : j));

    setJobs(newJobs);

    if (isComplete) {
      const machine = machines.find(m => m.id === jobToUpdate.assignedMachineId);
      
      setEvents(prev => [{
        id: `EV-${Date.now()}`,
        machineId: jobToUpdate.assignedMachineId || 'TALLER',
        type: EventType.JOB_COMPLETE,
        description: `Finalizado: ${jobToUpdate.productName} por ${currentUser?.name}`,
        severity: 'INFO',
        timestamp: new Date().toISOString()
      }, ...prev]);

      // Secuenciación CC -> Panelizado
      if (jobToUpdate.machineType === 'CONFORMADORA') {
          const projectJobs = newJobs.filter(j => j.projectId === jobToUpdate.projectId);
          const allCCFinished = projectJobs.filter(j => j.machineType === 'CONFORMADORA').every(j => j.status === 'COMPLETED');
          if (allCCFinished) {
              const panelizadoMachine = machines.find(m => m.type === 'PANELIZADO');
              if (panelizadoMachine) {
                  const existingPanelJob = projectJobs.find(j => j.machineType === 'PANELIZADO');
                  if (existingPanelJob) {
                      setJobs(prev => prev.map(j => j.id === existingPanelJob.id ? { ...j, status: 'PENDING' } as Job : j));
                  } else {
                      setJobs(prev => [...prev, {
                          id: `JOB-PANEL-${Date.now()}`,
                          projectId: jobToUpdate.projectId,
                          productName: `PANELIZADO: ${projects.find(p => p.id === jobToUpdate.projectId)?.name}`,
                          targetQuantity: 1,
                          completedQuantity: 0,
                          unit: 'proyecto',
                          machineType: 'PANELIZADO',
                          status: 'PENDING',
                          assignedMachineId: panelizadoMachine.id,
                          priorityIndex: 99
                      }]);
                  }
              }
          }
      }

      // Chequeo Proyecto Listo para Carga
      const updatedProjectJobs = newJobs.filter(j => j.projectId === jobToUpdate.projectId);
      const allJobsFinished = updatedProjectJobs.every(j => j.status === 'COMPLETED');
      if (allJobsFinished && updatedProjectJobs.length > 0) {
          const project = projects.find(p => p.id === jobToUpdate.projectId);
          if (project) {
              setAlerts(prev => [{
                  id: `ALERT-READY-${project.id}`,
                  type: 'READY_FOR_DELIVERY',
                  message: `PROYECTO LISTO: ${project.name} está pronto para despacho.`,
                  timestamp: new Date().toISOString(),
                  severity: 'HIGH',
                  relatedId: project.id
              }, ...prev]);
              
              // Disparar mensajería si es para hoy
              triggerLogisticsMessages(project);
          }
      }

      if (machine) {
        setMachines(prev => prev.map(m => m.id === machine.id ? { ...m, status: MachineStatus.IDLE, currentJobId: null } : m));
      }
    }
  };

  const renderContent = () => {
    switch(currentView) {
      case 'DASHBOARD':
        return <DashboardView 
                  machines={machines} events={events} jobs={jobs} projects={projects} alerts={alerts} 
                  messages={messages.filter(m => m.to === 'ALL')} users={users}
                  onNavigateToMachine={navigateToOperator} 
                  onEditMachine={() => { setSettingsTabTarget({ tab: 'MACHINES' }); setCurrentView('SETTINGS'); }} 
                  onAlertClick={handleAlertClick}
                />;
      case 'OPERATOR':
        return <OperatorTerminal 
                  machines={machines} jobs={jobs} projects={projects} users={users} messages={messages} alerts={alerts} 
                  onLogEvent={(m, t, d, s) => setEvents(prev => [{id: `E-${Date.now()}`, machineId: m, type: t, description: d, severity: s, timestamp: new Date().toISOString()}, ...prev])} 
                  onStatusChange={(id, s) => setMachines(prev => prev.map(m => m.id === id ? {...m, status: s} : m))} 
                  onJobUpdate={handleJobUpdate} 
                  onLoadJob={(m, j) => setMachines(prev => prev.map(mac => mac.id === m ? {...mac, currentJobId: j} : mac))} 
                  onLogout={handleLogout} 
                  initialMachineId={selectedMachineForOperator} authenticatedUser={currentUser!} 
                />;
      case 'PROJECTS':
        return <ProjectsView 
                  projects={projects} jobs={jobs} machines={machines} inventory={inventory} projectAccessories={projectAccessories} clients={clients} catalog={catalog} 
                  onAddProject={(p) => setProjects([...projects, p])} onUpdateProject={(p) => setProjects(projects.map(prj => prj.id === p.id ? p : prj))} 
                  onAddJob={(j) => setJobs([...jobs, j])} onDeleteJob={(id) => setJobs(jobs.filter(j => j.id !== id))} 
                  onAddAccessory={(a) => setProjectAccessories([...projectAccessories, a])} onRemoveAccessory={(id) => setProjectAccessories(projectAccessories.filter(a => a.id !== id))} 
                  onNavigateToMachine={navigateToOperator} 
                />;
      case 'ORDERS':
        return <OrdersView 
                  jobs={jobs} projects={projects} machines={machines} catalog={catalog} clients={clients} users={users}
                  onAddJob={(j) => setJobs([...jobs, j])} onUpdateJob={(j) => setJobs(jobs.map(job => job.id === j.id ? j : job))} 
                  onDeleteJob={(id) => setJobs(jobs.filter(j => j.id !== id))} onNavigateToMachine={navigateToOperator} 
                  onAddProject={(p) => setProjects([...projects, p])} 
                />;
      case 'INVENTORY':
        return <InventoryView inventory={inventory} setInventory={setInventory} />;
      case 'CLIENTS':
        return <ClientsView clients={clients} projects={projects} onAddClient={(c) => setClients([...clients, c])} onUpdateClient={(c) => setClients(clients.map(cli => cli.id === c.id ? c : cli))} onDeleteClient={(id) => setClients(clients.filter(c => c.id !== id))} />;
      case 'SETTINGS':
        return <SettingsView users={users} setUsers={setUsers} machines={machines} setMachines={setMachines} onSendMessage={(c, t) => setMessages(prev => [...prev, {id: `M-${Date.now()}`, from: 'ADMIN', to: t, content: c, timestamp: new Date().toISOString(), isRead: false}])} targetSettings={settingsTabTarget} />;
      default:
        return <div className="p-20 text-center font-black uppercase text-slate-500">Módulo en construcción</div>;
    }
  };

  const handleLogout = () => { setCurrentUser(null); setCurrentView('DASHBOARD'); };
  const navigateToOperator = (machineId: string) => { setSelectedMachineForOperator(machineId); setCurrentView('OPERATOR'); };
  const handleAlertClick = (alert: SystemAlert) => {
      if (alert.type === 'READY_FOR_DELIVERY') setCurrentView('CLIENTS');
      else if (alert.relatedId) navigateToOperator(alert.relatedId);
  };

  if (!currentUser) return <LoginView users={users} onLogin={(u) => { setCurrentUser(u); setCurrentView(u.role === 'OPERATOR' ? 'OPERATOR' : 'DASHBOARD'); }} />;

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-200 overflow-hidden">
      {currentUser.role !== 'OPERATOR' && (
        <aside className="w-64 h-full bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg"><Factory className="w-6 h-6 text-white" /></div>
            <span className="font-black tracking-tighter text-xl text-white">STRUCTURA</span>
          </div>
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" isActive={currentView === 'DASHBOARD'} onClick={() => setCurrentView('DASHBOARD')} />
            <NavItem icon={<MonitorPlay size={20} />} label="Terminal" isActive={currentView === 'OPERATOR'} onClick={() => setCurrentView('OPERATOR')} />
            <NavItem icon={<ClipboardList size={20} />} label="Proyectos" isActive={currentView === 'PROJECTS'} onClick={() => setCurrentView('PROJECTS')} />
            <NavItem icon={<ListTodo size={20} />} label="Producción" isActive={currentView === 'ORDERS'} onClick={() => setCurrentView('ORDERS')} />
            <NavItem icon={<Package size={20} />} label="Stock" isActive={currentView === 'INVENTORY'} onClick={() => setCurrentView('INVENTORY')} />
            <NavItem icon={<Users size={20} />} label="Clientes" isActive={currentView === 'CLIENTS'} onClick={() => setCurrentView('CLIENTS')} />
          </nav>
          <div className="p-4 border-t border-slate-800 space-y-2">
            <NavItem icon={<Settings size={20} />} label="Ajustes" isActive={currentView === 'SETTINGS'} onClick={() => setCurrentView('SETTINGS')} />
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-all font-bold text-xs uppercase tracking-widest"><LogOut size={20} /> Salir</button>
          </div>
        </aside>
      )}
      <main className="flex-1 overflow-hidden">{renderContent()}</main>
    </div>
  );
};

export default App;
