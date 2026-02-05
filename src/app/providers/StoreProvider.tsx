import React, { useEffect, useState } from 'react';
import { useMachineStore } from '@/entities/machine';
import { useUserStore } from '@/entities/user';
import { useJobStore } from '@/entities/job';
import { useProjectStore } from '@/entities/project';
import { useClientStore } from '@/entities/client';
import { useInventoryStore } from '@/entities/inventory';
import { useAlertStore } from '@/entities/alert';
import { useMessageStore } from '@/entities/message';
import { useEventStore } from '@/entities/event';
import { useProjectAccessoryStore } from '@/entities/projectAccessory';
import { USE_API, REFETCH_INTERVAL_MS } from '@/shared/api';
import { getCurrentUser } from '@/features/auth';

const VISIBILITY_DEBOUNCE_MS = 1500;

function refetchAll(): void {
  void Promise.all([
    useMachineStore.getState().refetch(),
    useUserStore.getState().refetch(),
    useJobStore.getState().refetch(),
    useProjectStore.getState().refetch(),
    useClientStore.getState().refetch(),
    useInventoryStore.getState().refetch(),
    useAlertStore.getState().refetch(),
    useMessageStore.getState().refetch(),
    useEventStore.getState().refetch(),
    useProjectAccessoryStore.getState().refetch(),
  ]).catch((err) => {
    console.warn('Background refetch failed:', err);
  });
}

interface StoreProviderProps {
  children: React.ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const hydrateStores = async () => {
      if (USE_API) {
        const user = await getCurrentUser();
        if (user) {
          useUserStore.getState().setCurrentUser(user);
        }
      }
      await Promise.all([
        useMachineStore.getState().hydrate(),
        useUserStore.getState().hydrate(),
        useJobStore.getState().hydrate(),
        useProjectStore.getState().hydrate(),
        useClientStore.getState().hydrate(),
        useInventoryStore.getState().hydrate(),
        useAlertStore.getState().hydrate(),
        useMessageStore.getState().hydrate(),
        useEventStore.getState().hydrate(),
        useProjectAccessoryStore.getState().hydrate(),
      ]);
      setIsHydrated(true);
    };
    hydrateStores();
  }, []);

  useEffect(() => {
    if (!isHydrated || !USE_API) return;

    const intervalId = setInterval(refetchAll, REFETCH_INTERVAL_MS);

    let visibilityDebounce: ReturnType<typeof setTimeout> | null = null;
    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return;
      if (visibilityDebounce) clearTimeout(visibilityDebounce);
      visibilityDebounce = setTimeout(() => {
        visibilityDebounce = null;
        refetchAll();
      }, VISIBILITY_DEBOUNCE_MS);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      if (visibilityDebounce) clearTimeout(visibilityDebounce);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isHydrated]);

  if (!isHydrated) {
    return (
      <div className="fixed inset-0 bg-[#0f172a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
            Cargando Sistema...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
