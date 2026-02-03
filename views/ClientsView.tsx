
import React, { useState } from 'react';
import { Client, Project } from '../types';
import { Users, Mail, Phone, Plus, Save, Trash2, Building } from 'lucide-react';

interface ClientsViewProps {
  clients: Client[];
  projects: Project[];
  onAddClient: (c: Client) => void;
  onUpdateClient: (c: Client) => void;
  onDeleteClient: (id: string) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({ clients, projects, onAddClient, onUpdateClient, onDeleteClient }) => {
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

  const handleSave = () => {
    if (!formData.name) return;
    
    if (selectedClient) {
      onUpdateClient({ ...selectedClient, ...formData } as Client);
    } else {
      onAddClient({ ...formData, id: `CLI-${Date.now()}` } as Client);
    }
    setIsEditing(false);
    setSelectedClient(null);
  };

  // Get active projects for selected client
  const clientProjects = selectedClient ? projects.filter(p => p.clientId === selectedClient.id) : [];

  return (
    <div className="flex h-full gap-6 animate-fade-in">
      {/* Sidebar List */}
      <div className="w-1/3 bg-slate-800 rounded-xl border border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
          <h3 className="font-bold text-white flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-400"/> Cartera de Clientes
          </h3>
          <button onClick={handleNew} className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-2 space-y-2">
          {clients.map(client => (
            <button
              key={client.id}
              onClick={() => handleSelect(client)}
              className={`w-full text-left p-3 rounded-lg border transition-all ${
                selectedClient?.id === client.id 
                ? 'bg-blue-900/30 border-blue-500' 
                : 'bg-slate-700/20 border-transparent hover:bg-slate-700/50'
              }`}
            >
              <div className="font-bold text-white">{client.name}</div>
              <div className="text-xs text-slate-400">{client.contactPerson}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Detail View */}
      <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 p-8">
        {isEditing || selectedClient ? (
          <div className="space-y-8">
            <div className="flex justify-between items-start border-b border-slate-700 pb-4">
              <h2 className="text-2xl font-bold text-white">
                {isEditing ? (selectedClient ? 'Editar Cliente' : 'Nuevo Cliente') : selectedClient?.name}
              </h2>
              <div className="flex gap-2">
                {isEditing ? (
                   <button onClick={handleSave} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded flex items-center">
                     <Save className="w-4 h-4 mr-2" /> Guardar
                   </button>
                ) : (
                   <>
                     <button onClick={() => setIsEditing(true)} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded">
                        Editar
                     </button>
                     <button onClick={() => onDeleteClient(selectedClient!.id)} className="bg-red-900/50 hover:bg-red-900 text-red-200 px-4 py-2 rounded">
                        <Trash2 className="w-4 h-4" />
                     </button>
                   </>
                )}
              </div>
            </div>

            {isEditing ? (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs text-slate-500 uppercase mb-1">Razón Social / Nombre</label>
                  <input className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" 
                    value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 uppercase mb-1">ID Tributario (CUIT/RUT)</label>
                  <input className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" 
                    value={formData.taxId || ''} onChange={e => setFormData({...formData, taxId: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 uppercase mb-1">Persona de Contacto</label>
                  <input className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" 
                    value={formData.contactPerson || ''} onChange={e => setFormData({...formData, contactPerson: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 uppercase mb-1">Email</label>
                  <input className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" 
                    value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 uppercase mb-1">Teléfono</label>
                  <input className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" 
                    value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                 <div className="col-span-2">
                  <label className="block text-xs text-slate-500 uppercase mb-1">Dirección Física</label>
                  <input className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" 
                    value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} />
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
          <div className="h-full flex flex-col items-center justify-center text-slate-500">
            <Users className="w-16 h-16 mb-4 opacity-20" />
            <p>Seleccione un cliente para ver detalles o gestionar.</p>
          </div>
        )}
      </div>
    </div>
  );
};
