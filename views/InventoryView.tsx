
import React, { useRef, useState } from 'react';
import { InventoryItem } from '../types';
import { Download, Upload, Plus, Search, AlertCircle, X } from 'lucide-react';

interface InventoryViewProps {
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ inventory, setInventory }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);
  
  // New Item Form State
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    name: '', sku: '', quantity: 0, unit: 'units', minThreshold: 10, location: ''
  });

  // Función para exportar a CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Nombre', 'SKU', 'Cantidad', 'Unidad', 'Mínimo', 'Ubicación'];
    const rows = inventory.map(item => [
      item.id,
      item.name,
      item.sku,
      item.quantity,
      item.unit,
      item.minThreshold,
      item.location
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'inventario_fabrica.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Función para importar CSV (Simulada/Básica)
  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const newItems: InventoryItem[] = [];
      
      lines.slice(1).forEach((line, index) => {
        const cols = line.split(',');
        if (cols.length >= 6) {
          newItems.push({
            id: cols[0] || `INV-${Date.now()}-${index}`,
            name: cols[1] || 'Item Importado',
            sku: cols[2] || 'SKU-???',
            quantity: Number(cols[3]) || 0,
            unit: (cols[4] as any) || 'units',
            minThreshold: Number(cols[5]) || 0,
            location: cols[6] || 'General'
          });
        }
      });

      if (newItems.length > 0) {
        setInventory(prev => [...prev, ...newItems]);
        alert(`Se importaron ${newItems.length} ítems correctamente.`);
      }
    };
    reader.readAsText(file);
  };

  const handleAddNewItem = () => {
    if (!newItem.name || !newItem.sku) return;
    const itemToAdd: InventoryItem = {
      id: `INV-${Date.now()}`,
      name: newItem.name,
      sku: newItem.sku,
      quantity: Number(newItem.quantity) || 0,
      unit: (newItem.unit as any) || 'units',
      minThreshold: Number(newItem.minThreshold) || 0,
      location: newItem.location || 'Depósito General'
    };
    setInventory([...inventory, itemToAdd]);
    setIsAddingItem(false);
    setNewItem({ name: '', sku: '', quantity: 0, unit: 'units', minThreshold: 10, location: '' });
  };

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in h-full flex flex-col relative">
      
      {/* Modal Agregar Item */}
      {isAddingItem && (
        <div className="absolute inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-2">
              <h3 className="text-xl font-bold text-white">Nuevo Material / Insumo</h3>
              <button onClick={() => setIsAddingItem(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="col-span-2">
                 <label className="text-xs text-slate-500 uppercase">Nombre</label>
                 <input type="text" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white"
                   value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} placeholder="Ej: Tornillos Autoperforantes" />
               </div>
               <div>
                 <label className="text-xs text-slate-500 uppercase">SKU / Código</label>
                 <input type="text" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white"
                   value={newItem.sku} onChange={e => setNewItem({...newItem, sku: e.target.value})} placeholder="Ej: TOR-001" />
               </div>
               <div>
                 <label className="text-xs text-slate-500 uppercase">Ubicación</label>
                 <input type="text" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white"
                   value={newItem.location} onChange={e => setNewItem({...newItem, location: e.target.value})} placeholder="Ej: Estante A2" />
               </div>
               <div>
                 <label className="text-xs text-slate-500 uppercase">Cantidad Inicial</label>
                 <input type="number" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white"
                   value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})} />
               </div>
               <div>
                 <label className="text-xs text-slate-500 uppercase">Unidad</label>
                 <select className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white"
                   value={newItem.unit} onChange={e => setNewItem({...newItem, unit: e.target.value as any})}>
                   <option value="units">Unidades</option>
                   <option value="kg">Kilos (kg)</option>
                   <option value="m">Metros (m)</option>
                   <option value="L">Litros (L)</option>
                 </select>
               </div>
               <div>
                 <label className="text-xs text-slate-500 uppercase">Stock Mínimo</label>
                 <input type="number" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white"
                   value={newItem.minThreshold} onChange={e => setNewItem({...newItem, minThreshold: Number(e.target.value)})} />
               </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setIsAddingItem(false)} className="px-4 py-2 text-slate-400 hover:text-white">Cancelar</button>
              <button onClick={handleAddNewItem} className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded font-bold">Guardar Item</button>
            </div>
          </div>
        </div>
      )}

      {/* Header de Acciones */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-800 p-4 rounded-xl border border-slate-700">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Buscar por nombre o SKU..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        
        <div className="flex space-x-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImportCSV} 
            accept=".csv" 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm"
          >
            <Upload className="w-4 h-4 mr-2" /> Importar CSV
          </button>
          <button 
            onClick={handleExportCSV}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors text-sm"
          >
            <Download className="w-4 h-4 mr-2" /> Exportar CSV
          </button>
          <button 
            onClick={() => setIsAddingItem(true)}
            className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors text-sm"
          >
            <Plus className="w-4 h-4 mr-2" /> Nuevo Item
          </button>
        </div>
      </div>

      {/* Tabla Estilo Hoja de Cálculo */}
      <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900 text-slate-400 uppercase sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 font-semibold">SKU</th>
                <th className="px-6 py-4 font-semibold">Nombre del Material</th>
                <th className="px-6 py-4 font-semibold">Ubicación</th>
                <th className="px-6 py-4 font-semibold text-right">Cantidad</th>
                <th className="px-6 py-4 font-semibold text-center">Unidad</th>
                <th className="px-6 py-4 font-semibold text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredInventory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-700/50 transition-colors group cursor-pointer">
                  <td className="px-6 py-4 font-mono text-slate-300 group-hover:text-white">{item.sku}</td>
                  <td className="px-6 py-4 font-medium text-white">{item.name}</td>
                  <td className="px-6 py-4 text-slate-400">{item.location}</td>
                  <td className="px-6 py-4 text-right font-mono text-lg">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 text-center text-slate-400">{item.unit}</td>
                  <td className="px-6 py-4 text-center">
                    {item.quantity <= item.minThreshold ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/50 text-red-400 border border-red-900">
                        <AlertCircle className="w-3 h-3 mr-1" /> Bajo Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-green-400 border border-green-900">
                        OK
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-700 bg-slate-900 text-xs text-slate-500 flex justify-between">
           <span>Mostrando {filteredInventory.length} items</span>
           <span>Presione doble click para editar una celda (Próximamente)</span>
        </div>
      </div>
    </div>
  );
};
