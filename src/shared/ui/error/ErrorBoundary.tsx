import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/ui/primitives/Button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isDev =
        typeof import.meta !== 'undefined' &&
        (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV === true;

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
            <div className="flex gap-3 justify-center flex-wrap">
              <Button
                onClick={this.handleReset}
                leftIcon={<RefreshCw size={18} />}
              >
                Reintentar
              </Button>
              <Button
                variant="ghost"
                onClick={() => window.location.reload()}
              >
                Recargar página
              </Button>
            </div>
            {isDev && this.state.error && (
              <pre className="mt-6 p-4 bg-slate-800 rounded-xl text-left text-xs text-red-400 overflow-auto max-h-48">
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
