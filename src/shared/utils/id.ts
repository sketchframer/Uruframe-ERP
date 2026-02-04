export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function generateJobId(): string {
  return generateId('JOB');
}

export function generateProjectId(): string {
  return generateId('PRJ');
}

export function generateEventId(): string {
  return generateId('EV');
}

export function generateAlertId(): string {
  return generateId('ALERT');
}

export function generateMessageId(): string {
  return generateId('MSG');
}
