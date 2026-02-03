# Plan 12: Error Handling & Recovery

## Goal

Implement robust error handling throughout the app with graceful degradation, user-friendly messages, and recovery options.

---

## Current State

- Errors are `console.error`'d and often silently fail
- No error boundaries
- No retry mechanisms
- No user feedback on failures

---

## Error Handling Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                     Error Boundary                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    Page Level                        │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │              Widget Level                    │    │   │
│  │  │  ┌─────────────────────────────────────┐    │    │   │
│  │  │  │         Component Level              │    │    │   │
│  │  │  │    try/catch in async ops            │    │    │   │
│  │  │  └─────────────────────────────────────┘    │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. Global Error Boundary

```typescript
// src/shared/ui/error/ErrorBoundary.tsx

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '../primitives/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">
              Algo salió mal
            </h2>
            <p className="text-slate-400 mb-6">
              Ha ocurrido un error inesperado. Por favor, intenta de nuevo.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={this.handleReset} leftIcon={<RefreshCw size={18} />}>
                Reintentar
              </Button>
              <Button variant="ghost" onClick={() => window.location.reload()}>
                Recargar página
              </Button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <pre className="mt-6 p-4 bg-slate-800 rounded-xl text-left text-xs text-red-400 overflow-auto">
                {this.state.error.stack}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Usage

```typescript
// src/app/App.tsx

import { ErrorBoundary } from '@/shared/ui/error/ErrorBoundary';

export function App() {
  return (
    <ErrorBoundary
      onError={(error) => {
        // Send to error tracking (Sentry, etc.)
        console.error('App error:', error);
      }}
    >
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}
```

---

## 2. Async Error Handling Hook

```typescript
// src/shared/hooks/useAsyncError.ts

import { useState, useCallback } from 'react';

interface AsyncState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
}

interface UseAsyncOptions {
  onError?: (error: Error) => void;
  retries?: number;
  retryDelay?: number;
}

export function useAsync<T>(
  asyncFn: () => Promise<T>,
  options: UseAsyncOptions = {}
) {
  const { onError, retries = 0, retryDelay = 1000 } = options;
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    isLoading: false,
  });
  const [retryCount, setRetryCount] = useState(0);

  const execute = useCallback(async () => {
    setState(s => ({ ...s, isLoading: true, error: null }));

    try {
      const data = await asyncFn();
      setState({ data, error: null, isLoading: false });
      setRetryCount(0);
      return data;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      if (retryCount < retries) {
        // Retry with exponential backoff
        setRetryCount(c => c + 1);
        await new Promise(r => setTimeout(r, retryDelay * (retryCount + 1)));
        return execute();
      }

      setState({ data: null, error: err, isLoading: false });
      onError?.(err);
      throw err;
    }
  }, [asyncFn, onError, retries, retryDelay, retryCount]);

  const reset = useCallback(() => {
    setState({ data: null, error: null, isLoading: false });
    setRetryCount(0);
  }, []);

  return { ...state, execute, reset, retryCount };
}
```

### Usage

```typescript
const { data, error, isLoading, execute } = useAsync(
  () => machineRepository.getAll(),
  { retries: 3, retryDelay: 1000 }
);
```

---

## 3. Store Error Handling

```typescript
// src/entities/machine/model/machineStore.ts

import { create } from 'zustand';
import { toast } from '@/shared/ui/feedback/Toast';

interface MachineStore {
  machines: Machine[];
  error: Error | null;
  isLoading: boolean;
  
  fetchAll: () => Promise<void>;
  clearError: () => void;
}

export const useMachineStore = create<MachineStore>()((set, get) => ({
  machines: [],
  error: null,
  isLoading: false,

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const machines = await machineRepository.getAll();
      set({ machines, isLoading: false });
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to fetch machines');
      set({ error: err, isLoading: false });
      
      // Show toast notification
      toast.error('No se pudieron cargar las máquinas. Intenta de nuevo.');
      
      // Log for debugging
      console.error('Machine fetch error:', err);
    }
  },

  clearError: () => set({ error: null }),
}));
```

---

## 4. Toast Notification System

```typescript
// src/shared/ui/feedback/Toast.tsx

import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string, duration = 5000) => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { id, type, message, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles = {
  success: 'bg-green-500/20 border-green-500/50 text-green-400',
  error: 'bg-red-500/20 border-red-500/50 text-red-400',
  warning: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400',
  info: 'bg-blue-500/20 border-blue-500/50 text-blue-400',
};

const ToastContainer: React.FC<{
  toasts: Toast[];
  onRemove: (id: string) => void;
}> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return createPortal(
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map(toast => {
        const Icon = icons[toast.type];
        return (
          <div
            key={toast.id}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl border',
              'backdrop-blur-sm shadow-lg min-w-[300px] max-w-md',
              'animate-in slide-in-from-right duration-300',
              styles[toast.type]
            )}
          >
            <Icon size={20} />
            <span className="flex-1 text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => onRemove(toast.id)}
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>,
    document.body
  );
};

// Hook for easy access
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

// Static API for use outside React
let toastRef: ToastContextValue | null = null;

export const setToastRef = (ref: ToastContextValue) => {
  toastRef = ref;
};

export const toast = {
  success: (message: string) => toastRef?.addToast('success', message),
  error: (message: string) => toastRef?.addToast('error', message),
  warning: (message: string) => toastRef?.addToast('warning', message),
  info: (message: string) => toastRef?.addToast('info', message),
};
```

---

## 5. Form Error Handling

```typescript
// src/shared/hooks/useForm.ts

import { useState, useCallback } from 'react';

interface UseFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
  onSubmit: (values: T) => Promise<void>;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit,
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    // Clear field error on change
    setErrors(prev => ({ ...prev, [field]: undefined }));
    setSubmitError(null);
  }, []);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    // Validate
    if (validate) {
      const validationErrors = validate(values);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onSubmit(values);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al guardar';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate, onSubmit]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setSubmitError(null);
  }, [initialValues]);

  return {
    values,
    errors,
    isSubmitting,
    submitError,
    handleChange,
    handleSubmit,
    reset,
    setValues,
  };
}
```

### Usage

```typescript
const form = useForm({
  initialValues: { name: '', clientId: '', deadline: '' },
  validate: (values) => {
    const errors: Record<string, string> = {};
    if (!values.name) errors.name = 'El nombre es requerido';
    if (!values.clientId) errors.clientId = 'Selecciona un cliente';
    return errors;
  },
  onSubmit: async (values) => {
    await projectStore.create(values);
    toast.success('Proyecto creado');
  },
});

// In JSX
<Input
  label="Nombre"
  value={form.values.name}
  onChange={(e) => form.handleChange('name', e.target.value)}
  error={form.errors.name}
/>

{form.submitError && (
  <Alert variant="error">{form.submitError}</Alert>
)}
```

---

## 6. API Error Classification

```typescript
// src/shared/api/errors.ts

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static isNetworkError(error: unknown): boolean {
    return error instanceof TypeError && error.message === 'Failed to fetch';
  }

  static isAuthError(error: unknown): boolean {
    return error instanceof ApiError && error.status === 401;
  }

  static isNotFound(error: unknown): boolean {
    return error instanceof ApiError && error.status === 404;
  }

  static isValidationError(error: unknown): boolean {
    return error instanceof ApiError && error.status === 422;
  }

  static isServerError(error: unknown): boolean {
    return error instanceof ApiError && error.status >= 500;
  }
}

export function getErrorMessage(error: unknown): string {
  if (ApiError.isNetworkError(error)) {
    return 'Error de conexión. Verifica tu internet.';
  }
  if (ApiError.isAuthError(error)) {
    return 'Sesión expirada. Por favor, inicia sesión de nuevo.';
  }
  if (ApiError.isServerError(error)) {
    return 'Error del servidor. Intenta más tarde.';
  }
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Ha ocurrido un error inesperado';
}
```

---

## 7. Offline Detection

```typescript
// src/shared/hooks/useOnlineStatus.ts

import { useState, useEffect } from 'react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
```

```typescript
// src/shared/ui/feedback/OfflineBanner.tsx

import { useOnlineStatus } from '@/shared/hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-yellow-900 
                    py-2 px-4 text-center text-sm font-bold z-50 flex items-center 
                    justify-center gap-2">
      <WifiOff size={16} />
      Sin conexión - Los cambios se guardarán localmente
    </div>
  );
};
```

---

## Migration Checklist

- [ ] Create `ErrorBoundary` component
- [ ] Wrap app with `ErrorBoundary`
- [ ] Create `useAsync` hook
- [ ] Add error state to all stores
- [ ] Create toast notification system
- [ ] Wrap app with `ToastProvider`
- [ ] Create `useForm` hook with error handling
- [ ] Add API error classification
- [ ] Create offline detection hook
- [ ] Add `OfflineBanner` component
- [ ] Replace all `console.error` with proper handling
- [ ] Add retry logic to critical operations
