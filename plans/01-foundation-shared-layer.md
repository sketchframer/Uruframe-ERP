# Phase 1: Foundation - Shared Layer

## Goal

Create the `shared/` layer with:
- Repository abstraction (localStorage now, API later)
- Type definitions (moved from `types.ts`)
- Constants and seed data
- Base UI components
- Utility functions

---

## Directory Structure to Create

```
src/
└── shared/
    ├── api/
    │   ├── storage.ts              # localStorage wrapper
    │   ├── repository.ts           # Generic interface
    │   └── localStorageRepository.ts
    ├── types/
    │   ├── index.ts                # Re-export all
    │   ├── machine.types.ts
    │   ├── job.types.ts
    │   ├── project.types.ts
    │   ├── user.types.ts
    │   ├── client.types.ts
    │   ├── inventory.types.ts
    │   ├── alert.types.ts
    │   ├── message.types.ts
    │   └── event.types.ts
    ├── constants/
    │   ├── index.ts
    │   ├── storage.ts              # STORAGE_KEY
    │   └── seeds.ts                # INITIAL_MACHINES, INITIAL_USERS
    ├── ui/
    │   ├── index.ts
    │   ├── Button.tsx
    │   ├── Input.tsx
    │   ├── Modal.tsx
    │   ├── Card.tsx
    │   └── Badge.tsx
    ├── hooks/
    │   ├── index.ts
    │   └── useLocalStorage.ts
    ├── lib/
    │   ├── index.ts
    │   ├── cn.ts                   # className utility
    │   └── formatters.ts           # Date, number formatters
    └── utils/
        ├── index.ts
        └── id.ts                   # ID generation
```

---

## Files to Create

### 1. Repository Interface

```typescript
// src/shared/api/repository.ts

export interface Repository<T extends { id: string }> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  create(item: Omit<T, 'id'> & { id?: string }): Promise<T>;
  update(id: string, updates: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
  query(predicate: (item: T) => boolean): Promise<T[]>;
}
```

### 2. localStorage Wrapper

```typescript
// src/shared/api/storage.ts

import { STORAGE_KEY } from '../constants/storage';

export interface StorageData {
  machines: unknown[];
  jobs: unknown[];
  projects: unknown[];
  users: unknown[];
  clients: unknown[];
  inventory: unknown[];
  alerts: unknown[];
  messages: unknown[];
  events: unknown[];
  projectAccessories: unknown[];
}

const defaultData: StorageData = {
  machines: [],
  jobs: [],
  projects: [],
  users: [],
  clients: [],
  inventory: [],
  alerts: [],
  messages: [],
  events: [],
  projectAccessories: [],
};

export const storage = {
  load(): StorageData {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...defaultData, ...JSON.parse(saved) } : defaultData;
    } catch {
      console.error('Failed to load storage');
      return defaultData;
    }
  },

  save(data: StorageData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save storage', error);
    }
  },

  getCollection<T>(key: keyof StorageData): T[] {
    const data = this.load();
    return (data[key] as T[]) || [];
  },

  setCollection<T>(key: keyof StorageData, items: T[]): void {
    const data = this.load();
    data[key] = items as unknown[];
    this.save(data);
  },
};
```

### 3. Generic localStorage Repository

```typescript
// src/shared/api/localStorageRepository.ts

import type { Repository } from './repository';
import { storage, StorageData } from './storage';

export function createLocalStorageRepository<T extends { id: string }>(
  collectionKey: keyof StorageData
): Repository<T> {
  return {
    async getAll(): Promise<T[]> {
      return storage.getCollection<T>(collectionKey);
    },

    async getById(id: string): Promise<T | null> {
      const items = storage.getCollection<T>(collectionKey);
      return items.find(item => item.id === id) || null;
    },

    async create(item: Omit<T, 'id'> & { id?: string }): Promise<T> {
      const items = storage.getCollection<T>(collectionKey);
      const newItem = {
        ...item,
        id: item.id || `${collectionKey.toUpperCase()}-${Date.now()}`,
      } as T;
      storage.setCollection(collectionKey, [...items, newItem]);
      return newItem;
    },

    async update(id: string, updates: Partial<T>): Promise<T> {
      const items = storage.getCollection<T>(collectionKey);
      const index = items.findIndex(item => item.id === id);
      if (index === -1) throw new Error(`Item ${id} not found`);
      
      const updated = { ...items[index], ...updates };
      items[index] = updated;
      storage.setCollection(collectionKey, items);
      return updated;
    },

    async delete(id: string): Promise<void> {
      const items = storage.getCollection<T>(collectionKey);
      storage.setCollection(collectionKey, items.filter(item => item.id !== id));
    },

    async query(predicate: (item: T) => boolean): Promise<T[]> {
      const items = storage.getCollection<T>(collectionKey);
      return items.filter(predicate);
    },
  };
}
```

### 4. Split Types (Example: Machine)

```typescript
// src/shared/types/machine.types.ts

export enum MachineStatus {
  RUNNING = 'RUNNING',
  IDLE = 'IDLE',
  MAINTENANCE = 'MAINTENANCE',
  ERROR = 'ERROR',
  OFFLINE = 'OFFLINE',
}

export type MachineType = 
  | 'CONFORMADORA' 
  | 'PANELIZADO' 
  | 'SOLDADURA' 
  | 'PINTURA' 
  | 'CARGA' 
  | 'PANELES_SIP' 
  | 'HERRERIA';

export type MachineCategory = 'STANDARD' | 'STRUCTURAL';

export interface Machine {
  id: string;
  name: string;
  type: MachineType;
  category?: MachineCategory;
  brand?: string;
  status: MachineStatus;
  currentJobId: string | null;
  operatorIds: string[];
  efficiency: number;
  oee_availability: number;
  oee_performance: number;
  oee_quality: number;
  temperature?: number;
  lastMaintenance?: string;
  maintenanceReason?: string;
  isActive: boolean;
  color?: string;
  totalMetersProduced: number;
  nextMaintenanceMeters: number;
}
```

### 5. Types Index (Re-exports)

```typescript
// src/shared/types/index.ts

export * from './machine.types';
export * from './job.types';
export * from './project.types';
export * from './user.types';
export * from './client.types';
export * from './inventory.types';
export * from './alert.types';
export * from './message.types';
export * from './event.types';
```

### 6. Constants

```typescript
// src/shared/constants/storage.ts

export const STORAGE_KEY = 'structura_erp_factory_data_v3';
export const STORAGE_VERSION = 3;
```

```typescript
// src/shared/constants/seeds.ts

import { Machine, MachineStatus } from '../types';

export const INITIAL_MACHINES: Machine[] = [
  {
    id: 'M-01',
    name: 'Conf. China 1',
    brand: 'China',
    type: 'CONFORMADORA',
    category: 'STANDARD',
    status: MachineStatus.IDLE,
    efficiency: 92,
    oee_availability: 95,
    oee_performance: 97,
    oee_quality: 99,
    operatorIds: ['U-002'],
    currentJobId: null,
    isActive: true,
    lastMaintenance: '2023-10-01',
    color: '#10b981',
    totalMetersProduced: 12000,
    nextMaintenanceMeters: 15000,
  },
  // ... rest of machines from App.tsx
];

export const INITIAL_USERS = [
  { id: 'U-001', name: 'Admin Principal', role: 'ADMIN' as const, pin: '1234' },
  { id: 'U-002', name: 'Juan Perez', role: 'OPERATOR' as const, pin: '0000' },
  { id: 'U-003', name: 'Maria Gomez', role: 'OPERATOR' as const, pin: '1111' },
  { id: 'U-004', name: 'Carlos Diaz', role: 'OPERATOR' as const, pin: '2222' },
];
```

### 7. Utility: className helper

```typescript
// src/shared/lib/cn.ts

type ClassValue = string | undefined | null | false | ClassValue[];

export function cn(...inputs: ClassValue[]): string {
  return inputs
    .flat()
    .filter((x): x is string => typeof x === 'string' && x.length > 0)
    .join(' ');
}
```

### 8. Utility: ID generation

```typescript
// src/shared/utils/id.ts

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
```

### 9. Base UI Components (Example: Button)

```typescript
// src/shared/ui/Button.tsx

import React from 'react';
import { cn } from '../lib/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const variants = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20',
  secondary: 'bg-slate-700 text-white hover:bg-slate-600',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'text-slate-400 hover:bg-slate-800 hover:text-white',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}) => (
  <button
    className={cn(
      'font-bold uppercase tracking-wider rounded-xl transition-all',
      variants[variant],
      sizes[size],
      className
    )}
    {...props}
  >
    {children}
  </button>
);
```

---

## Migration Checklist

### Step 1: Create folder structure
- [ ] Create `src/shared/api/`
- [ ] Create `src/shared/types/`
- [ ] Create `src/shared/constants/`
- [ ] Create `src/shared/ui/`
- [ ] Create `src/shared/hooks/`
- [ ] Create `src/shared/lib/`
- [ ] Create `src/shared/utils/`

### Step 2: Create repository abstraction
- [ ] Create `repository.ts` interface
- [ ] Create `storage.ts` wrapper
- [ ] Create `localStorageRepository.ts`
- [ ] Test with one entity (machine)

### Step 3: Split and move types
- [ ] Create `machine.types.ts`
- [ ] Create `job.types.ts`
- [ ] Create `project.types.ts`
- [ ] Create `user.types.ts`
- [ ] Create `client.types.ts`
- [ ] Create `inventory.types.ts`
- [ ] Create `alert.types.ts`
- [ ] Create `message.types.ts`
- [ ] Create `event.types.ts`
- [ ] Create `index.ts` with re-exports
- [ ] Update imports in existing files

### Step 4: Move constants
- [ ] Create `storage.ts` with STORAGE_KEY
- [ ] Create `seeds.ts` with INITIAL_MACHINES, INITIAL_USERS
- [ ] Update App.tsx imports

### Step 5: Create utilities
- [ ] Create `cn.ts`
- [ ] Create `id.ts`
- [ ] Create `formatters.ts`

### Step 6: Extract base UI components
- [ ] Create `Button.tsx`
- [ ] Create `Input.tsx`
- [ ] Create `Modal.tsx`
- [ ] Create `Card.tsx`
- [ ] Create `Badge.tsx`

---

## Verification

After completing this phase:

1. **Run the app** - Should work exactly as before
2. **Check imports** - All files should import from `@/shared/types`
3. **Test repository** - Create a simple test:

```typescript
import { createLocalStorageRepository } from '@/shared/api/localStorageRepository';
import { Machine } from '@/shared/types';

const repo = createLocalStorageRepository<Machine>('machines');

// Test CRUD
const machines = await repo.getAll();
console.log('Machines loaded:', machines.length);
```

---

## Path Alias Configuration

Add to `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/shared/*": ["src/shared/*"],
      "@/entities/*": ["src/entities/*"],
      "@/features/*": ["src/features/*"],
      "@/widgets/*": ["src/widgets/*"],
      "@/pages/*": ["src/pages/*"],
      "@/app/*": ["src/app/*"]
    }
  }
}
```

Add to `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

---

## Next Phase

After completing this phase, proceed to: `02-entities-layer.md`
