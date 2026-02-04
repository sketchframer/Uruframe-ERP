import { useCallback } from 'react';
import { useMachineStore } from '@/entities/machine';
import { useMessageStore } from '@/entities/message';
import type { Project } from '@/shared/types';
import {
  shouldNotifyDispatch,
  createDispatchMessage,
  hasAlreadyNotified,
} from '../lib/messageRules';

export function useLogisticsAlerts() {
  const machines = useMachineStore((s) => s.machines);
  const messages = useMessageStore((s) => s.messages);
  const addMessage = useMessageStore((s) => s.add);

  const notifyDispatchTeam = useCallback(
    async (project: Project) => {
      const loadingMachine = machines.find((m) => m.type === 'CARGA');
      if (!loadingMachine || loadingMachine.operatorIds.length === 0) {
        return { notified: false, reason: 'No dispatch team assigned' };
      }

      const today = new Date().toISOString().split('T')[0];

      if (!shouldNotifyDispatch(project, today)) {
        return { notified: false, reason: 'Project not due today' };
      }

      const notifiedOperators: string[] = [];

      for (const operatorId of loadingMachine.operatorIds) {
        if (
          !hasAlreadyNotified(messages, project.name, operatorId, today)
        ) {
          await addMessage(createDispatchMessage(project, operatorId));
          notifiedOperators.push(operatorId);
        }
      }

      return {
        notified: notifiedOperators.length > 0,
        operators: notifiedOperators,
      };
    },
    [machines, messages, addMessage]
  );

  return { notifyDispatchTeam };
}
