import React from 'react';
import { cn } from '@/shared/lib/cn';

export interface TabItem {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeId,
  onChange,
  className,
}) => (
  <div
    role="tablist"
    className={cn(
      'flex flex-wrap gap-2 bg-slate-800 p-1.5 rounded-2xl border border-slate-700 w-fit shadow-xl',
      className
    )}
  >
    {tabs.map((tab) => {
      const isActive = activeId === tab.id;
      return (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={isActive}
          aria-controls={`panel-${tab.id}`}
          id={`tab-${tab.id}`}
          onClick={() => onChange(tab.id)}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase transition-all',
            isActive
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-700'
          )}
        >
          {tab.icon}
          {tab.label}
        </button>
      );
    })}
  </div>
);
