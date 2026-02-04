import React from 'react';
import type { SystemAlert } from '@/shared/types';
import { useAlertStore } from '@/entities/alert';
import { AlertCircle } from 'lucide-react';
import { AlertCard } from './AlertCard';

interface AlertsPanelProps {
  onAlertClick?: (alert: SystemAlert) => void;
}

export function AlertsPanel({ onAlertClick }: AlertsPanelProps) {
  const alerts = useAlertStore((s) => s.alerts);
  const criticalAlerts = alerts.filter(
    (a) => a.severity === 'HIGH' && a.type !== 'READY_FOR_DELIVERY'
  );

  if (criticalAlerts.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] pl-2 flex items-center gap-2">
        <AlertCircle size={14} /> {criticalAlerts.length} Incidentes Detectados
      </div>
      {criticalAlerts.map((alert) => (
        <AlertCard key={alert.id} alert={alert} onClick={onAlertClick} />
      ))}
    </div>
  );
}
