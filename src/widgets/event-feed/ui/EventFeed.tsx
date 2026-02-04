import React from 'react';
import { useEventStore } from '@/entities/event';
import { useMachineStore } from '@/entities/machine';
import { EventItem } from './EventItem';

export function EventFeed() {
  const events = useEventStore((s) => s.events);
  const machines = useMachineStore((s) => s.machines);

  return (
    <div className="bg-slate-800 rounded-3xl border border-slate-700 overflow-hidden flex flex-col h-[450px] shadow-2xl">
      <div className="bg-slate-900 px-4 py-3 border-b border-slate-700 text-[10px] text-slate-500 font-black uppercase tracking-widest">
        Logs en Tiempo Real
      </div>
      <div className="overflow-y-auto p-4 space-y-4 flex-1 custom-scrollbar">
        {events.length === 0 && (
          <p className="text-slate-500 text-center py-10 text-[10px] font-black uppercase tracking-widest opacity-20">
            Esperando Señal...
          </p>
        )}
        {events.map((event) => (
          <EventItem
            key={event.id}
            event={event}
            machineName={machines.find((m) => m.id === event.machineId)?.name}
          />
        ))}
      </div>
    </div>
  );
}
