import type { Project, SystemMessage } from '@/shared/types';

export function shouldNotifyDispatch(project: Project, today: string): boolean {
  return project.deadline === today;
}

/** Payload for message store add (no id, no timestamp). */
export function createDispatchMessage(
  project: Project,
  operatorId: string
): Omit<SystemMessage, 'id' | 'timestamp'> {
  return {
    from: 'LOGÍSTICA: CARGA DEL DÍA',
    to: operatorId,
    content: `INSTRUCCIÓN DE CARGA: El proyecto ${project.name} está finalizado y debe despacharse HOY. Repórtate en la zona de carga inmediatamente.`,
    isRead: false,
  };
}

export function hasAlreadyNotified(
  messages: SystemMessage[],
  projectName: string,
  operatorId: string,
  today: string
): boolean {
  return messages.some(
    (m) =>
      m.to === operatorId &&
      m.content.includes(projectName) &&
      m.timestamp.startsWith(today)
  );
}
