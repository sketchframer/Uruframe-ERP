import { Button } from '@/shared/ui';
import { UserCheck, Plus } from 'lucide-react';
import type { User, Machine } from '@/shared/types';
import { useMachineStore } from '@/entities/machine';

interface WorkforceTabProps {
  users: User[];
  machines: Machine[];
}

export function WorkforceTab({ users, machines }: WorkforceTabProps) {
  const machineStore = useMachineStore.getState();

  const handleAssignOperator = (userId: string, machineId: string) => {
    const machine = machines.find((m) => m.id === machineId);
    if (!machine) return;
    const isAssigned = machine.operatorIds.includes(userId);
    if (isAssigned) {
      machineStore.removeOperator(machineId, userId);
    } else {
      machineStore.assignOperator(machineId, userId);
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">Fuerza de Trabajo</h2>
      <p className="text-slate-500 text-sm mb-8">Asigne operarios específicos a cada unidad de producción.</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {machines.filter(m => m.isActive).map(m => (
          <div key={m.id} className="bg-slate-900/40 border border-slate-700 p-6 rounded-[2rem]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-8 bg-blue-600 rounded-full" />
              <div className="font-black text-white uppercase text-sm tracking-widest">{m.name}</div>
            </div>
            <div className="space-y-2">
              {users.filter(u => u.role === 'OPERATOR').map(u => {
                const isAssigned = m.operatorIds.includes(u.id);
                return (
                  <Button
                    key={u.id}
                    variant={isAssigned ? 'primary' : 'outline'}
                    className={`w-full justify-between ${isAssigned ? 'bg-blue-600/10 border-blue-600' : ''}`}
                    onClick={() => handleAssignOperator(u.id, m.id)}
                  >
                    <span className="font-bold text-xs uppercase">{u.name}</span>
                    {isAssigned ? <UserCheck size={16}/> : <Plus size={16} className="opacity-20"/>}
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
