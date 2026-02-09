import React from 'react';
import { cn } from '@/shared/lib/cn';

export interface StatCardProps {
  label: string;
  value: React.ReactNode;
  variant?: 'default' | 'warning' | 'success';
  className?: string;
}

const valueVariants = {
  default: 'text-white',
  warning: 'text-red-400',
  success: 'text-blue-400',
};

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  variant = 'default',
  className,
}) => (
  <div
    className={cn(
      'bg-slate-900/50 p-4 rounded-xl border border-slate-700',
      className
    )}
  >
    <div className="text-slate-400 text-xs uppercase font-bold">{label}</div>
    <div className={cn('text-3xl font-bold mt-1', valueVariants[variant])}>
      {value}
    </div>
  </div>
);
