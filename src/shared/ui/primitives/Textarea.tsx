import React, { useId } from 'react';
import { cn } from '@/shared/lib/cn';
import { focusRing } from '@/shared/ui/theme/focus';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id: idProp, required, ...props }, ref) => {
    const generatedId = useId();
    const textareaId =
      idProp ??
      (label
        ? label.toLowerCase().replace(/\s/g, '-').replace(/[^a-z0-9-]/g, '')
        : generatedId.replace(/:/g, '-'));
    const errorId = `${textareaId}-error`;
    const hintId = `${textareaId}-hint`;

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-[10px] font-black uppercase tracking-widest text-slate-500"
          >
            {label}
            {required && <span aria-hidden="true"> *</span>}
            {required && <span className="sr-only"> (requerido)</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full min-h-[96px] px-4 py-3 bg-slate-800 border-2 border-slate-700',
            'rounded-xl text-white placeholder:text-slate-600 resize-y',
            'focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
            focusRing,
            'transition-all duration-200',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            className,
          )}
          aria-invalid={!!error}
          aria-describedby={cn(error && errorId, hint && !error && hintId)}
          aria-required={required}
          required={required}
          {...props}
        />
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
  },
);

Textarea.displayName = 'Textarea';
