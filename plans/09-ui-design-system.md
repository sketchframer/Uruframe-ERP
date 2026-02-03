# Plan 9: UI Design System

## Goal

Create a consistent, reusable UI component library in `shared/ui/` that follows the app's visual language and improves development speed.

---

## Current UI Patterns (Extracted from Views)

### Color Palette

```typescript
// src/shared/ui/theme/colors.ts

export const colors = {
  // Background
  bg: {
    primary: '#0f172a',    // Main background
    secondary: '#1e293b',  // Cards, panels
    tertiary: '#334155',   // Inputs, hover states
  },
  
  // Text
  text: {
    primary: '#f8fafc',    // White text
    secondary: '#94a3b8',  // Muted text
    muted: '#64748b',      // Very muted
  },
  
  // Brand
  brand: {
    primary: '#3b82f6',    // Blue-600
    secondary: '#8b5cf6',  // Purple
    accent: '#06b6d4',     // Cyan
  },
  
  // Status
  status: {
    success: '#10b981',    // Green
    warning: '#f59e0b',    // Amber
    error: '#ef4444',      // Red
    info: '#3b82f6',       // Blue
  },
  
  // Machine status colors
  machine: {
    running: '#10b981',
    idle: '#f59e0b',
    error: '#ef4444',
    maintenance: '#f97316',
    offline: '#64748b',
  },
};
```

### Border Radius Scale

```typescript
// src/shared/ui/theme/radius.ts

export const radius = {
  sm: '0.5rem',      // 8px
  md: '0.75rem',     // 12px
  lg: '1rem',        // 16px
  xl: '1.5rem',      // 24px - Cards
  '2xl': '2rem',     // 32px - Large cards
  '3xl': '3rem',     // 48px - Panels
  full: '9999px',    // Pills
};
```

### Typography

```typescript
// src/shared/ui/theme/typography.ts

export const typography = {
  // Font families
  fontFamily: {
    sans: 'Inter, system-ui, sans-serif',
    mono: 'JetBrains Mono, monospace',
  },
  
  // Font sizes
  fontSize: {
    xs: ['0.625rem', { lineHeight: '1rem' }],      // 10px
    sm: ['0.75rem', { lineHeight: '1rem' }],       // 12px
    base: ['0.875rem', { lineHeight: '1.25rem' }], // 14px
    lg: ['1rem', { lineHeight: '1.5rem' }],        // 16px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],    // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }],     // 24px
    '3xl': ['2rem', { lineHeight: '2.5rem' }],     // 32px
    '4xl': ['2.5rem', { lineHeight: '3rem' }],     // 40px
  },
  
  // Font weights
  fontWeight: {
    normal: '400',
    medium: '500',
    bold: '700',
    black: '900',
  },
};
```

---

## Component Library Structure

```
src/shared/ui/
├── theme/
│   ├── colors.ts
│   ├── radius.ts
│   ├── typography.ts
│   ├── shadows.ts
│   └── index.ts
├── primitives/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Select.tsx
│   ├── Checkbox.tsx
│   ├── Slider.tsx
│   └── index.ts
├── layout/
│   ├── Card.tsx
│   ├── Panel.tsx
│   ├── Grid.tsx
│   ├── Stack.tsx
│   └── index.ts
├── feedback/
│   ├── Badge.tsx
│   ├── Alert.tsx
│   ├── Toast.tsx
│   ├── Spinner.tsx
│   └── index.ts
├── overlay/
│   ├── Modal.tsx
│   ├── Drawer.tsx
│   ├── Popover.tsx
│   └── index.ts
├── data/
│   ├── Table.tsx
│   ├── List.tsx
│   ├── EmptyState.tsx
│   └── index.ts
└── index.ts
```

---

## Primitive Components

### Button

```typescript
// src/shared/ui/primitives/Button.tsx

import React from 'react';
import { cn } from '@/shared/lib/cn';
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
  secondary:
    'bg-slate-700 text-white hover:bg-slate-600 active:scale-95',
  danger:
    'bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-600/20 active:scale-95',
  ghost:
    'text-slate-400 hover:bg-slate-800 hover:text-white',
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
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center',
          'font-bold uppercase tracking-wider',
          'rounded-xl transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
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
    );
  }
);

Button.displayName = 'Button';
```

### Input

```typescript
// src/shared/ui/primitives/Input.tsx

import React from 'react';
import { cn } from '@/shared/lib/cn';

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
    { label, error, hint, leftIcon, rightIcon, className, id, ...props },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, '-');

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[10px] font-black uppercase tracking-widest text-slate-500"
          >
            {label}
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
              'transition-all duration-200',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-red-500 font-medium">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-slate-600">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
```

### Select

```typescript
// src/shared/ui/primitives/Select.tsx

import React from 'react';
import { cn } from '@/shared/lib/cn';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s/g, '-');

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
              'transition-all duration-200',
              error && 'border-red-500',
              className
            )}
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
```

### Slider

```typescript
// src/shared/ui/primitives/Slider.tsx

import React from 'react';
import { cn } from '@/shared/lib/cn';

export interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showValue?: boolean;
  formatValue?: (value: number) => string;
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  showValue = true,
  formatValue = (v) => `${v}%`,
  className,
}) => {
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn('space-y-2', className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center">
          {label && (
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              {label}
            </span>
          )}
          {showValue && (
            <span className="text-2xl font-black text-white">
              {formatValue(value)}
            </span>
          )}
        </div>
      )}
      <div className="relative">
        {/* Track background */}
        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
          {/* Filled portion */}
          <div
            className="h-full bg-blue-600 transition-all duration-150"
            style={{ width: `${percent}%` }}
          />
        </div>
        {/* Input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
};
```

---

## Layout Components

### Card

```typescript
// src/shared/ui/layout/Card.tsx

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
  ) => {
    return (
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
    );
  }
);

Card.displayName = 'Card';

// Sub-components
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
```

### Stack

```typescript
// src/shared/ui/layout/Stack.tsx

import React from 'react';
import { cn } from '@/shared/lib/cn';

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'column';
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  wrap?: boolean;
}

const gaps = {
  none: '',
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
};

const aligns = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

const justifies = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
};

export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  (
    {
      direction = 'column',
      gap = 'md',
      align = 'stretch',
      justify = 'start',
      wrap = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          direction === 'row' ? 'flex-row' : 'flex-col',
          gaps[gap],
          aligns[align],
          justifies[justify],
          wrap && 'flex-wrap',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Stack.displayName = 'Stack';

// Convenience components
export const HStack: React.FC<Omit<StackProps, 'direction'>> = (props) => (
  <Stack direction="row" {...props} />
);

export const VStack: React.FC<Omit<StackProps, 'direction'>> = (props) => (
  <Stack direction="column" {...props} />
);
```

---

## Feedback Components

### Badge

```typescript
// src/shared/ui/feedback/Badge.tsx

import React from 'react';
import { cn } from '@/shared/lib/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
}

const variants = {
  default: 'bg-slate-700 text-slate-300',
  success: 'bg-green-500/20 text-green-400 border border-green-500/30',
  warning: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  error: 'bg-red-500/20 text-red-400 border border-red-500/30',
  info: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
};

const sizes = {
  sm: 'px-2 py-0.5 text-[9px]',
  md: 'px-3 py-1 text-[10px]',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  className,
  children,
  ...props
}) => (
  <span
    className={cn(
      'inline-flex items-center font-black uppercase tracking-widest rounded-lg',
      variants[variant],
      sizes[size],
      className
    )}
    {...props}
  >
    {children}
  </span>
);
```

### StatusBadge (Machine Status)

```typescript
// src/shared/ui/feedback/StatusBadge.tsx

import React from 'react';
import { Badge } from './Badge';
import type { MachineStatus } from '@/shared/types';

const statusVariants: Record<MachineStatus, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  RUNNING: 'success',
  IDLE: 'warning',
  ERROR: 'error',
  MAINTENANCE: 'warning',
  OFFLINE: 'default',
};

const statusLabels: Record<MachineStatus, string> = {
  RUNNING: 'En Marcha',
  IDLE: 'Inactivo',
  ERROR: 'Error',
  MAINTENANCE: 'Mantención',
  OFFLINE: 'Fuera de Línea',
};

export interface StatusBadgeProps {
  status: MachineStatus;
  showLabel?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  showLabel = true,
}) => (
  <Badge variant={statusVariants[status]}>
    {showLabel ? statusLabels[status] : status}
  </Badge>
);
```

### Spinner

```typescript
// src/shared/ui/feedback/Spinner.tsx

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

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className }) => (
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
```

---

## Overlay Components

### Modal

```typescript
// src/shared/ui/overlay/Modal.tsx

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/shared/lib/cn';
import { X } from 'lucide-react';
import { Button } from '../primitives/Button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: React.ReactNode;
  showCloseButton?: boolean;
}

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[90vw]',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  children,
  showCloseButton = true,
}) => {
  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Content */}
      <div
        className={cn(
          'relative w-full bg-slate-900 rounded-3xl shadow-2xl',
          'border border-slate-800',
          'animate-in fade-in zoom-in-95 duration-200',
          sizes[size]
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-slate-800">
            {title && (
              <h2 className="text-xl font-black uppercase tracking-tight text-white">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 
                           rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}
        
        {/* Body */}
        <div className="p-6">{children}</div>
      </div>
    </div>,
    document.body
  );
};

// Modal footer helper
export const ModalFooter: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div className="flex justify-end gap-3 pt-6 border-t border-slate-800 mt-6">
    {children}
  </div>
);
```

---

## Index Exports

```typescript
// src/shared/ui/index.ts

// Theme
export * from './theme';

// Primitives
export { Button } from './primitives/Button';
export type { ButtonProps } from './primitives/Button';
export { Input } from './primitives/Input';
export type { InputProps } from './primitives/Input';
export { Select } from './primitives/Select';
export type { SelectProps, SelectOption } from './primitives/Select';
export { Slider } from './primitives/Slider';
export type { SliderProps } from './primitives/Slider';

// Layout
export { Card, CardHeader, CardTitle, CardDescription } from './layout/Card';
export type { CardProps } from './layout/Card';
export { Stack, HStack, VStack } from './layout/Stack';
export type { StackProps } from './layout/Stack';

// Feedback
export { Badge } from './feedback/Badge';
export type { BadgeProps } from './feedback/Badge';
export { StatusBadge } from './feedback/StatusBadge';
export { Spinner, FullPageSpinner } from './feedback/Spinner';

// Overlay
export { Modal, ModalFooter } from './overlay/Modal';
export type { ModalProps } from './overlay/Modal';
```

---

## Usage Examples

### Before (Inline Styles)

```tsx
<button 
  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all 
             bg-blue-600 text-white shadow-lg shadow-blue-600/20 
             font-bold text-sm uppercase tracking-wider"
  onClick={handleClick}
>
  <Plus size={20} />
  Crear Proyecto
</button>
```

### After (Design System)

```tsx
import { Button } from '@/shared/ui';
import { Plus } from 'lucide-react';

<Button leftIcon={<Plus size={20} />} onClick={handleClick}>
  Crear Proyecto
</Button>
```

---

## Migration Checklist

- [ ] Create `shared/ui/theme/` with tokens
- [ ] Create `shared/ui/primitives/Button.tsx`
- [ ] Create `shared/ui/primitives/Input.tsx`
- [ ] Create `shared/ui/primitives/Select.tsx`
- [ ] Create `shared/ui/primitives/Slider.tsx`
- [ ] Create `shared/ui/layout/Card.tsx`
- [ ] Create `shared/ui/layout/Stack.tsx`
- [ ] Create `shared/ui/feedback/Badge.tsx`
- [ ] Create `shared/ui/feedback/StatusBadge.tsx`
- [ ] Create `shared/ui/feedback/Spinner.tsx`
- [ ] Create `shared/ui/overlay/Modal.tsx`
- [ ] Create `shared/ui/index.ts`
- [ ] Replace inline button styles in views
- [ ] Replace inline input styles in views
- [ ] Replace inline card styles in views
