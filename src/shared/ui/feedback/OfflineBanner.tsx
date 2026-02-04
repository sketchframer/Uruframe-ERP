import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/shared/hooks/useOnlineStatus';

export const OfflineBanner: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 bg-yellow-500 text-yellow-900 py-2 px-4 text-center text-sm font-bold z-[60] flex items-center justify-center gap-2"
      role="alert"
    >
      <WifiOff size={16} />
      Sin conexión — Los cambios se guardarán localmente
    </div>
  );
};
