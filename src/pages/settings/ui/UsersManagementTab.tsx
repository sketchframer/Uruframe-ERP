import { useState, useCallback } from 'react';
import { Modal, ModalFooter, Button, Input, Select, PageHeader, toast } from '@/shared/ui';
import { useForm } from '@/shared/hooks';
import { Trash2, Plus, Edit3 } from 'lucide-react';
import type { User } from '@/shared/types';
import type { Role } from '@/shared/types';
import { useUserStore } from '@/entities/user';

const ROLE_OPTIONS = [
  { value: 'OPERATOR', label: 'Operario' },
  { value: 'SUPERVISOR', label: 'Supervisor' },
  { value: 'ADMIN', label: 'Administrador' },
];

interface UsersManagementTabProps {
  users: User[];
}

export function UsersManagementTab({ users }: UsersManagementTabProps) {
  const userStore = useUserStore.getState();

  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleCloseUserForm = useCallback(() => setShowUserForm(false), []);

  const userForm = useForm({
    initialValues: { name: '', role: 'OPERATOR' as string, pin: '' },
    onSubmit: async (values) => {
      if (!values.name || !values.pin) return;
      if (editingUser) {
        await userStore.update(editingUser.id, values);
      } else {
        await userStore.create({
          name: values.name,
          role: (values.role as Role) ?? 'OPERATOR',
          pin: values.pin,
        });
      }
      toast.success(editingUser ? 'Usuario actualizado' : 'Usuario creado');
      setEditingUser(null);
      setShowUserForm(false);
      userForm.reset();
    },
  });

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    userForm.setValues({ name: user.name, role: user.role, pin: user.pin });
    setShowUserForm(true);
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm('¿Eliminar este usuario?')) {
      userStore.delete(id);
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Gestión de Personal"
        description="Administre el acceso de operarios y supervisores."
        action={
          <Button
            variant="primary"
            size="lg"
            leftIcon={<Plus size={16} />}
            onClick={() => { setEditingUser(null); userForm.reset(); setShowUserForm(true); }}
          >
            Nuevo Usuario
          </Button>
        }
        className="mb-8"
      />

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
              <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                <Edit3 size={18}/>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user.id)} className="hover:text-red-500">
                <Trash2 size={18}/>
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Usuario */}
      <Modal
        isOpen={showUserForm}
        onClose={handleCloseUserForm}
        title={editingUser ? 'Editar Usuario' : 'Crear Usuario'}
        size="sm"
      >
        <div className="space-y-4">
          <Input label="Nombre Completo" value={userForm.values.name} onChange={e => userForm.handleChange('name', e.target.value)} />
          <Select label="Rol" options={ROLE_OPTIONS} value={userForm.values.role} onChange={e => userForm.handleChange('role', e.target.value)} />
          <Input label="PIN (4 dígitos)" type="password" maxLength={4} value={userForm.values.pin} onChange={e => userForm.handleChange('pin', e.target.value)} className="text-center text-2xl tracking-widest" />
        </div>
        <ModalFooter>
          <Button variant="primary" className="w-full" onClick={userForm.handleSubmit} isLoading={userForm.isSubmitting}>
            {editingUser ? 'Actualizar' : 'Guardar'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
