import { useState, useEffect } from 'react';
import type { User, Role } from '@/shared/types';
import { useUserStore } from '@/entities/user';
import { useForm } from '@/shared/hooks';
import { EmptyState, TwoColumnLayout, SelectableList, Button, Input, Select, toast, FullPageSpinner } from '@/shared/ui';
import { UserCircle, Plus, Save, Trash2, KeyRound } from 'lucide-react';

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'SUPERVISOR', label: 'Supervisor' },
  { value: 'OPERATOR', label: 'Operador' },
];

export function UsersPage() {
  const users = useUserStore((s) => s.users);
  const isLoading = useUserStore((s) => s.isLoading);
  const fetchAll = useUserStore((s) => s.fetchAll);
  const create = useUserStore((s) => s.create);
  const update = useUserStore((s) => s.update);
  const deleteUser = useUserStore((s) => s.delete);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm({
    initialValues: { name: '', role: 'OPERATOR' as string, pin: '' },
    onSubmit: async (values) => {
      if (!values.name || !values.pin) return;
      if (selectedUser) {
        await update(selectedUser.id, {
          name: values.name,
          role: (values.role as Role) ?? 'OPERATOR',
          pin: values.pin,
        });
      } else {
        await create({
          name: values.name,
          role: (values.role as Role) ?? 'OPERATOR',
          pin: values.pin,
        });
      }
      toast.success(selectedUser ? 'Usuario actualizado' : 'Usuario creado');
      setIsEditing(false);
      setSelectedUser(null);
    },
  });

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleNew = () => {
    setSelectedUser(null);
    form.reset();
    setIsEditing(true);
  };

  const handleSelect = (u: User) => {
    setSelectedUser(u);
    form.setValues({ name: u.name, role: u.role, pin: u.pin });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (selectedUser) {
      deleteUser(selectedUser.id);
      setSelectedUser(null);
      setIsEditing(false);
    }
  };

  if (isLoading) return <FullPageSpinner />;

  return (
    <TwoColumnLayout
      className="animate-fade-in"
      sidebarChildren={
        <SelectableList<User>
          items={users}
          selectedId={selectedUser?.id ?? null}
          onSelect={(id) => handleSelect(users.find((u) => u.id === id)!)}
          getItemId={(u) => u.id}
          title={
            <>
              <UserCircle className="w-5 h-5 mr-2 text-blue-400" /> Usuarios
            </>
          }
          action={
            <Button variant="primary" size="sm" onClick={handleNew}>
              <Plus className="w-4 h-4" />
            </Button>
          }
          renderItem={(user) => (
            <>
              <div className="font-bold text-white">{user.name}</div>
              <div className="text-xs text-slate-400">{user.role}</div>
            </>
          )}
        />
      }
      mainChildren={
        isEditing || selectedUser ? (
          <div className="space-y-8">
            <div className="flex justify-between items-start border-b border-slate-700 pb-4">
              <h2 className="text-2xl font-bold text-white">
                {isEditing ? (selectedUser ? 'Editar Usuario' : 'Nuevo Usuario') : selectedUser?.name}
              </h2>
              <div className="flex gap-2">
                {isEditing ? (
                  <Button variant="primary" size="sm" leftIcon={<Save className="w-4 h-4" />} onClick={form.handleSubmit} isLoading={form.isSubmitting}>
                    Guardar
                  </Button>
                ) : (
                  <>
                    <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
                      Editar
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      leftIcon={<Trash2 className="w-4 h-4" />}
                      onClick={handleDelete}
                    />
                  </>
                )}
              </div>
            </div>

            {isEditing ? (
              <div className="grid grid-cols-2 gap-6">
                <Input
                  label="Nombre"
                  value={form.values.name}
                  onChange={(e) => form.handleChange('name', e.target.value)}
                />
                <Select
                  label="Rol"
                  options={ROLE_OPTIONS}
                  value={form.values.role}
                  onChange={(e) => form.handleChange('role', e.target.value)}
                />
                <div className="col-span-2">
                  <Input
                    label="PIN (4 dígitos)"
                    type="password"
                    value={form.values.pin}
                    onChange={(e) => form.handleChange('pin', e.target.value.slice(0, 4))}
                    maxLength={4}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center text-slate-300">
                    <UserCircle className="w-5 h-5 mr-3 text-slate-500" />
                    <span>{selectedUser?.name}</span>
                  </div>
                  <div className="flex items-center text-slate-300">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mr-3">Rol</span>
                    <span className="bg-blue-400/10 text-blue-400 px-2 py-0.5 rounded text-sm font-bold">
                      {selectedUser?.role}
                    </span>
                  </div>
                  <div className="flex items-center text-slate-300">
                    <KeyRound className="w-5 h-5 mr-3 text-slate-500" />
                    <span className="font-mono">PIN: ****</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <EmptyState
            icon={<UserCircle />}
            message="Seleccione un usuario para ver detalles o gestionar."
            className="h-full"
          />
        )
      }
    />
  );
}
