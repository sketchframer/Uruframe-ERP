# Phase 2: Entities Layer

## Goal

Create domain-specific Zustand stores for each entity, using the repository abstraction from Phase 1. After this phase, `App.tsx` will no longer hold any domain state.

---

## Entities to Create

| Entity | Store | Priority | Complexity |
|--------|-------|----------|------------|
| machine | `useMachineStore` | 1 | Medium |
| user | `useUserStore` | 2 | Low |
| job | `useJobStore` | 3 | High |
| project | `useProjectStore` | 4 | Medium |
| client | `useClientStore` | 5 | Low |
| inventory | `useInventoryStore` | 6 | Low |
| alert | `useAlertStore` | 7 | Low |
| message | `useMessageStore` | 8 | Low |
| event | `useEventStore` | 9 | Low |

---

## Directory Structure

```
src/entities/
├── machine/
│   ├── api/
│   │   └── machineRepository.ts
│   ├── model/
│   │   ├── machineStore.ts
│   │   └── machineSelectors.ts
│   ├── ui/
│   │   └── MachineCard.tsx
│   └── index.ts
├── job/
│   ├── api/
│   │   └── jobRepository.ts
│   ├── model/
│   │   ├── jobStore.ts
│   │   └── jobSelectors.ts
│   ├── ui/
│   │   ├── JobCard.tsx
│   │   └── JobStatusBadge.tsx
│   └── index.ts
├── project/
│   ├── api/
│   │   └── projectRepository.ts
│   ├── model/
│   │   ├── projectStore.ts
│   │   └── projectSelectors.ts
│   ├── ui/
│   │   └── ProjectCard.tsx
│   └── index.ts
├── user/
│   ├── api/
│   │   └── userRepository.ts
│   ├── model/
│   │   └── userStore.ts
│   └── index.ts
├── client/
│   ├── api/
│   │   └── clientRepository.ts
│   ├── model/
│   │   └── clientStore.ts
│   └── index.ts
├── inventory/
│   ├── api/
│   │   └── inventoryRepository.ts
│   ├── model/
│   │   └── inventoryStore.ts
│   ├── ui/
│   │   └── InventoryItemRow.tsx
│   └── index.ts
├── alert/
│   ├── api/
│   │   └── alertRepository.ts
│   ├── model/
│   │   └── alertStore.ts
│   ├── ui/
│   │   └── AlertBadge.tsx
│   └── index.ts
├── message/
│   ├── api/
│   │   └── messageRepository.ts
│   ├── model/
│   │   └── messageStore.ts
│   └── index.ts
└── event/
    ├── api/
    │   └── eventRepository.ts
    ├── model/
    │   └── eventStore.ts
    └── index.ts
```

---

## Install Dependencies

```bash
npm install zustand
```

---

## Entity Implementation Pattern

### 1. Repository (api/)

```typescript
// src/entities/machine/api/machineRepository.ts

import { createLocalStorageRepository } from '@/shared/api/localStorageRepository';
import type { Machine } from '@/shared/types';

export const machineRepository = createLocalStorageRepository<Machine>('machines');
```

### 2. Zustand Store (model/)

```typescript
// src/entities/machine/model/machineStore.ts

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { Machine, MachineStatus } from '@/shared/types';
import { machineRepository } from '../api/machineRepository';
import { INITIAL_MACHINES } from '@/shared/constants/seeds';

interface MachineState {
  machines: Machine[];
  isLoading: boolean;
  error: string | null;
}

interface MachineActions {
  // Queries
  fetchAll: () => Promise<void>;
  getById: (id: string) => Machine | undefined;
  getByOperator: (operatorId: string) => Machine[];
  getByType: (type: Machine['type']) => Machine[];
  
  // Mutations
  updateStatus: (id: string, status: MachineStatus, reason?: string) => Promise<void>;
  assignOperator: (machineId: string, operatorId: string) => Promise<void>;
  removeOperator: (machineId: string, operatorId: string) => Promise<void>;
  setCurrentJob: (machineId: string, jobId: string | null) => Promise<void>;
  updateEfficiency: (id: string, efficiency: number) => Promise<void>;
  create: (machine: Omit<Machine, 'id'>) => Promise<Machine>;
  update: (id: string, updates: Partial<Machine>) => Promise<void>;
  delete: (id: string) => Promise<void>;
  
  // Initialization
  hydrate: () => Promise<void>;
}

type MachineStore = MachineState & MachineActions;

export const useMachineStore = create<MachineStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    machines: [],
    isLoading: false,
    error: null,

    // Queries
    fetchAll: async () => {
      set({ isLoading: true, error: null });
      try {
        const machines = await machineRepository.getAll();
        set({ machines, isLoading: false });
      } catch (error) {
        set({ error: (error as Error).message, isLoading: false });
      }
    },

    getById: (id) => {
      return get().machines.find(m => m.id === id);
    },

    getByOperator: (operatorId) => {
      return get().machines.filter(m => m.operatorIds.includes(operatorId));
    },

    getByType: (type) => {
      return get().machines.filter(m => m.type === type);
    },

    // Mutations
    updateStatus: async (id, status, reason) => {
      const updates: Partial<Machine> = { status };
      if (reason) updates.maintenanceReason = reason;
      
      await machineRepository.update(id, updates);
      set(state => ({
        machines: state.machines.map(m =>
          m.id === id ? { ...m, ...updates } : m
        ),
      }));
    },

    assignOperator: async (machineId, operatorId) => {
      const machine = get().getById(machineId);
      if (!machine) return;
      
      const operatorIds = [...machine.operatorIds, operatorId];
      await machineRepository.update(machineId, { operatorIds });
      set(state => ({
        machines: state.machines.map(m =>
          m.id === machineId ? { ...m, operatorIds } : m
        ),
      }));
    },

    removeOperator: async (machineId, operatorId) => {
      const machine = get().getById(machineId);
      if (!machine) return;
      
      const operatorIds = machine.operatorIds.filter(id => id !== operatorId);
      await machineRepository.update(machineId, { operatorIds });
      set(state => ({
        machines: state.machines.map(m =>
          m.id === machineId ? { ...m, operatorIds } : m
        ),
      }));
    },

    setCurrentJob: async (machineId, jobId) => {
      await machineRepository.update(machineId, { currentJobId: jobId });
      set(state => ({
        machines: state.machines.map(m =>
          m.id === machineId ? { ...m, currentJobId: jobId } : m
        ),
      }));
    },

    updateEfficiency: async (id, efficiency) => {
      await machineRepository.update(id, { efficiency });
      set(state => ({
        machines: state.machines.map(m =>
          m.id === id ? { ...m, efficiency } : m
        ),
      }));
    },

    create: async (machine) => {
      const created = await machineRepository.create(machine);
      set(state => ({ machines: [...state.machines, created] }));
      return created;
    },

    update: async (id, updates) => {
      await machineRepository.update(id, updates);
      set(state => ({
        machines: state.machines.map(m =>
          m.id === id ? { ...m, ...updates } : m
        ),
      }));
    },

    delete: async (id) => {
      await machineRepository.delete(id);
      set(state => ({
        machines: state.machines.filter(m => m.id !== id),
      }));
    },

    // Initialization with seeds
    hydrate: async () => {
      set({ isLoading: true });
      let machines = await machineRepository.getAll();
      
      // Seed if empty
      if (machines.length === 0) {
        for (const machine of INITIAL_MACHINES) {
          await machineRepository.create(machine);
        }
        machines = INITIAL_MACHINES;
      }
      
      set({ machines, isLoading: false });
    },
  }))
);
```

### 3. Selectors (model/)

```typescript
// src/entities/machine/model/machineSelectors.ts

import { useMachineStore } from './machineStore';
import { MachineStatus } from '@/shared/types';

// Computed selectors for common queries
export const useActiveMachines = () =>
  useMachineStore(state => state.machines.filter(m => m.isActive));

export const useRunningMachines = () =>
  useMachineStore(state =>
    state.machines.filter(m => m.status === MachineStatus.RUNNING)
  );

export const useMachinesByType = (type: string) =>
  useMachineStore(state => state.machines.filter(m => m.type === type));

export const useAverageOee = () =>
  useMachineStore(state => {
    const machines = state.machines;
    if (machines.length === 0) return 0;
    return Math.round(
      machines.reduce((acc, m) => acc + m.efficiency, 0) / machines.length
    );
  });

export const useMachineWithOperators = (machineId: string) =>
  useMachineStore(state => {
    const machine = state.machines.find(m => m.id === machineId);
    return machine;
  });
```

### 4. UI Components (ui/)

```typescript
// src/entities/machine/ui/MachineCard.tsx
// Move from components/MachineCard.tsx with minimal changes
```

### 5. Public API (index.ts)

```typescript
// src/entities/machine/index.ts

// Store
export { useMachineStore } from './model/machineStore';

// Selectors
export {
  useActiveMachines,
  useRunningMachines,
  useMachinesByType,
  useAverageOee,
} from './model/machineSelectors';

// UI
export { MachineCard } from './ui/MachineCard';

// Types (re-export for convenience)
export type { Machine, MachineStatus, MachineType } from '@/shared/types';
```

---

## Job Store (Most Complex)

```typescript
// src/entities/job/model/jobStore.ts

import { create } from 'zustand';
import type { Job } from '@/shared/types';
import { jobRepository } from '../api/jobRepository';

interface JobState {
  jobs: Job[];
  isLoading: boolean;
}

interface JobActions {
  fetchAll: () => Promise<void>;
  getById: (id: string) => Job | undefined;
  getByProject: (projectId: string) => Job[];
  getByMachine: (machineId: string) => Job[];
  getQueue: (machineId: string) => Job[];
  
  create: (job: Omit<Job, 'id'>) => Promise<Job>;
  updateProgress: (id: string, completedQuantity: number) => Promise<void>;
  complete: (id: string, operatorNotes?: string) => Promise<void>;
  updateStatus: (id: string, status: Job['status']) => Promise<void>;
  delete: (id: string) => Promise<void>;
  
  hydrate: () => Promise<void>;
}

export const useJobStore = create<JobState & JobActions>()((set, get) => ({
  jobs: [],
  isLoading: false,

  fetchAll: async () => {
    set({ isLoading: true });
    const jobs = await jobRepository.getAll();
    set({ jobs, isLoading: false });
  },

  getById: (id) => get().jobs.find(j => j.id === id),

  getByProject: (projectId) =>
    get().jobs.filter(j => j.projectId === projectId),

  getByMachine: (machineId) =>
    get().jobs.filter(j => j.assignedMachineId === machineId),

  getQueue: (machineId) =>
    get().jobs
      .filter(j =>
        j.assignedMachineId === machineId &&
        j.status !== 'COMPLETED'
      )
      .sort((a, b) => (a.priorityIndex || 0) - (b.priorityIndex || 0)),

  create: async (job) => {
    const created = await jobRepository.create({
      ...job,
      completedQuantity: 0,
      status: 'PENDING',
    });
    set(state => ({ jobs: [...state.jobs, created] }));
    return created;
  },

  updateProgress: async (id, completedQuantity) => {
    await jobRepository.update(id, { completedQuantity });
    set(state => ({
      jobs: state.jobs.map(j =>
        j.id === id ? { ...j, completedQuantity } : j
      ),
    }));
  },

  complete: async (id, operatorNotes) => {
    const job = get().getById(id);
    if (!job) return;

    const updates: Partial<Job> = {
      status: 'COMPLETED',
      completedQuantity: job.targetQuantity,
      completedAt: new Date().toISOString(),
      operatorNotes,
    };

    await jobRepository.update(id, updates);
    set(state => ({
      jobs: state.jobs.map(j => (j.id === id ? { ...j, ...updates } : j)),
    }));
  },

  updateStatus: async (id, status) => {
    await jobRepository.update(id, { status });
    set(state => ({
      jobs: state.jobs.map(j => (j.id === id ? { ...j, status } : j)),
    }));
  },

  delete: async (id) => {
    await jobRepository.delete(id);
    set(state => ({ jobs: state.jobs.filter(j => j.id !== id) }));
  },

  hydrate: async () => {
    set({ isLoading: true });
    const jobs = await jobRepository.getAll();
    set({ jobs, isLoading: false });
  },
}));
```

---

## User Store (with Auth)

```typescript
// src/entities/user/model/userStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/shared/types';
import { userRepository } from '../api/userRepository';
import { INITIAL_USERS } from '@/shared/constants/seeds';

interface UserState {
  users: User[];
  currentUser: User | null;
  isLoading: boolean;
}

interface UserActions {
  fetchAll: () => Promise<void>;
  login: (pin: string) => Promise<User | null>;
  logout: () => void;
  create: (user: Omit<User, 'id'>) => Promise<User>;
  update: (id: string, updates: Partial<User>) => Promise<void>;
  delete: (id: string) => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useUserStore = create<UserState & UserActions>()(
  persist(
    (set, get) => ({
      users: [],
      currentUser: null,
      isLoading: false,

      fetchAll: async () => {
        const users = await userRepository.getAll();
        set({ users });
      },

      login: async (pin) => {
        const users = get().users;
        const user = users.find(u => u.pin === pin);
        if (user) {
          set({ currentUser: user });
          return user;
        }
        return null;
      },

      logout: () => {
        set({ currentUser: null });
      },

      create: async (user) => {
        const created = await userRepository.create(user);
        set(state => ({ users: [...state.users, created] }));
        return created;
      },

      update: async (id, updates) => {
        await userRepository.update(id, updates);
        set(state => ({
          users: state.users.map(u => (u.id === id ? { ...u, ...updates } : u)),
        }));
      },

      delete: async (id) => {
        await userRepository.delete(id);
        set(state => ({ users: state.users.filter(u => u.id !== id) }));
      },

      hydrate: async () => {
        set({ isLoading: true });
        let users = await userRepository.getAll();

        if (users.length === 0) {
          for (const user of INITIAL_USERS) {
            await userRepository.create(user);
          }
          users = INITIAL_USERS;
        }

        set({ users, isLoading: false });
      },
    }),
    {
      name: 'structura-user-session',
      partialize: (state) => ({ currentUser: state.currentUser }),
    }
  )
);
```

---

## Migration Checklist

### Step 1: Install Zustand
- [ ] `npm install zustand`

### Step 2: Create Machine Entity (start here)
- [ ] Create `entities/machine/api/machineRepository.ts`
- [ ] Create `entities/machine/model/machineStore.ts`
- [ ] Create `entities/machine/model/machineSelectors.ts`
- [ ] Move `MachineCard.tsx` to `entities/machine/ui/`
- [ ] Create `entities/machine/index.ts`
- [ ] Test: Machines load and display

### Step 3: Create User Entity
- [ ] Create `entities/user/api/userRepository.ts`
- [ ] Create `entities/user/model/userStore.ts`
- [ ] Create `entities/user/index.ts`
- [ ] Test: Login works

### Step 4: Create Job Entity
- [ ] Create `entities/job/api/jobRepository.ts`
- [ ] Create `entities/job/model/jobStore.ts`
- [ ] Create `entities/job/index.ts`
- [ ] Test: Jobs load, progress updates work

### Step 5: Create Remaining Entities
- [ ] Project entity
- [ ] Client entity
- [ ] Inventory entity
- [ ] Alert entity
- [ ] Message entity
- [ ] Event entity

### Step 6: Update Views to Use Stores
- [ ] DashboardView: Replace props with store hooks
- [ ] OperatorTerminal: Replace props with store hooks
- [ ] ProjectsView: Replace props with store hooks
- [ ] OrdersView: Replace props with store hooks
- [ ] InventoryView: Replace props with store hooks
- [ ] ClientsView: Replace props with store hooks
- [ ] SettingsView: Replace props with store hooks

### Step 7: Clean Up App.tsx
- [ ] Remove all useState for domain data
- [ ] Remove all handler functions (moved to stores)
- [ ] Keep only: routing state, providers

---

## Usage Example (After Migration)

```typescript
// Before: DashboardView receives 12 props
<DashboardView
  machines={machines}
  events={events}
  jobs={jobs}
  projects={projects}
  alerts={alerts}
  messages={messages}
  users={users}
  onNavigateToMachine={...}
  onEditMachine={...}
  onAlertClick={...}
/>

// After: DashboardView uses stores directly
export const DashboardView = () => {
  const machines = useMachineStore(s => s.machines);
  const jobs = useJobStore(s => s.jobs);
  const projects = useProjectStore(s => s.projects);
  const alerts = useAlertStore(s => s.alerts);
  const navigate = useNavigate();

  // No props needed!
  return (
    <div>
      {machines.map(m => (
        <MachineCard
          key={m.id}
          machine={m}
          onClick={() => navigate(`/operator/${m.id}`)}
        />
      ))}
    </div>
  );
};
```

---

## Next Phase

After completing this phase, proceed to: `03-features-layer.md`
