import React from 'react';
import { cn } from '@/shared/lib/cn';
import { focusRing } from '@/shared/ui/theme/focus';
import { Loader2 } from 'lucide-react';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variants = {
  primary:
    'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20 active:scale-95',
  secondary: 'bg-slate-700 text-white hover:bg-slate-600 active:scale-95',
  danger:
    'bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-600/20 active:scale-95',
  ghost: 'text-slate-400 hover:bg-slate-800 hover:text-white',
  outline:
    'border-2 border-slate-700 text-slate-300 hover:border-slate-600 hover:bg-slate-800',
};

const sizes = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
  xl: 'h-14 px-8 text-lg gap-3',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading,
      leftIcon,
      rightIcon,
      className,
      disabled,
      children,
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      type="button"
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center',
        'font-bold uppercase tracking-wider',
        'rounded-xl transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        focusRing,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="animate-spin" size={size === 'sm' ? 14 : 18} />
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </button>
  )
);

Button.displayName = 'Button';
