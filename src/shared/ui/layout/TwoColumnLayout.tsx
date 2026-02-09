import React from 'react';
import { cn } from '@/shared/lib/cn';

export interface TwoColumnLayoutProps {
  sidebarChildren: React.ReactNode;
  mainChildren: React.ReactNode;
  sidebarClassName?: string;
  mainClassName?: string;
  className?: string;
}

const panelBase = 'bg-slate-800 rounded-xl border border-slate-700';

export const TwoColumnLayout: React.FC<TwoColumnLayoutProps> = ({
  sidebarChildren,
  mainChildren,
  sidebarClassName,
  mainClassName,
  className,
}) => (
  <div className={cn('flex h-full gap-6', className)}>
    <aside
      className={cn(
        'w-1/3 flex flex-col min-w-0 overflow-hidden',
        panelBase,
        sidebarClassName
      )}
    >
      {sidebarChildren}
    </aside>
    <main
      className={cn(
        'flex-1 flex flex-col min-w-0 overflow-hidden',
        panelBase,
        'p-8',
        mainClassName
      )}
    >
      {mainChildren}
    </main>
  </div>
);
