import React from 'react';
import { cn } from '@/shared/lib/cn';

export interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  action,
  className,
}) => (
  <header
    className={cn(
      'flex flex-wrap justify-between items-center gap-4 shrink-0',
      className
    )}
  >
    <div>
      <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter">
        {title}
      </h1>
      {description && (
        <p className="text-[10px] sm:text-xs text-slate-400 mt-1">
          {description}
        </p>
      )}
    </div>
    {action && <div className="flex items-center">{action}</div>}
  </header>
);
