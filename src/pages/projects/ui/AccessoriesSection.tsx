import { useState } from 'react';
import type { ProjectAccessory, InventoryItem } from '@/shared/types';
import { Button, Input, Select } from '@/shared/ui';
import { Package, Plus, Trash2, CheckSquare } from 'lucide-react';

interface AccessoriesSectionProps {
  projectAccs: ProjectAccessory[];
  inventory: InventoryItem[];
  inventoryOptions: { value: string; label: string }[];
  onAddAccessory: (itemId: string, qty: number) => Promise<void>;
  onDeleteAccessory: (id: string) => void;
}

export function AccessoriesSection({
  projectAccs,
  inventory,
  inventoryOptions,
  onAddAccessory,
  onDeleteAccessory,
}: AccessoriesSectionProps) {
  const [newAccessory, setNewAccessory] = useState({ itemId: '', qty: 0 });

  const handleAdd = async () => {
    if (!newAccessory.itemId || !newAccessory.qty) return;
    await onAddAccessory(newAccessory.itemId, newAccessory.qty);
    setNewAccessory({ itemId: '', qty: 0 });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-white flex items-center">
          <Package className="w-5 h-5 mr-2 text-purple-400" />
          Accesorios y Stock
        </h3>
      </div>

      <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700 flex gap-2 items-end">
        <div className="flex-1">
          <Select
            label="Item de Inventario"
            options={inventoryOptions}
            placeholder="Seleccionar Material..."
            value={newAccessory.itemId}
            onChange={(e) => setNewAccessory({ ...newAccessory, itemId: e.target.value })}
          />
        </div>
        <div className="w-24">
          <Input
            label="Cantidad"
            type="number"
            value={newAccessory.qty || ''}
            onChange={(e) => setNewAccessory({ ...newAccessory, qty: parseInt(e.target.value) })}
          />
        </div>
        <Button
          variant="primary"
          size="sm"
          className="bg-purple-600 hover:bg-purple-500 h-12"
          onClick={handleAdd}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-2">
        {projectAccs.length === 0 && (
          <p className="text-slate-500 text-sm italic text-center py-4">
            No hay accesorios asignados.
          </p>
        )}
        {projectAccs.map((acc) => {
          const item = inventory.find((i) => i.id === acc.inventoryItemId);
          return (
            <div
              key={acc.id}
              className="flex justify-between items-center bg-slate-900 border border-slate-700 p-4 rounded-2xl hover:border-slate-500 group"
            >
              <div className="flex items-center gap-3">
                <div className="bg-slate-800 p-2 rounded-xl text-slate-400">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-black text-xs text-white uppercase">
                    {item?.name || 'Item Desconocido'}
                  </div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">
                    Requerido: {acc.quantityRequired} {item?.unit}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {item && item.quantity >= acc.quantityRequired ? (
                  <span className="text-green-500 flex items-center text-[10px] font-black uppercase">
                    <CheckSquare size={14} className="mr-1" /> OK
                  </span>
                ) : (
                  <span className="text-red-500 flex items-center text-[10px] font-black uppercase tracking-widest animate-pulse">
                    Faltante
                  </span>
                )}
                <button
                  onClick={() => onDeleteAccessory(acc.id)}
                  className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
