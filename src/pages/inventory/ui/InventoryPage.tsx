import { useRef, useState, type ChangeEvent } from 'react';
import type { InventoryItem } from '@/shared/types';
import { useInventoryStore } from '@/entities/inventory';
import { useForm } from '@/shared/hooks';
import { getErrorMessage } from '@/shared/api';
import { Modal, ModalFooter, Button, Input, Select, toast, FullPageSpinner } from '@/shared/ui';
import { Download, Upload, Plus, Search, AlertCircle, Save, Trash2 } from 'lucide-react';

const UNIT_OPTIONS = [
  { value: 'units', label: 'Unidades' },
  { value: 'kg', label: 'Kilos (kg)' },
  { value: 'm', label: 'Metros (m)' },
  { value: 'L', label: 'Litros (L)' },
];

const EMPTY_ITEM = { name: '', sku: '', quantity: 0, unit: 'units', minThreshold: 10, location: '' };

export function InventoryPage() {
  const inventory = useInventoryStore((s) => s.inventory);
  const isLoading = useInventoryStore((s) => s.isLoading);
  const inventoryStore = useInventoryStore.getState();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const addForm = useForm({
    initialValues: EMPTY_ITEM,
    onSubmit: async (values) => {
      try {
        await inventoryStore.create({
          name: values.name,
          sku: values.sku,
          quantity: Number(values.quantity) || 0,
          unit: (values.unit as InventoryItem['unit']) || 'units',
          minThreshold: Number(values.minThreshold) || 0,
          location: values.location || 'Depósito General',
        });
        toast.success('Item creado correctamente');
        setIsAddingItem(false);
        addForm.reset();
      } catch (error) {
        const msg = getErrorMessage(error);
        toast.error(msg);
        throw new Error(msg);
      }
    },
  });

  const editForm = useForm({
    initialValues: EMPTY_ITEM,
    onSubmit: async (values) => {
      if (!editingItem) return;
      try {
        await inventoryStore.update(editingItem.id, {
          name: values.name,
          sku: values.sku,
          quantity: Number(values.quantity) || 0,
          unit: (values.unit as InventoryItem['unit']) || 'units',
          minThreshold: Number(values.minThreshold) || 0,
          location: values.location || 'Depósito General',
        });
        toast.success('Cambios guardados');
        handleCloseEditModal();
      } catch (error) {
        const msg = getErrorMessage(error);
        toast.error(msg);
        throw new Error(msg);
      }
    },
  });

  const handleExportCSV = () => {
    const headers = ['ID', 'Nombre', 'SKU', 'Cantidad', 'Unidad', 'Mínimo', 'Ubicación'];
    const rows = inventory.map(item => [
      item.id, item.name, item.sku, item.quantity, item.unit, item.minThreshold, item.location,
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'inventario_fabrica.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const newItems: Omit<InventoryItem, 'id'>[] = [];
      lines.slice(1).forEach((line) => {
        const cols = line.split(',');
        if (cols.length >= 6) {
          newItems.push({
            name: cols[1] || 'Item Importado',
            sku: cols[2] || 'SKU-???',
            quantity: Number(cols[3]) || 0,
            unit: (cols[4] as InventoryItem['unit']) || 'units',
            minThreshold: Number(cols[5]) || 0,
            location: cols[6] || 'General',
          });
        }
      });
      if (newItems.length > 0) {
        for (const item of newItems) {
          await inventoryStore.create(item);
        }
        alert(`Se importaron ${newItems.length} ítems correctamente.`);
      }
    };
    reader.readAsText(file);
  };

  const handleOpenEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    editForm.setValues({
      name: item.name,
      sku: item.sku,
      quantity: item.quantity,
      unit: item.unit,
      minThreshold: item.minThreshold,
      location: item.location,
    });
  };

  const handleCloseEditModal = () => {
    setEditingItem(null);
    editForm.reset();
  };

  const handleDeleteItem = async () => {
    if (!editingItem) return;
    if (!window.confirm('¿Eliminar este item del inventario?')) return;
    try {
      await inventoryStore.delete(editingItem.id);
      toast.success('Item eliminado');
      handleCloseEditModal();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <FullPageSpinner />;

  return (
    <div className="space-y-6 animate-fade-in h-full flex flex-col relative">

      {/* Modal Agregar Item */}
      <Modal
        isOpen={isAddingItem}
        onClose={() => { setIsAddingItem(false); addForm.reset(); }}
        title="Nuevo Material / Insumo"
        size="lg"
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Input label="Nombre" value={addForm.values.name} onChange={(e) => addForm.handleChange('name', e.target.value)} placeholder="Ej: Tornillos Autoperforantes" />
          </div>
          <Input label="SKU / Código" value={addForm.values.sku} onChange={(e) => addForm.handleChange('sku', e.target.value)} placeholder="Ej: TOR-001" />
          <Input label="Ubicación" value={addForm.values.location} onChange={(e) => addForm.handleChange('location', e.target.value)} placeholder="Ej: Estante A2" />
          <Input label="Cantidad Inicial" type="number" value={addForm.values.quantity} onChange={(e) => addForm.handleChange('quantity', Number(e.target.value))} />
          <Select label="Unidad" options={UNIT_OPTIONS} value={addForm.values.unit} onChange={(e) => addForm.handleChange('unit', e.target.value)} />
          <Input label="Stock Mínimo" type="number" value={addForm.values.minThreshold} onChange={(e) => addForm.handleChange('minThreshold', Number(e.target.value))} />
        </div>
        {addForm.submitError && (
          <div role="alert" className="flex items-center gap-2 rounded-lg border border-red-900/50 bg-red-900/20 px-4 py-3 text-sm text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {addForm.submitError}
          </div>
        )}
        <ModalFooter>
          <Button variant="ghost" size="sm" onClick={() => { setIsAddingItem(false); addForm.reset(); }}>Cancelar</Button>
          <Button variant="primary" size="sm" onClick={addForm.handleSubmit} isLoading={addForm.isSubmitting}>Guardar Item</Button>
        </ModalFooter>
      </Modal>

      {/* Modal Editar Item */}
      <Modal
        isOpen={!!editingItem}
        onClose={handleCloseEditModal}
        title="Editar Material / Insumo"
        size="lg"
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Input label="Nombre" value={editForm.values.name} onChange={(e) => editForm.handleChange('name', e.target.value)} />
          </div>
          <Input label="SKU / Código" value={editForm.values.sku} onChange={(e) => editForm.handleChange('sku', e.target.value)} />
          <Input label="Ubicación" value={editForm.values.location} onChange={(e) => editForm.handleChange('location', e.target.value)} />
          <Input label="Cantidad" type="number" value={editForm.values.quantity} onChange={(e) => editForm.handleChange('quantity', Number(e.target.value))} />
          <Select label="Unidad" options={UNIT_OPTIONS} value={editForm.values.unit} onChange={(e) => editForm.handleChange('unit', e.target.value)} />
          <Input label="Stock Mínimo" type="number" value={editForm.values.minThreshold} onChange={(e) => editForm.handleChange('minThreshold', Number(e.target.value))} />
        </div>
        {editForm.submitError && (
          <div role="alert" className="flex items-center gap-2 rounded-lg border border-red-900/50 bg-red-900/20 px-4 py-3 text-sm text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {editForm.submitError}
          </div>
        )}
        <ModalFooter>
          <div className="flex justify-between w-full gap-3">
            <Button variant="danger" size="sm" leftIcon={<Trash2 className="w-4 h-4" />} onClick={handleDeleteItem}>
              Eliminar
            </Button>
            <div className="flex gap-3">
              <Button variant="ghost" size="sm" onClick={handleCloseEditModal}>Cancelar</Button>
              <Button variant="primary" size="sm" leftIcon={<Save className="w-4 h-4" />} onClick={editForm.handleSubmit} isLoading={editForm.isSubmitting}>
                Guardar cambios
              </Button>
            </div>
          </div>
        </ModalFooter>
      </Modal>

      {/* Header de Acciones */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-800 p-4 rounded-xl border border-slate-700">
        <div className="w-full md:w-96">
          <Input
            placeholder="Buscar por nombre o SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex space-x-3">
          <input type="file" ref={fileInputRef} onChange={handleImportCSV} accept=".csv" className="hidden" />
          <Button variant="secondary" size="md" leftIcon={<Upload className="w-4 h-4" />} onClick={() => fileInputRef.current?.click()}>
            Importar CSV
          </Button>
          <Button variant="primary" size="md" leftIcon={<Download className="w-4 h-4" />} onClick={handleExportCSV}>
            Exportar CSV
          </Button>
          <Button variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />} className="bg-green-600 hover:bg-green-500 shadow-green-600/20" onClick={() => setIsAddingItem(true)}>
            Nuevo Item
          </Button>
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
                <tr
                  key={item.id}
                  onDoubleClick={() => handleOpenEditModal(item)}
                  className="hover:bg-slate-700/50 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4 font-mono text-slate-300 group-hover:text-white">{item.sku}</td>
                  <td className="px-6 py-4 font-medium text-white">{item.name}</td>
                  <td className="px-6 py-4 text-slate-400">{item.location}</td>
                  <td className="px-6 py-4 text-right font-mono text-lg">{item.quantity}</td>
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
           <span>Doble click en una fila para editar</span>
        </div>
      </div>
    </div>
  );
}
