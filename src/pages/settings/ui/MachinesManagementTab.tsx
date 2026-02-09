import { useState, useCallback } from 'react';
import { Modal, ModalFooter, Button, Input, Select, PageHeader, toast } from '@/shared/ui';
import { useForm } from '@/shared/hooks';
import { Trash2, Plus, Monitor, Edit3 } from 'lucide-react';
import type { Machine } from '@/shared/types';
import { MachineStatus } from '@/shared/types';
import { useMachineStore } from '@/entities/machine';

const MACHINE_TYPE_OPTIONS = [
  { value: 'CONFORMADORA', label: 'Conformadora' },
  { value: 'HERRERIA', label: 'Herrería' },
  { value: 'SOLDADURA', label: 'Soldadura' },
  { value: 'PINTURA', label: 'Pintura' },
  { value: 'PANELIZADO', label: 'Panelizado' },
];

const MACHINE_CATEGORY_OPTIONS = [
  { value: 'STANDARD', label: 'Standard (Perfiles)' },
  { value: 'STRUCTURAL', label: 'Estructural (Heavy)' },
];

interface MachinesManagementTabProps {
  machines: Machine[];
}

export function MachinesManagementTab({ machines }: MachinesManagementTabProps) {
  const machineStore = useMachineStore.getState();

  const [showMachineForm, setShowMachineForm] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);

  const handleCloseMachineForm = useCallback(() => setShowMachineForm(false), []);

  const machineForm = useForm({
    initialValues: { name: '', type: 'CONFORMADORA' as string, category: 'STANDARD' as string, brand: '' },
    onSubmit: async (values) => {
      if (!values.name) return;
      if (editingMachine) {
        await machineStore.update(editingMachine.id, values);
      } else {
        await machineStore.create({
          name: values.name,
          type: values.type as Machine['type'],
          category: values.category as Machine['category'],
          status: MachineStatus.IDLE,
          currentJobId: null,
          totalMetersProduced: 0,
          nextMaintenanceMeters: 10000,
          oee_availability: 100,
          oee_performance: 100,
          oee_quality: 100,
          efficiency: 100,
          isActive: true,
          operatorIds: [],
          brand: values.brand,
        });
      }
      toast.success(editingMachine ? 'Máquina actualizada' : 'Máquina registrada');
      setEditingMachine(null);
      setShowMachineForm(false);
      machineForm.reset();
    },
  });

  const handleEditMachine = (machine: Machine) => {
    setEditingMachine(machine);
    machineForm.setValues({ name: machine.name, type: machine.type, category: machine.category, brand: machine.brand || '' });
    setShowMachineForm(true);
  };

  const handleDeleteMachine = (id: string) => {
    if (window.confirm('¿Eliminar esta máquina?')) {
      machineStore.delete(id);
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Parque Industrial"
        description="Gestione las unidades de producción de la fábrica."
        action={
          <Button
            variant="primary"
            size="lg"
            leftIcon={<Plus size={16} />}
            onClick={() => { setEditingMachine(null); machineForm.reset(); setShowMachineForm(true); }}
          >
            Nueva Máquina
          </Button>
        }
        className="mb-8"
      />

      <div className="space-y-3">
        {machines.map(machine => (
          <div key={machine.id} className="p-6 rounded-[1.5rem] border bg-slate-900/40 border-slate-700 flex items-center justify-between group">
            <div className="flex items-center space-x-5">
              <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-500">
                <Monitor size={24}/>
              </div>
              <div>
                <div className="font-black text-white uppercase text-lg">{machine.name}</div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">{machine.type}</span>
                  <span className={`w-2 h-2 rounded-full ${machine.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-[10px] text-slate-400 uppercase">{machine.brand || 'Marca no especificada'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-xs text-slate-500 font-black uppercase">Eficiencia</div>
                <div className="text-white font-black">{machine.efficiency}%</div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <Button variant="ghost" size="sm" onClick={() => handleEditMachine(machine)}>
                  <Edit3 size={18}/>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteMachine(machine.id)} className="hover:text-red-500">
                  <Trash2 size={20}/>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Máquina */}
      <Modal
        isOpen={showMachineForm}
        onClose={handleCloseMachineForm}
        title={editingMachine ? 'Editar Máquina' : 'Nueva Unidad'}
        size="lg"
      >
        <div className="space-y-4">
          <Input label="Nombre" placeholder="Ej: Conformadora C-200" value={machineForm.values.name} onChange={e => machineForm.handleChange('name', e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Tipo" options={MACHINE_TYPE_OPTIONS} value={machineForm.values.type} onChange={e => machineForm.handleChange('type', e.target.value)} />
            <Select label="Categoría" options={MACHINE_CATEGORY_OPTIONS} value={machineForm.values.category} onChange={e => machineForm.handleChange('category', e.target.value)} />
          </div>
          <Input label="Marca" placeholder="Ej: Pinnacle, Cunmac" value={machineForm.values.brand} onChange={e => machineForm.handleChange('brand', e.target.value)} />
        </div>
        <ModalFooter>
          <Button variant="primary" className="w-full" onClick={machineForm.handleSubmit} isLoading={machineForm.isSubmitting}>
            {editingMachine ? 'Actualizar' : 'Registrar Máquina'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
