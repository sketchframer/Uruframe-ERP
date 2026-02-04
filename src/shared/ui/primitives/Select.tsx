import React from 'react';
import { cn } from '@/shared/lib/cn';
import { focusRing } from '@/shared/ui/theme/focus';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    'children' | 'size'
  > {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, id, ...props }, ref) => {
    const selectId =
      id ?? label?.toLowerCase().replace(/\s/g, '-').replace(/[^a-z0-9-]/g, '');

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-[10px] font-black uppercase tracking-widest text-slate-500"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'w-full h-12 px-4 pr-10 bg-slate-800 border-2 border-slate-700',
              'rounded-xl text-white appearance-none cursor-pointer',
              'focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
              focusRing,
              'transition-all duration-200',
              error && 'border-red-500',
              className
            )}
            aria-invalid={!!error}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
            size={18}
          />
        </div>
        {error && (
          <p className="text-xs text-red-500 font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
