import { useState } from 'react';
import type { Client } from '@/shared/types';
import { useClientStore } from '@/entities/client';
import { useProjectStore } from '@/entities/project';
import { EmptyState, TwoColumnLayout, SelectableList, Button, Input } from '@/shared/ui';
import { Users, Mail, Phone, Plus, Save, Trash2, Building } from 'lucide-react';

export function ClientsPage() {
  const clients = useClientStore((s) => s.clients);
  const projects = useProjectStore((s) => s.projects);
  const clientStore = useClientStore.getState();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<Partial<Client>>({});

  const handleNew = () => {
    setSelectedClient(null);
    setFormData({ name: '', contactPerson: '', email: '', phone: '', taxId: '' });
    setIsEditing(true);
  };

  const handleSelect = (c: Client) => {
    setSelectedClient(c);
    setFormData(c);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!formData.name) return;
    if (selectedClient) {
      await clientStore.update(selectedClient.id, formData);
    } else {
      await clientStore.create(formData as Omit<Client, 'id'>);
    }
    setIsEditing(false);
    setSelectedClient(null);
  };

  // Get active projects for selected client
  const clientProjects = selectedClient ? projects.filter(p => p.clientId === selectedClient.id) : [];

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
                  <Button variant="primary" size="sm" leftIcon={<Save className="w-4 h-4" />} onClick={handleSave}>
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
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <Input
                  label="ID Tributario (CUIT/RUT)"
                  value={formData.taxId || ''}
                  onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                />
                <Input
                  label="Persona de Contacto"
                  value={formData.contactPerson || ''}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <Input
                  label="Teléfono"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <div className="col-span-2">
                  <Input
                    label="Dirección Física"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
