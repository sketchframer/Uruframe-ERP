import React from 'react';
import { cn } from '@/shared/lib/cn';

export interface SelectableListItemProps {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  itemClassName?: string;
}

export const SelectableListItem: React.FC<SelectableListItemProps> = ({
  selected,
  onClick,
  children,
  className,
  itemClassName,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'w-full text-left p-3 rounded-lg border transition-all',
      selected
        ? 'bg-blue-900/30 border-blue-500'
        : 'bg-slate-700/20 border-transparent hover:bg-slate-700/50',
      itemClassName,
      className
    )}
  >
    {children}
  </button>
);
