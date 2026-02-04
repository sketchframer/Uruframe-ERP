import React from 'react';
import { PieChart, Pie, Cell } from 'recharts';

const oeeComponents = [
  { name: 'Disponibilidad', value: 92, color: '#3b82f6' },
  { name: 'Rendimiento', value: 88, color: '#8b5cf6' },
  { name: 'Calidad', value: 98, color: '#10b981' },
];

export function OeeChart() {
  return (
    <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl flex items-center gap-6">
      <div className="flex-1">
        <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4">
          Métricas de Rendimiento
        </div>
        <div className="space-y-4">
          {oeeComponents.map((comp) => (
            <div key={comp.name}>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-slate-400 font-black uppercase tracking-widest">
                  {comp.name}
                </span>
                <span className="text-white font-black">{comp.value}%</span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${comp.value}%`, backgroundColor: comp.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="hidden sm:block shrink-0">
        <PieChart width={120} height={120}>
          <Pie
            data={oeeComponents}
            innerRadius={40}
            outerRadius={55}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {oeeComponents.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </div>
    </div>
  );
}
