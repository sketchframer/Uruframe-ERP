import { useState, useEffect, useRef } from 'react';
import { MachineStatus, EventType } from '@/shared/types';
import type { Machine } from '@/shared/types';
import { useMachineStore } from '@/entities/machine';
import { useEventStore } from '@/entities/event';
import { useJobStore } from '@/entities/job';

export function useMachineSelection(
  currentUserId: string | undefined,
  machines: Machine[],
  initialMachineId?: string,
) {
  const eventStore = useEventStore.getState();
  const machineStore = useMachineStore.getState();
  const jobStore = useJobStore.getState();

  const [selectedMachineId, setSelectedMachineId] = useState<string>('');
  const [showAlertDetails, setShowAlertDetails] = useState(false);
  const prevMachineIdRef = useRef<string>('');
  const initialMachineIdAppliedRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!currentUserId) return;
    const assigned = machines.filter(m => m.operatorIds.includes(currentUserId));
    const selectionValid = selectedMachineId && machines.some(m => m.id === selectedMachineId);
    const urlChanged = initialMachineId !== undefined && initialMachineId !== initialMachineIdAppliedRef.current;
    const shouldSync = !selectedMachineId || !selectionValid || urlChanged;

    if (!shouldSync) return;

    if (assigned.length === 1) {
      setSelectedMachineId(assigned[0].id);
      prevMachineIdRef.current = assigned[0].id;
      initialMachineIdAppliedRef.current = assigned[0].id;
    } else if (initialMachineId) {
      setSelectedMachineId(initialMachineId);
      prevMachineIdRef.current = initialMachineId;
      initialMachineIdAppliedRef.current = initialMachineId;
    }
  }, [currentUserId, initialMachineId, machines, selectedMachineId]);

  const onLogEvent = (machineId: string, type: EventType, description: string, severity: 'INFO' | 'WARNING' | 'CRITICAL') => {
    eventStore.add({ machineId, type, description, severity });
  };

  const onStatusChange = (id: string, status: MachineStatus, reason?: string) => {
    machineStore.updateStatus(id, status, reason);
  };

  const onLoadJob = (machineId: string, jobId: string) => {
    machineStore.setCurrentJob(machineId, jobId);
    jobStore.updateStatus(jobId, 'IN_PROGRESS');
  };

  const handleMachineSwitch = (newMachineId: string) => {
    const currentMachine = machines.find(m => m.id === selectedMachineId);
    if (currentMachine && currentMachine.status === MachineStatus.RUNNING) {
      onStatusChange(currentMachine.id, MachineStatus.IDLE, 'Cambio de puesto automático');
      onLogEvent(currentMachine.id, EventType.STAGE_COMPLETE, 'Pausa automática por cambio de puesto', 'INFO');
    }

    setSelectedMachineId(newMachineId);
    prevMachineIdRef.current = newMachineId;
    setShowAlertDetails(false);
  };

  return {
    selectedMachineId,
    handleMachineSwitch,
    showAlertDetails,
    setShowAlertDetails,
    onStatusChange,
    onLogEvent,
    onLoadJob,
  };
}
