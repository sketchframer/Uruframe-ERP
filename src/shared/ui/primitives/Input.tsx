import React, { useId } from 'react';
import { cn } from '@/shared/lib/cn';
import { focusRing } from '@/shared/ui/theme/focus';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, hint, leftIcon, rightIcon, className, id: idProp, required, ...props },
    ref
  ) => {
    const generatedId = useId();
    const inputId =
      idProp ??
      (label
        ? label.toLowerCase().replace(/\s/g, '-').replace(/[^a-z0-9-]/g, '')
        : generatedId.replace(/:/g, '-'));
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[10px] font-black uppercase tracking-widest text-slate-500"
          >
            {label}
            {required && <span aria-hidden="true"> *</span>}
            {required && <span className="sr-only"> (requerido)</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full h-12 px-4 bg-slate-800 border-2 border-slate-700',
              'rounded-xl text-white placeholder:text-slate-600',
              'focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
              focusRing,
              'transition-all duration-200',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error &&
                'border-red-500 focus:border-red-500 focus:ring-red-500/20',
              className
            )}
            aria-invalid={!!error}
            aria-describedby={cn(
              error && errorId,
              hint && !error && hintId
            )}
            aria-required={required}
            required={required}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p id={errorId} role="alert" className="text-xs text-red-500 font-medium">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={hintId} className="text-xs text-slate-600">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
