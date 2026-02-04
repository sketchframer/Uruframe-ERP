import { useMachineStore } from './machineStore';
import { MachineStatus } from '@/shared/types';

export const useActiveMachines = () =>
  useMachineStore((state) => state.machines.filter((m) => m.isActive));

export const useRunningMachines = () =>
  useMachineStore((state) =>
    state.machines.filter((m) => m.status === MachineStatus.RUNNING)
  );

export const useMachinesByType = (type: string) =>
  useMachineStore((state) => state.machines.filter((m) => m.type === type));

export const useAverageOee = () =>
  useMachineStore((state) => {
    const machines = state.machines;
    if (machines.length === 0) return 0;
    return Math.round(
      machines.reduce((acc, m) => acc + m.efficiency, 0) / machines.length
    );
  });
