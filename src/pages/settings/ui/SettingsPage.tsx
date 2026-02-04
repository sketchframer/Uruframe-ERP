import { useState, useEffect } from 'react';
import { Settings, Users, Trash2, Plus, UserCheck, Monitor, MessageSquare, Send, X, Cpu, Edit3 } from 'lucide-react';
import type { User, Machine } from '@/shared/types';
import { MachineStatus, Role } from '@/shared/types';
import { useUserStore } from '@/entities/user';
import { useMachineStore } from '@/entities/machine';
import { useMessageStore } from '@/entities/message';

type SettingsTab = 'GENERAL' | 'USERS' | 'MACHINES' | 'WORKFORCE' | 'MESSAGES';

interface SettingsPageProps {
  initialTab?: string;
}

const tabMap: Record<string, SettingsTab> = {
  general: 'GENERAL',
  users: 'USERS',
  machines: 'MACHINES',
  workforce: 'WORKFORCE',
  messages: 'MESSAGES',
};

export function SettingsPage({ initialTab = 'general' }: SettingsPageProps) {
  const users = useUserStore((s) => s.users);
  const machines = useMachineStore((s) => s.machines);
  const userStore = useUserStore.getState();
  const machineStore = useMachineStore.getState();
  const messageStore = useMessageStore.getState();
  
  const tab = tabMap[initialTab?.toLowerCase() ?? 'general'] ?? 'GENERAL';
  const [activeTab, setActiveTab] = useState<SettingsTab>(tab);
  
  // States para Formularios
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState<Partial<User>>({ name: '', role: 'OPERATOR', pin: '' });
  
  const [showMachineForm, setShowMachineForm] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [machineFormData, setMachineFormData] = useState<Partial<Machine>>({ 
      name: '', type: 'CONFORMADORA', category: 'STANDARD', status: MachineStatus.IDLE, efficiency: 100, isActive: true, operatorIds: [] 
  });

  const [msgContent, setMsgContent] = useState('');
  const [msgTo, setMsgTo] = useState('ALL');

  useEffect(() => {
      setActiveTab(tab);
  }, [tab]);

  const handleSaveUser = async () => {
    if (!userFormData.name || !userFormData.pin) return;
    if (editingUser) {
      await userStore.update(editingUser.id, userFormData);
    } else {
      await userStore.create({
        name: userFormData.name,
        role: (userFormData.role as Role) ?? 'OPERATOR',
        pin: userFormData.pin,
      });
    }
    setUserFormData({ name: '', role: 'OPERATOR', pin: '' });
    setEditingUser(null);
    setShowUserForm(false);
  };

  const handleEditUser = (user: User) => {
      setEditingUser(user);
      setUserFormData(user);
      setShowUserForm(true);
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm('¿Eliminar este usuario?')) {
      userStore.delete(id);
    }
  };

  const handleSaveMachine = async () => {
    if (!machineFormData.name) return;
    if (editingMachine) {
      await machineStore.update(editingMachine.id, machineFormData);
    } else {
      await machineStore.create({
        name: machineFormData.name!,
        type: machineFormData.type ?? 'CONFORMADORA',
        category: machineFormData.category ?? 'STANDARD',
        status: MachineStatus.IDLE,
        currentJobId: null,
        totalMetersProduced: 0,
        nextMaintenanceMeters: 10000,
        oee_availability: 100,
        oee_performance: 100,
        oee_quality: 100,
        efficiency: 100,
        isActive: machineFormData.isActive ?? true,
        operatorIds: machineFormData.operatorIds ?? [],
        brand: machineFormData.brand,
      });
    }
    setEditingMachine(null);
    setMachineFormData({ name: '', type: 'CONFORMADORA', category: 'STANDARD', isActive: true, operatorIds: [] });
    setShowMachineForm(false);
  };

  const handleEditMachine = (machine: Machine) => {
      setEditingMachine(machine);
      setMachineFormData(machine);
      setShowMachineForm(true);
  };

  const handleDeleteMachine = (id: string) => {
    if (window.confirm('¿Eliminar esta máquina?')) {
      machineStore.delete(id);
    }
  };

  const handleAssignOperator = (userId: string, machineId: string) => {
    const machine = machines.find((m) => m.id === machineId);
    if (!machine) return;
    const isAssigned = machine.operatorIds.includes(userId);
    if (isAssigned) {
      machineStore.removeOperator(machineId, userId);
    } else {
      machineStore.assignOperator(machineId, userId);
    }
  };

  const handleSend = () => {
    if (!msgContent.trim()) return;
    messageStore.add({ from: 'ADMIN', to: msgTo, content: msgContent.trim(), isRead: false });
    setMsgContent('');
    alert('Comunicado enviado correctamente.');
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-fade-in max-w-6xl mx-auto">
      
      {/* Selector de Pestañas */}
      <div className="flex flex-wrap gap-2 bg-slate-800 p-1.5 rounded-2xl border border-slate-700 w-fit shadow-xl">
        {[
            { id: 'GENERAL' as const, label: 'Sistema', icon: <Settings size={14}/> },
            { id: 'USERS' as const, label: 'Usuarios', icon: <Users size={14}/> },
            { id: 'MACHINES' as const, label: 'Máquinas', icon: <Cpu size={14}/> },
            { id: 'WORKFORCE' as const, label: 'Fuerza de Trabajo', icon: <UserCheck size={14}/> },
            { id: 'MESSAGES' as const, label: 'Mensajería', icon: <MessageSquare size={14}/> },
        ].map((tabItem) => (
             <button 
                key={tabItem.id}
                onClick={() => setActiveTab(tabItem.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${activeTab === tabItem.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
            >
                {tabItem.icon} {tabItem.label}
            </button>
        ))}
      </div>

      <div className="flex-1 bg-slate-800 rounded-[2.5rem] border border-slate-700 p-8 overflow-y-auto shadow-2xl relative">
        
        {/* PESTAÑA: MENSAJERÍA */}
        {activeTab === 'MESSAGES' && (
             <div className="max-w-2xl animate-fade-in">
                <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">Comunicación Interna</h2>
                <p className="text-slate-500 text-sm mb-8">Envíe instrucciones o avisos generales a la planta.</p>
                <div className="bg-slate-900/50 p-8 rounded-[2rem] border border-slate-700 space-y-6">
                    <div>
                        <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-2">Destinatario</label>
                        <select 
                            className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-white font-bold outline-none focus:border-blue-500 transition-all"
                            value={msgTo}
                            onChange={e => setMsgTo(e.target.value)}
                        >
                            <option value="ALL">TODOS (Dashboard Principal)</option>
                            <optgroup label="Usuarios Específicos">
                                {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                            </optgroup>
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-2">Contenido del Mensaje</label>
                        <textarea 
                            className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-5 text-white outline-none focus:border-blue-500 min-h-[150px]"
                            placeholder="Escriba aquí el comunicado..."
                            value={msgContent}
                            onChange={e => setMsgContent(e.target.value)}
                        />
                    </div>
                    <button 
                      onClick={handleSend}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-sm py-5 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                    >
                        <Send size={18} /> Publicar Comunicado
                    </button>
                </div>
             </div>
        )}

        {/* PESTAÑA: USUARIOS */}
        {activeTab === 'USERS' && (
            <div className="animate-fade-in">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Gestión de Personal</h2>
                        <p className="text-slate-500 text-sm">Administre el acceso de operarios y supervisores.</p>
                    </div>
                    <button onClick={() => { setEditingUser(null); setUserFormData({ name: '', role: 'OPERATOR', pin: '' }); setShowUserForm(true); }} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs flex items-center gap-2 shadow-lg shadow-blue-600/20">
                        <Plus size={16}/> Nuevo Usuario
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {users.map(user => (
                        <div key={user.id} className="bg-slate-900/40 p-5 rounded-3xl border border-slate-700 flex justify-between items-center group">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-2xl bg-slate-700 flex items-center justify-center text-white font-black text-xl uppercase">
                                    {user.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-black text-white uppercase text-sm">{user.name}</div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[9px] text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded font-black uppercase">{user.role}</span>
                                        <span className="text-[9px] text-slate-500 font-mono">PIN: {user.pin}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                <button onClick={() => handleEditUser(user)} className="text-slate-500 hover:text-blue-400 p-2">
                                    <Edit3 size={18}/>
                                </button>
                                <button onClick={() => handleDeleteUser(user.id)} className="text-slate-600 hover:text-red-500 p-2">
                                    <Trash2 size={18}/>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Modal Usuario */}
                {showUserForm && (
                    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-slate-800 border border-slate-700 p-8 rounded-[2rem] w-full max-w-md shadow-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-black text-white uppercase">{editingUser ? 'Editar Usuario' : 'Crear Usuario'}</h3>
                                <button onClick={() => setShowUserForm(false)} className="text-slate-500 hover:text-white"><X/></button>
                            </div>
                            <div className="space-y-4">
                                <input type="text" placeholder="Nombre Completo" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white" value={userFormData.name} onChange={e => setUserFormData({...userFormData, name: e.target.value})}/>
                                <select className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white" value={userFormData.role} onChange={e => setUserFormData({...userFormData, role: e.target.value as Role})}>
                                    <option value="OPERATOR">Operario</option>
                                    <option value="SUPERVISOR">Supervisor</option>
                                    <option value="ADMIN">Administrador</option>
                                </select>
                                <input type="password" placeholder="PIN (4 dígitos)" maxLength={4} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white text-center text-2xl tracking-widest" value={userFormData.pin} onChange={e => setUserFormData({...userFormData, pin: e.target.value})}/>
                                <button onClick={handleSaveUser} className="w-full bg-blue-600 py-4 rounded-xl text-white font-black uppercase mt-4">{editingUser ? 'Actualizar' : 'Guardar'}</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* PESTAÑA: MÁQUINAS */}
        {activeTab === 'MACHINES' && (
            <div className="animate-fade-in">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Parque Industrial</h2>
                        <p className="text-slate-500 text-sm">Gestione las unidades de producción de la fábrica.</p>
                    </div>
                    <button onClick={() => { setEditingMachine(null); setMachineFormData({ name: '', type: 'CONFORMADORA', category: 'STANDARD', isActive: true, operatorIds: [] }); setShowMachineForm(true); }} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs flex items-center gap-2 shadow-lg shadow-blue-600/20">
                        <Plus size={16}/> Nueva Máquina
                    </button>
                </div>

                <div className="space-y-3">
                    {machines.map(machine => (
                        <div key={machine.id} className="p-6 rounded-[1.5rem] border bg-slate-900/40 border-slate-700 flex items-center justify-between group">
                            <div className="flex items-center space-x-5">
                                <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-500">
                                    <Monitor size={24}/>
                                </div>
                                <div>
                                    <div className="font-black text-white uppercase text-lg">{machine.name}</div>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-[10px] text-slate-500 font-bold uppercase">{machine.type}</span>
                                        <span className={`w-2 h-2 rounded-full ${machine.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                                        <span className="text-[10px] text-slate-400 uppercase">{machine.brand || 'Marca no especificada'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <div className="text-xs text-slate-500 font-black uppercase">Eficiencia</div>
                                    <div className="text-white font-black">{machine.efficiency}%</div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                    <button onClick={() => handleEditMachine(machine)} className="text-slate-500 hover:text-blue-400 p-2">
                                        <Edit3 size={18}/>
                                    </button>
                                    <button onClick={() => handleDeleteMachine(machine.id)} className="text-slate-600 hover:text-red-500 transition-all p-2">
                                        <Trash2 size={20}/>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Modal Máquina */}
                {showMachineForm && (
                    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-slate-800 border border-slate-700 p-8 rounded-[2rem] w-full max-w-lg shadow-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-black text-white uppercase">{editingMachine ? 'Editar Máquina' : 'Nueva Unidad'}</h3>
                                <button onClick={() => setShowMachineForm(false)} className="text-slate-500 hover:text-white"><X/></button>
                            </div>
                            <div className="space-y-4">
                                <input type="text" placeholder="Nombre (Ej: Conformadora C-200)" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white" value={machineFormData.name} onChange={e => setMachineFormData({...machineFormData, name: e.target.value})}/>
                                <div className="grid grid-cols-2 gap-4">
                                    <select className="bg-slate-900 border border-slate-700 rounded-xl p-4 text-white" value={machineFormData.type} onChange={e => setMachineFormData({...machineFormData, type: e.target.value as Machine['type']})}>
                                        <option value="CONFORMADORA">Conformadora</option>
                                        <option value="HERRERIA">Herrería</option>
                                        <option value="SOLDADURA">Soldadura</option>
                                        <option value="PINTURA">Pintura</option>
                                        <option value="PANELIZADO">Panelizado</option>
                                    </select>
                                    <select className="bg-slate-900 border border-slate-700 rounded-xl p-4 text-white" value={machineFormData.category} onChange={e => setMachineFormData({...machineFormData, category: e.target.value as Machine['category']})}>
                                        <option value="STANDARD">Standard (Perfiles)</option>
                                        <option value="STRUCTURAL">Estructural (Heavy)</option>
                                    </select>
                                </div>
                                <input type="text" placeholder="Marca (Ej: Pinnacle, Cunmac)" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white" value={machineFormData.brand} onChange={e => setMachineFormData({...machineFormData, brand: e.target.value})}/>
                                <button onClick={handleSaveMachine} className="w-full bg-blue-600 py-4 rounded-xl text-white font-black uppercase mt-4">{editingMachine ? 'Actualizar' : 'Registrar Máquina'}</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* PESTAÑA: FUERZA DE TRABAJO */}
        {activeTab === 'WORKFORCE' && (
             <div className="animate-fade-in">
                <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">Fuerza de Trabajo</h2>
                <p className="text-slate-500 text-sm mb-8">Asigne operarios específicos a cada unidad de producción.</p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {machines.filter(m => m.isActive).map(m => (
                        <div key={m.id} className="bg-slate-900/40 border border-slate-700 p-6 rounded-[2rem]">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-2 h-8 bg-blue-600 rounded-full" />
                                <div className="font-black text-white uppercase text-sm tracking-widest">{m.name}</div>
                            </div>
                            <div className="space-y-2">
                                {users.filter(u => u.role === 'OPERATOR').map(u => {
                                    const isAssigned = m.operatorIds.includes(u.id);
                                    return (
                                        <button 
                                            key={u.id}
                                            onClick={() => handleAssignOperator(u.id, m.id)}
                                            className={`w-full flex justify-between items-center p-4 rounded-2xl border transition-all ${isAssigned ? 'bg-blue-600/10 border-blue-600 text-white' : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-500'}`}
                                        >
                                            <span className="font-bold text-xs uppercase">{u.name}</span>
                                            {isAssigned ? <UserCheck size={16}/> : <Plus size={16} className="opacity-20"/>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
             </div>
        )}

        {/* PESTAÑA: SISTEMA */}
        {activeTab === 'GENERAL' && (
             <div className="space-y-6 max-w-2xl animate-fade-in">
                <h2 className="text-3xl font-black text-white mb-6 uppercase tracking-tighter">Estado del Sistema</h2>
                <div className="bg-slate-900/50 p-8 rounded-[2rem] border border-slate-700">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                        <span className="text-white font-black uppercase tracking-widest">Núcleo Structura Activo</span>
                    </div>
                    <div className="space-y-4 text-slate-400 font-mono text-sm">
                        <div className="flex justify-between border-b border-slate-800 pb-2">
                            <span>Versión ERP:</span>
                            <span className="text-blue-400">4.5.5-Stable</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-800 pb-2">
                            <span>Base de Datos:</span>
                            <span className="text-white">Local-Sync-JSON</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Licencia:</span>
                            <span className="text-green-500">PRO - Corporativa</span>
                        </div>
                    </div>
                </div>
             </div>
        )}

      </div>
    </div>
  );
}
