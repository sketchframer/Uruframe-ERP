import React from 'react';
import { RouterProvider } from '@tanstack/react-router';
import { ErrorBoundary } from '@/shared/ui/error/ErrorBoundary';
import { ToastProvider } from '@/shared/ui/feedback/Toast';
import { OfflineBanner } from '@/shared/ui/feedback/OfflineBanner';
import { router } from '../routes/router';
import { StoreProvider } from './StoreProvider';

export function Providers() {
  return (
    <ErrorBoundary
      onError={(error) => {
        console.error('App error:', error);
      }}
    >
      <ToastProvider>
        <StoreProvider>
          <OfflineBanner />
          <RouterProvider router={router} />
        </StoreProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
