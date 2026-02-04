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

interface StoreProviderProps {
  children: React.ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const hydrateStores = async () => {
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
