import { useState, useEffect } from 'react';
import type { User, Role } from '@/shared/types';
import { useUserStore } from '@/entities/user';
import { EmptyState, TwoColumnLayout, SelectableList, Button, Input, Select } from '@/shared/ui';
import { UserCircle, Plus, Save, Trash2, KeyRound } from 'lucide-react';

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'SUPERVISOR', label: 'Supervisor' },
  { value: 'OPERATOR', label: 'Operador' },
];

export function UsersPage() {
  const users = useUserStore((s) => s.users);
  const fetchAll = useUserStore((s) => s.fetchAll);
  const create = useUserStore((s) => s.create);
  const update = useUserStore((s) => s.update);
  const deleteUser = useUserStore((s) => s.delete);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({ name: '', role: 'OPERATOR', pin: '' });

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleNew = () => {
    setSelectedUser(null);
    setFormData({ name: '', role: 'OPERATOR', pin: '' });
    setIsEditing(true);
  };

  const handleSelect = (u: User) => {
    setSelectedUser(u);
    setFormData(u);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.pin) return;
    if (selectedUser) {
      await update(selectedUser.id, {
        name: formData.name,
        role: formData.role ?? 'OPERATOR',
        pin: formData.pin,
      });
    } else {
      await create({
        name: formData.name,
        role: (formData.role as Role) ?? 'OPERATOR',
        pin: formData.pin,
      });
    }
    setIsEditing(false);
    setSelectedUser(null);
  };

  const handleDelete = () => {
    if (selectedUser) {
      deleteUser(selectedUser.id);
      setSelectedUser(null);
      setIsEditing(false);
    }
  };

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
                  <Button variant="primary" size="sm" leftIcon={<Save className="w-4 h-4" />} onClick={handleSave}>
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
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <Select
                  label="Rol"
                  options={ROLE_OPTIONS}
                  value={formData.role ?? 'OPERATOR'}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                />
                <div className="col-span-2">
                  <Input
                    label="PIN (4 dígitos)"
                    type="password"
                    value={formData.pin || ''}
                    onChange={(e) => setFormData({ ...formData, pin: e.target.value.slice(0, 4) })}
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
