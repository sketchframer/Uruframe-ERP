import { useState } from 'react';
import type { Client } from '@/shared/types';
import { useClientStore } from '@/entities/client';
import { useProjectStore } from '@/entities/project';
import { useForm } from '@/shared/hooks';
import { EmptyState, TwoColumnLayout, SelectableList, Button, Input, toast, FullPageSpinner } from '@/shared/ui';
import { Users, Mail, Phone, Plus, Save, Trash2, Building } from 'lucide-react';

const EMPTY_CLIENT = { name: '', contactPerson: '', email: '', phone: '', taxId: '', address: '' };

export function ClientsPage() {
  const clients = useClientStore((s) => s.clients);
  const isLoading = useClientStore((s) => s.isLoading);
  const projects = useProjectStore((s) => s.projects);
  const clientStore = useClientStore.getState();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const form = useForm({
    initialValues: EMPTY_CLIENT,
    onSubmit: async (values) => {
      if (!values.name) return;
      if (selectedClient) {
        await clientStore.update(selectedClient.id, values);
      } else {
        await clientStore.create(values as Omit<Client, 'id'>);
      }
      toast.success(selectedClient ? 'Cliente actualizado' : 'Cliente creado');
      setIsEditing(false);
      setSelectedClient(null);
    },
  });

  const handleNew = () => {
    setSelectedClient(null);
    form.reset();
    setIsEditing(true);
  };

  const handleSelect = (c: Client) => {
    setSelectedClient(c);
    form.setValues({
      name: c.name,
      contactPerson: c.contactPerson ?? '',
      email: c.email ?? '',
      phone: c.phone ?? '',
      taxId: c.taxId ?? '',
      address: c.address ?? '',
    });
    setIsEditing(false);
  };

  const clientProjects = selectedClient ? projects.filter(p => p.clientId === selectedClient.id) : [];

  if (isLoading) return <FullPageSpinner />;

  return (
    <TwoColumnLayout
      className="animate-fade-in"
      sidebarChildren={
        <SelectableList<Client>
          items={clients}
          selectedId={selectedClient?.id ?? null}
          onSelect={(id) => handleSelect(clients.find((c) => c.id === id)!)}
          getItemId={(c) => c.id}
          title={
            <>
              <Users className="w-5 h-5 mr-2 text-blue-400" /> Cartera de Clientes
            </>
          }
          action={
            <Button variant="primary" size="sm" onClick={handleNew}>
              <Plus className="w-4 h-4" />
            </Button>
          }
          renderItem={(client) => (
            <>
              <div className="font-bold text-white">{client.name}</div>
              <div className="text-xs text-slate-400">{client.contactPerson}</div>
            </>
          )}
        />
      }
      mainChildren={
        isEditing || selectedClient ? (
          <div className="space-y-8">
            <div className="flex justify-between items-start border-b border-slate-700 pb-4">
              <h2 className="text-2xl font-bold text-white">
                {isEditing ? (selectedClient ? 'Editar Cliente' : 'Nuevo Cliente') : selectedClient?.name}
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
                    <Button variant="danger" size="sm" leftIcon={<Trash2 className="w-4 h-4" />} onClick={() => selectedClient && clientStore.delete(selectedClient.id)} />
                  </>
                )}
              </div>
            </div>

            {isEditing ? (
              <div className="grid grid-cols-2 gap-6">
                <Input
                  label="Razón Social / Nombre"
                  value={form.values.name}
                  onChange={(e) => form.handleChange('name', e.target.value)}
                  error={form.errors.name}
                />
                <Input
                  label="ID Tributario (CUIT/RUT)"
                  value={form.values.taxId}
                  onChange={(e) => form.handleChange('taxId', e.target.value)}
                />
                <Input
                  label="Persona de Contacto"
                  value={form.values.contactPerson}
                  onChange={(e) => form.handleChange('contactPerson', e.target.value)}
                />
                <Input
                  label="Email"
                  type="email"
                  value={form.values.email}
                  onChange={(e) => form.handleChange('email', e.target.value)}
                />
                <Input
                  label="Teléfono"
                  value={form.values.phone}
                  onChange={(e) => form.handleChange('phone', e.target.value)}
                />
                <div className="col-span-2">
                  <Input
                    label="Dirección Física"
                    value={form.values.address}
                    onChange={(e) => form.handleChange('address', e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center text-slate-300">
                    <Building className="w-5 h-5 mr-3 text-slate-500" />
                    <span>{selectedClient?.taxId || 'Sin ID Tributario'}</span>
                  </div>
                  <div className="flex items-center text-slate-300">
                    <Users className="w-5 h-5 mr-3 text-slate-500" />
                    <span>{selectedClient?.contactPerson}</span>
                  </div>
                  <div className="flex items-center text-slate-300">
                    <Mail className="w-5 h-5 mr-3 text-slate-500" />
                    <span>{selectedClient?.email}</span>
                  </div>
                  <div className="flex items-center text-slate-300">
                    <Phone className="w-5 h-5 mr-3 text-slate-500" />
                    <span>{selectedClient?.phone}</span>
                  </div>
                </div>

                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                  <h4 className="text-sm font-bold text-slate-400 uppercase mb-3">Proyectos Activos</h4>
                  {clientProjects.length === 0 ? (
                    <p className="text-sm text-slate-500 italic">Este cliente no tiene proyectos asignados.</p>
                  ) : (
                    <ul className="space-y-2">
                      {clientProjects.map(p => (
                        <li key={p.id} className="text-sm text-blue-400 hover:underline cursor-pointer">
                           • {p.name} ({p.status})
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <EmptyState
            icon={<Users />}
            message="Seleccione un cliente para ver detalles o gestionar."
            className="h-full"
          />
        )
      }
    />
  );
}
