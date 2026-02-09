import React from 'react';
import { cn } from '@/shared/lib/cn';

export interface SelectableListProps<T> {
  items: T[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  getItemId: (item: T) => string;
  renderItem: (item: T) => React.ReactNode;
  title?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  itemClassName?: string;
}

export function SelectableList<T>({
  items,
  selectedId,
  onSelect,
  getItemId,
  renderItem,
  title,
  action,
  className,
  itemClassName,
}: SelectableListProps<T>): React.ReactElement {
  return (
    <div className={cn('flex flex-col flex-1 min-h-0 h-full', className)}>
      {(title != null || action != null) && (
        <div className="p-4 border-b border-slate-700 flex justify-between items-center shrink-0">
          {title != null && (
            <div className="font-bold text-white flex items-center min-w-0">
              {title}
            </div>
          )}
          {action != null && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className="overflow-y-auto flex-1 p-2 space-y-2 min-h-0">
        {items.map((item) => {
          const id = getItemId(item);
          const isSelected = selectedId === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(id)}
              className={cn(
                'w-full text-left p-3 rounded-lg border transition-all',
                isSelected
                  ? 'bg-blue-900/30 border-blue-500'
                  : 'bg-slate-700/20 border-transparent hover:bg-slate-700/50',
                itemClassName
              )}
            >
              {renderItem(item)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
