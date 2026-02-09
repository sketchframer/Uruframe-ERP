import React from 'react';
import { cn } from '@/shared/lib/cn';

export interface EmptyStateProps {
  icon: React.ReactNode;
  message: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  message,
  description,
  action,
  className,
}) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center text-slate-500 py-8',
      className
    )}
  >
    <div className="mb-4 opacity-20 [&>svg]:w-16 [&>svg]:h-16">
      {icon}
    </div>
    <p className="font-black uppercase tracking-widest text-center text-sm">
      {message}
    </p>
    {description && (
      <div className="mt-1 text-xs text-slate-400 text-center max-w-sm">
        {description}
      </div>
    )}
    {action && <div className="mt-4">{action}</div>}
  </div>
);
