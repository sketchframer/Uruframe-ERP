import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import type { User } from '@/shared/types';
import { Role } from '@/shared/types';
import { useUserStore } from '@/entities/user';
import { useMachineStore } from '@/entities/machine';
import { useJobStore } from '@/entities/job';
import { validatePinFormat } from '@/features/auth/lib/pinValidation';
import {
  Plus,
  Edit3,
  Trash2,
  X,
  Monitor,
  UserCheck,
  ListTodo,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

export function UsersPage() {
  const users = useUserStore((s) => s.users);
  const currentUser = useUserStore((s) => s.currentUser);
  const userStore = useUserStore.getState();
  const machines = useMachineStore((s) => s.machines);
  const machineStore = useMachineStore.getState();
  const jobs = useJobStore((s) => s.jobs);

  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState<Partial<User>>({
    name: '',
    role: 'OPERATOR',
    pin: '',
  });
  const [pinError, setPinError] = useState<string | null>(null);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [showPin, setShowPin] = useState<Record<string, boolean>>({});

  const handleTogglePin = (userId: string) => {
    setShowPin((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  const handleSaveUser = async () => {
    setPinError(null);
    if (!userFormData.name?.trim()) return;
    if (!userFormData.pin) {
      setPinError('El PIN es obligatorio');
      return;
    }
    if (!validatePinFormat(userFormData.pin)) {
      setPinError('El PIN debe tener 4 dígitos');
      return;
    }
    if (editingUser) {
      await userStore.update(editingUser.id, {
        name: userFormData.name.trim(),
        role: (userFormData.role as Role) ?? 'OPERATOR',
        pin: userFormData.pin,
      });
    } else {
      await userStore.create({
        name: userFormData.name.trim(),
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
    setUserFormData({ name: user.name, role: user.role, pin: user.pin });
    setShowUserForm(true);
  };

  const handleDeleteUser = (id: string) => {
    if (id === currentUser?.id) return;
    if (window.confirm('¿Eliminar este usuario?')) {
      userStore.delete(id);
    }
  };

  const handleAssignMachine = (userId: string, machineId: string) => {
    const machine = machines.find((m) => m.id === machineId);
    if (!machine) return;
    const isAssigned = machine.operatorIds.includes(userId);
    if (isAssigned) {
      machineStore.removeOperator(machineId, userId);
    } else {
      machineStore.assignOperator(machineId, userId);
    }
  };

  const getMachinesForUser = (userId: string) =>
    machines.filter((m) => m.operatorIds.includes(userId));
  const getJobsForUser = (userId: string) =>
    jobs.filter((j) => j.operatorIds?.includes(userId));

  const activeMachines = machines.filter((m) => m.isActive !== false);

  return (
    <div className="h-full flex flex-col gap-4 p-4 sm:p-6 animate-fade-in max-w-4xl mx-auto">
      <header className="flex flex-wrap justify-between items-center gap-4 shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter">
            Gestión de usuarios
          </h1>
          <p className="text-[10px] sm:text-xs text-slate-400 mt-1">
            Administre usuarios, PINs y asigne operarios a estaciones.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingUser(null);
            setUserFormData({ name: '', role: 'OPERATOR', pin: '' });
            setPinError(null);
            setShowUserForm(true);
          }}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg font-black uppercase text-[10px] sm:text-xs flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
        >
          <Plus size={16} /> Nuevo usuario
        </button>
      </header>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {users.map((user) => {
          const machineCount = getMachinesForUser(user.id).length;
          const jobCount = getJobsForUser(user.id).length;
          const isExpanded = expandedUserId === user.id;
          const isCurrentUser = user.id === currentUser?.id;

          return (
            <div
              key={user.id}
              className="bg-slate-900/60 rounded-lg sm:rounded-xl border border-slate-800 overflow-hidden"
            >
              <div className="p-3 sm:p-4 flex flex-wrap items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-slate-700 flex items-center justify-center text-white font-black text-sm uppercase shrink-0">
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-black text-white uppercase text-xs sm:text-sm truncate">
                    {user.name}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-[9px] text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded font-black uppercase">
                      {user.role}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      PIN:{' '}
                      {showPin[user.id] ? user.pin : '••••'}
                      <button
                        type="button"
                        onClick={() => handleTogglePin(user.id)}
                        className="ml-1 text-slate-400 hover:text-slate-300 text-[9px] uppercase"
                      >
                        {showPin[user.id] ? 'Ocultar' : 'Ver'}
                      </button>
                    </span>
                    {machineCount > 0 && (
                      <span className="text-[9px] text-slate-400">
                        {machineCount} máq.
                      </span>
                    )}
                    {jobCount > 0 && (
                      <span className="text-[9px] text-slate-400">
                        {jobCount} órdenes
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setExpandedUserId(isExpanded ? null : user.id)}
                    className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
                    title="Estaciones y órdenes"
                  >
                    {isExpanded ? (
                      <ChevronDown size={18} />
                    ) : (
                      <ChevronRight size={18} />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEditUser(user)}
                    className="p-2 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-slate-800 transition-all"
                    title="Editar"
                  >
                    <Edit3 size={16} />
                  </button>
                  {!isCurrentUser && (
                    <button
                      type="button"
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-2 rounded-lg text-slate-500 hover:text-red-500 hover:bg-slate-800 transition-all"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-slate-800 p-3 sm:p-4 space-y-4 bg-slate-950/40">
                  <div>
                    <h4 className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Monitor size={12} /> Asignar a estaciones
                    </h4>
                    <div className="space-y-1.5">
                      {activeMachines.length === 0 ? (
                        <p className="text-[10px] text-slate-500">
                          No hay máquinas activas.
                        </p>
                      ) : (
                        activeMachines.map((m) => {
                          const isAssigned = m.operatorIds.includes(user.id);
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() =>
                                handleAssignMachine(user.id, m.id)
                              }
                              className={`w-full flex justify-between items-center px-3 py-2 rounded-lg border transition-all text-left text-[10px] sm:text-xs ${
                                isAssigned
                                  ? 'bg-blue-600/10 border-blue-500/50 text-white'
                                  : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                              }`}
                            >
                              <span className="font-bold uppercase">
                                {m.name}
                              </span>
                              <span className="text-[9px] text-slate-500 uppercase">
                                {m.type}
                              </span>
                              {isAssigned ? (
                                <UserCheck size={14} className="shrink-0 text-blue-400" />
                              ) : (
                                <span className="w-4 text-center text-slate-600">+</span>
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {jobCount > 0 && (
                    <div>
                      <h4 className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-2 flex items-center gap-2">
                        <ListTodo size={12} /> En órdenes de producción
                      </h4>
                      <ul className="space-y-1.5">
                        {getJobsForUser(user.id).map((job) => (
                          <li key={job.id}>
                            <Link
                              to="/orders"
                              className="block px-3 py-2 rounded-lg border border-slate-700 bg-slate-800/50 text-[10px] text-slate-300 hover:border-blue-500/50 hover:text-white transition-all"
                            >
                              {job.productName} — {job.status}
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <p className="text-[9px] text-slate-500 mt-1">
                        Editar operadores en{' '}
                        <Link
                          to="/orders"
                          className="text-blue-400 hover:underline"
                        >
                          Producción
                        </Link>
                        .
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showUserForm && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 p-4 sm:p-6 rounded-xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base sm:text-lg font-black text-white uppercase">
                {editingUser ? 'Editar usuario' : 'Crear usuario'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowUserForm(false);
                  setPinError(null);
                }}
                className="p-2 text-slate-500 hover:text-white rounded-lg"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nombre completo"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm"
                value={userFormData.name ?? ''}
                onChange={(e) =>
                  setUserFormData({ ...userFormData, name: e.target.value })
                }
              />
              <select
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm"
                value={userFormData.role ?? 'OPERATOR'}
                onChange={(e) =>
                  setUserFormData({
                    ...userFormData,
                    role: e.target.value as Role,
                  })
                }
              >
                <option value="OPERATOR">Operario</option>
                <option value="SUPERVISOR">Supervisor</option>
                <option value="ADMIN">Administrador</option>
              </select>
              <div>
                <input
                  type="password"
                  inputMode="numeric"
                  placeholder="PIN (4 dígitos)"
                  maxLength={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-center text-lg tracking-[0.5em]"
                  value={userFormData.pin ?? ''}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setUserFormData({ ...userFormData, pin: v });
                    setPinError(null);
                  }}
                />
                {pinError && (
                  <p className="text-[10px] text-red-400 mt-1">{pinError}</p>
                )}
              </div>
              <button
                type="button"
                onClick={handleSaveUser}
                className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-lg text-white font-black uppercase text-xs transition-all active:scale-98"
              >
                {editingUser ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
