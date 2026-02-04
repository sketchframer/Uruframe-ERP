import React from 'react';
import { cn } from '@/shared/lib/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  radius?: 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

const variants = {
  default: 'bg-slate-900',
  bordered: 'bg-slate-900 border-2 border-slate-800',
  elevated: 'bg-slate-900 shadow-xl shadow-black/20',
};

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

const radiuses = {
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  xl: 'rounded-[1.5rem]',
  '2xl': 'rounded-[2rem]',
  '3xl': 'rounded-[3rem]',
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      radius = 'xl',
      className,
      children,
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(
        variants[variant],
        paddings[padding],
        radiuses[radius],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);

Card.displayName = 'Card';

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div
    className={cn('pb-4 border-b border-slate-800 mb-4', className)}
    {...props}
  >
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  children,
  ...props
}) => (
  <h3
    className={cn(
      'text-lg font-black uppercase tracking-tight text-white',
      className
    )}
    {...props}
  >
    {children}
  </h3>
);

export const CardDescription: React.FC<
  React.HTMLAttributes<HTMLParagraphElement>
> = ({ className, children, ...props }) => (
  <p className={cn('text-sm text-slate-500', className)} {...props}>
    {children}
  </p>
);
