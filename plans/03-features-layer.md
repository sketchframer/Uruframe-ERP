# Phase 3: Features Layer

## Goal

Extract business logic from `App.tsx` into reusable, testable feature modules. Features orchestrate entities and contain use-case-specific logic.

---

## Features to Create

| Feature | Current Location | Responsibility |
|---------|------------------|----------------|
| `auth` | LoginView + App.tsx | PIN login, session, logout |
| `job-management` | App.tsx handleJobUpdate | Job completion, workflow sequencing |
| `logistics-messaging` | App.tsx triggerLogisticsMessages | Auto-notify dispatch team |
| `project-management` | ProjectsView | Project wizard, status transitions |
| `ai-assistant` | geminiService | Factory state analysis |

---

## Directory Structure

```
src/features/
├── auth/
│   ├── api/
│   │   └── authService.ts
│   ├── model/
│   │   └── useAuth.ts
│   ├── ui/
│   │   ├── PinPad.tsx
│   │   └── LoginForm.tsx
│   ├── lib/
│   │   └── pinValidation.ts
│   └── index.ts
├── job-management/
│   ├── model/
│   │   └── useJobActions.ts
│   ├── lib/
│   │   ├── jobWorkflow.ts
│   │   └── jobSequencing.ts
│   └── index.ts
├── logistics-messaging/
│   ├── model/
│   │   └── useLogisticsAlerts.ts
│   ├── lib/
│   │   └── messageRules.ts
│   └── index.ts
├── project-management/
│   ├── model/
│   │   └── useProjectActions.ts
│   ├── ui/
│   │   └── ProjectWizard/
│   │       ├── Step1Client.tsx
│   │       ├── Step2Jobs.tsx
│   │       ├── Step3Review.tsx
│   │       └── index.ts
│   ├── lib/
│   │   └── projectStatus.ts
│   └── index.ts
└── ai-assistant/
    ├── api/
    │   └── geminiService.ts
    ├── model/
    │   └── useAiAssistant.ts
    ├── ui/
    │   └── AiInsightPanel.tsx
    └── index.ts
```

---

## Feature: auth

### Current Logic (to extract from LoginView)

```typescript
// Currently in LoginView.tsx lines 14-40
const verifyPin = (currentPin: string) => {
  const user = users.find(u => u.pin === currentPin);
  if (user) {
    onLogin(user);
  } else {
    setError(true);
    // ...
  }
};
```

### New Implementation

```typescript
// src/features/auth/lib/pinValidation.ts

export function validatePinFormat(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}
```

```typescript
// src/features/auth/model/useAuth.ts

import { useCallback } from 'react';
import { useUserStore } from '@/entities/user';
import { validatePinFormat } from '../lib/pinValidation';

interface UseAuthReturn {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (pin: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

export function useAuth(): UseAuthReturn {
  const currentUser = useUserStore(s => s.currentUser);
  const loginAction = useUserStore(s => s.login);
  const logoutAction = useUserStore(s => s.logout);

  const login = useCallback(async (pin: string) => {
    if (!validatePinFormat(pin)) {
      return { success: false, error: 'PIN must be 4 digits' };
    }

    const user = await loginAction(pin);
    if (user) {
      return { success: true };
    }
    return { success: false, error: 'Invalid PIN' };
  }, [loginAction]);

  const logout = useCallback(() => {
    logoutAction();
  }, [logoutAction]);

  return {
    currentUser,
    isAuthenticated: currentUser !== null,
    login,
    logout,
  };
}
```

```typescript
// src/features/auth/ui/PinPad.tsx

import React, { useState } from 'react';
import { Delete } from 'lucide-react';

interface PinPadProps {
  onComplete: (pin: string) => void;
  error?: boolean;
}

export const PinPad: React.FC<PinPadProps> = ({ onComplete, error }) => {
  const [pin, setPin] = useState('');

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        onComplete(newPin);
        setPin('');
      }
    }
  };

  const handleClear = () => setPin('');

  return (
    <div className="bg-slate-800/50 backdrop-blur-md p-10 rounded-[3rem] border border-slate-700">
      {/* PIN dots */}
      <div className="flex justify-center gap-4 mb-10">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full transition-all duration-300 ${
              error
                ? 'bg-red-500 animate-bounce'
                : pin.length > i
                ? 'bg-blue-500 scale-125'
                : 'bg-slate-700'
            }`}
          />
        ))}
      </div>

      {/* Number grid */}
      <div className="grid grid-cols-3 gap-4">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
          <button
            key={num}
            onClick={() => handleKeyPress(num)}
            className="h-20 bg-slate-700 hover:bg-slate-600 active:bg-blue-600 
                       text-white font-black text-2xl rounded-2xl transition-all 
                       shadow-lg active:scale-95 border-b-4 border-slate-900"
          >
            {num}
          </button>
        ))}
        <div />
        <button
          onClick={() => handleKeyPress('0')}
          className="h-20 bg-slate-700 hover:bg-slate-600 active:bg-blue-600 
                     text-white font-black text-2xl rounded-2xl transition-all"
        >
          0
        </button>
        <button
          onClick={handleClear}
          className="h-20 bg-slate-900 hover:bg-slate-900/50 text-slate-400 
                     font-black rounded-2xl flex items-center justify-center"
        >
          <Delete size={32} />
        </button>
      </div>
    </div>
  );
};
```

```typescript
// src/features/auth/index.ts

export { useAuth } from './model/useAuth';
export { PinPad } from './ui/PinPad';
export { validatePinFormat } from './lib/pinValidation';
```

---

## Feature: job-management

### Current Logic (to extract from App.tsx)

```typescript
// App.tsx lines ~140-200: handleJobUpdate
const handleJobUpdate = (jobId: string, qty: number, isComplete: boolean, operatorNotes?: string) => {
  // Update job
  // Log event
  // Sequence CC -> Panelizado
  // Check project ready for delivery
  // Trigger logistics messages
};
```

### New Implementation

```typescript
// src/features/job-management/lib/jobSequencing.ts

import type { Job, Machine } from '@/shared/types';

/**
 * Determines if all conformadora jobs are complete for a project
 */
export function areAllConformadoraJobsComplete(
  jobs: Job[],
  projectId: string
): boolean {
  const projectJobs = jobs.filter(j => j.projectId === projectId);
  const ccJobs = projectJobs.filter(j => j.machineType === 'CONFORMADORA');
  return ccJobs.length > 0 && ccJobs.every(j => j.status === 'COMPLETED');
}

/**
 * Determines if all jobs for a project are complete
 */
export function areAllJobsComplete(jobs: Job[], projectId: string): boolean {
  const projectJobs = jobs.filter(j => j.projectId === projectId);
  return projectJobs.length > 0 && projectJobs.every(j => j.status === 'COMPLETED');
}

/**
 * Creates a panelizado job for a project
 */
export function createPanelizadoJob(
  projectId: string,
  projectName: string,
  panelizadoMachineId: string
): Omit<Job, 'id'> {
  return {
    projectId,
    productName: `PANELIZADO: ${projectName}`,
    targetQuantity: 1,
    completedQuantity: 0,
    unit: 'proyecto',
    machineType: 'PANELIZADO',
    status: 'PENDING',
    assignedMachineId: panelizadoMachineId,
    priorityIndex: 99,
  };
}
```

```typescript
// src/features/job-management/model/useJobActions.ts

import { useCallback } from 'react';
import { useJobStore } from '@/entities/job';
import { useMachineStore } from '@/entities/machine';
import { useProjectStore } from '@/entities/project';
import { useEventStore } from '@/entities/event';
import { useAlertStore } from '@/entities/alert';
import { MachineStatus, EventType } from '@/shared/types';
import {
  areAllConformadoraJobsComplete,
  areAllJobsComplete,
  createPanelizadoJob,
} from '../lib/jobSequencing';

interface JobUpdateResult {
  projectCompleted: boolean;
  panelizadoCreated: boolean;
}

export function useJobActions() {
  const jobs = useJobStore(s => s.jobs);
  const updateJobProgress = useJobStore(s => s.updateProgress);
  const completeJob = useJobStore(s => s.complete);
  const createJob = useJobStore(s => s.create);
  
  const machines = useMachineStore(s => s.machines);
  const setMachineCurrentJob = useMachineStore(s => s.setCurrentJob);
  const updateMachineStatus = useMachineStore(s => s.updateStatus);
  
  const projects = useProjectStore(s => s.projects);
  
  const addEvent = useEventStore(s => s.add);
  const addAlert = useAlertStore(s => s.add);

  const handleJobCompletion = useCallback(async (
    jobId: string,
    operatorNotes?: string,
    operatorName?: string
  ): Promise<JobUpdateResult> => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return { projectCompleted: false, panelizadoCreated: false };

    const result: JobUpdateResult = {
      projectCompleted: false,
      panelizadoCreated: false,
    };

    // 1. Complete the job
    await completeJob(jobId, operatorNotes);

    // 2. Log event
    await addEvent({
      machineId: job.assignedMachineId || 'TALLER',
      type: EventType.JOB_COMPLETE,
      description: `Finalizado: ${job.productName}${operatorName ? ` por ${operatorName}` : ''}`,
      severity: 'INFO',
    });

    // 3. Reset machine status
    if (job.assignedMachineId) {
      await updateMachineStatus(job.assignedMachineId, MachineStatus.IDLE);
      await setMachineCurrentJob(job.assignedMachineId, null);
    }

    // 4. Check CC -> Panelizado sequencing
    if (job.machineType === 'CONFORMADORA') {
      const allJobs = [...jobs.map(j => j.id === jobId ? { ...j, status: 'COMPLETED' as const } : j)];
      
      if (areAllConformadoraJobsComplete(allJobs, job.projectId)) {
        const panelizadoMachine = machines.find(m => m.type === 'PANELIZADO');
        const project = projects.find(p => p.id === job.projectId);
        
        if (panelizadoMachine && project) {
          const existingPanelJob = jobs.find(
            j => j.projectId === job.projectId && j.machineType === 'PANELIZADO'
          );
          
          if (!existingPanelJob) {
            await createJob(createPanelizadoJob(
              job.projectId,
              project.name,
              panelizadoMachine.id
            ));
            result.panelizadoCreated = true;
          }
        }
      }
    }

    // 5. Check if project is complete
    const updatedJobs = [...jobs.map(j => j.id === jobId ? { ...j, status: 'COMPLETED' as const } : j)];
    if (areAllJobsComplete(updatedJobs, job.projectId)) {
      const project = projects.find(p => p.id === job.projectId);
      if (project) {
        await addAlert({
          type: 'READY_FOR_DELIVERY',
          message: `PROYECTO LISTO: ${project.name} está pronto para despacho.`,
          severity: 'HIGH',
          relatedId: project.id,
        });
        result.projectCompleted = true;
      }
    }

    return result;
  }, [jobs, machines, projects, completeJob, addEvent, updateMachineStatus, setMachineCurrentJob, createJob, addAlert]);

  const updateProgress = useCallback(async (
    jobId: string,
    completedQuantity: number
  ) => {
    await updateJobProgress(jobId, completedQuantity);
  }, [updateJobProgress]);

  const loadJobOnMachine = useCallback(async (
    machineId: string,
    jobId: string
  ) => {
    await setMachineCurrentJob(machineId, jobId);
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      await useJobStore.getState().updateStatus(jobId, 'IN_PROGRESS');
    }
  }, [jobs, setMachineCurrentJob]);

  return {
    handleJobCompletion,
    updateProgress,
    loadJobOnMachine,
  };
}
```

```typescript
// src/features/job-management/index.ts

export { useJobActions } from './model/useJobActions';
export {
  areAllConformadoraJobsComplete,
  areAllJobsComplete,
  createPanelizadoJob,
} from './lib/jobSequencing';
```

---

## Feature: logistics-messaging

### Current Logic (to extract from App.tsx)

```typescript
// App.tsx lines 115-135
const triggerLogisticsMessages = (project: Project) => {
  const loadingMachine = machines.find(m => m.type === 'CARGA');
  if (!loadingMachine || loadingMachine.operatorIds.length === 0) return;

  const today = new Date().toISOString().split('T')[0];
  if (project.deadline === today) {
    // Send messages to dispatch operators
  }
};
```

### New Implementation

```typescript
// src/features/logistics-messaging/lib/messageRules.ts

import type { Project, Machine, SystemMessage } from '@/shared/types';

export function shouldNotifyDispatch(
  project: Project,
  today: string
): boolean {
  return project.deadline === today;
}

export function createDispatchMessage(
  project: Project,
  operatorId: string
): Omit<SystemMessage, 'id'> {
  return {
    from: 'LOGÍSTICA: CARGA DEL DÍA',
    to: operatorId,
    content: `INSTRUCCIÓN DE CARGA: El proyecto ${project.name} está finalizado y debe despacharse HOY. Repórtate en la zona de carga inmediatamente.`,
    timestamp: new Date().toISOString(),
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
    m =>
      m.to === operatorId &&
      m.content.includes(projectName) &&
      m.timestamp.startsWith(today)
  );
}
```

```typescript
// src/features/logistics-messaging/model/useLogisticsAlerts.ts

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
  const machines = useMachineStore(s => s.machines);
  const messages = useMessageStore(s => s.messages);
  const addMessage = useMessageStore(s => s.add);

  const notifyDispatchTeam = useCallback(async (project: Project) => {
    const loadingMachine = machines.find(m => m.type === 'CARGA');
    if (!loadingMachine || loadingMachine.operatorIds.length === 0) {
      return { notified: false, reason: 'No dispatch team assigned' };
    }

    const today = new Date().toISOString().split('T')[0];

    if (!shouldNotifyDispatch(project, today)) {
      return { notified: false, reason: 'Project not due today' };
    }

    const notifiedOperators: string[] = [];

    for (const operatorId of loadingMachine.operatorIds) {
      if (!hasAlreadyNotified(messages, project.name, operatorId, today)) {
        await addMessage(createDispatchMessage(project, operatorId));
        notifiedOperators.push(operatorId);
      }
    }

    return {
      notified: notifiedOperators.length > 0,
      operators: notifiedOperators,
    };
  }, [machines, messages, addMessage]);

  return {
    notifyDispatchTeam,
  };
}
```

```typescript
// src/features/logistics-messaging/index.ts

export { useLogisticsAlerts } from './model/useLogisticsAlerts';
export {
  shouldNotifyDispatch,
  createDispatchMessage,
  hasAlreadyNotified,
} from './lib/messageRules';
```

---

## Feature: ai-assistant

### Move and Enhance geminiService

```typescript
// src/features/ai-assistant/api/geminiService.ts

import { GoogleGenAI } from '@google/genai';
import type { Machine, FactoryEvent, Job } from '@/shared/types';

const getAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export interface FactoryContext {
  machines: Pick<Machine, 'id' | 'name' | 'status' | 'efficiency'>[];
  recentEvents: FactoryEvent[];
  activeJobs: Job[];
}

export async function analyzeFactoryState(
  context: FactoryContext,
  userQuery: string
): Promise<string> {
  const ai = getAiClient();

  const prompt = `
    You are an AI Plant Manager for a structure and profile factory.
    Here is the current real-time snapshot of the factory:
    ${JSON.stringify(context, null, 2)}

    User Query: "${userQuery}"

    Provide a concise, professional, and actionable insight or answer.
    If asking about problems, look for ERROR status or LOW efficiency.
    Keep it under 100 words.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || 'No insights available at the moment.';
  } catch (error) {
    console.error('Gemini API Error:', error);
    return 'Unable to analyze factory data currently. Please check API connection.';
  }
}
```

```typescript
// src/features/ai-assistant/model/useAiAssistant.ts

import { useState, useCallback } from 'react';
import { useMachineStore } from '@/entities/machine';
import { useEventStore } from '@/entities/event';
import { useJobStore } from '@/entities/job';
import { analyzeFactoryState } from '../api/geminiService';

export function useAiAssistant() {
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const machines = useMachineStore(s => s.machines);
  const events = useEventStore(s => s.events);
  const jobs = useJobStore(s => s.jobs);

  const ask = useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const context = {
        machines: machines.map(m => ({
          id: m.id,
          name: m.name,
          status: m.status,
          efficiency: m.efficiency,
        })),
        recentEvents: events.slice(0, 15),
        activeJobs: jobs.filter(j => j.status === 'IN_PROGRESS'),
      };

      const result = await analyzeFactoryState(context, query);
      setResponse(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [machines, events, jobs]);

  const clear = useCallback(() => {
    setResponse(null);
    setError(null);
  }, []);

  return {
    response,
    isLoading,
    error,
    ask,
    clear,
  };
}
```

```typescript
// src/features/ai-assistant/index.ts

export { useAiAssistant } from './model/useAiAssistant';
export { analyzeFactoryState } from './api/geminiService';
```

---

## Migration Checklist

### Step 1: Create auth feature
- [ ] Create `features/auth/lib/pinValidation.ts`
- [ ] Create `features/auth/model/useAuth.ts`
- [ ] Create `features/auth/ui/PinPad.tsx`
- [ ] Create `features/auth/index.ts`
- [ ] Update LoginView to use `useAuth` and `PinPad`

### Step 2: Create job-management feature
- [ ] Create `features/job-management/lib/jobSequencing.ts`
- [ ] Create `features/job-management/model/useJobActions.ts`
- [ ] Create `features/job-management/index.ts`
- [ ] Update OperatorTerminal to use `useJobActions`

### Step 3: Create logistics-messaging feature
- [ ] Create `features/logistics-messaging/lib/messageRules.ts`
- [ ] Create `features/logistics-messaging/model/useLogisticsAlerts.ts`
- [ ] Create `features/logistics-messaging/index.ts`
- [ ] Integrate with job-management (call on project completion)

### Step 4: Create ai-assistant feature
- [ ] Move `services/geminiService.ts` to `features/ai-assistant/api/`
- [ ] Create `features/ai-assistant/model/useAiAssistant.ts`
- [ ] Create `features/ai-assistant/index.ts`
- [ ] Delete old `services/` folder

### Step 5: Clean up App.tsx
- [ ] Remove `handleJobUpdate` function
- [ ] Remove `triggerLogisticsMessages` function
- [ ] Verify all business logic is in features

---

## Testing Features

Each feature should be testable in isolation:

```typescript
// features/job-management/lib/jobSequencing.test.ts

import { areAllConformadoraJobsComplete } from './jobSequencing';

describe('jobSequencing', () => {
  describe('areAllConformadoraJobsComplete', () => {
    it('returns true when all CC jobs are completed', () => {
      const jobs = [
        { id: '1', projectId: 'P1', machineType: 'CONFORMADORA', status: 'COMPLETED' },
        { id: '2', projectId: 'P1', machineType: 'CONFORMADORA', status: 'COMPLETED' },
      ];
      expect(areAllConformadoraJobsComplete(jobs, 'P1')).toBe(true);
    });

    it('returns false when some CC jobs are pending', () => {
      const jobs = [
        { id: '1', projectId: 'P1', machineType: 'CONFORMADORA', status: 'COMPLETED' },
        { id: '2', projectId: 'P1', machineType: 'CONFORMADORA', status: 'PENDING' },
      ];
      expect(areAllConformadoraJobsComplete(jobs, 'P1')).toBe(false);
    });
  });
});
```

---

## Next Phase

After completing this phase, proceed to: `04-routing-tanstack.md`
