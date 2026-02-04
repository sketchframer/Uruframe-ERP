import React from 'react';
import {
  Play,
  PauseCircle,
  AlertCircle,
  Wrench,
  Power,
} from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Badge } from './Badge';
import type { MachineStatus } from '@/shared/types';

const statusVariants: Record<
  MachineStatus,
  'success' | 'warning' | 'error' | 'info' | 'default'
> = {
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

const statusIcons: Record<MachineStatus, React.ComponentType<{ size?: number }>> = {
  RUNNING: Play,
  IDLE: PauseCircle,
  ERROR: AlertCircle,
  MAINTENANCE: Wrench,
  OFFLINE: Power,
};

export interface StatusBadgeProps {
  status: MachineStatus;
  showLabel?: boolean;
  /** Show icon (for color-blind users; not color-only). Default true. */
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  showLabel = true,
  showIcon = true,
}) => {
  const Icon = statusIcons[status];
  const label = statusLabels[status];
  return (
    <Badge
      variant={statusVariants[status]}
      role="status"
      aria-label={`Estado: ${label}`}
      className={cn(showIcon && 'gap-1.5')}
    >
      {showIcon && <Icon size={12} aria-hidden />}
      {showLabel ? label : status}
    </Badge>
  );
};
