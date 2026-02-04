import React from 'react';
import { cn } from '@/shared/lib/cn';
import { Loader2 } from 'lucide-react';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 16,
  md: 24,
  lg: 32,
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  className,
}) => (
  <Loader2
    size={sizes[size]}
    className={cn('animate-spin text-blue-500', className)}
  />
);

export const FullPageSpinner: React.FC = () => (
  <div className="fixed inset-0 bg-slate-900/80 flex items-center justify-center z-50">
    <Spinner size="lg" />
  </div>
);
