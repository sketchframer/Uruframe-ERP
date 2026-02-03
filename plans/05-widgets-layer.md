# Phase 5: Widgets Layer

## Goal

Extract complex, composed UI sections from views into reusable widgets. Widgets combine multiple entities and features into cohesive UI blocks.

---

## Widget vs Component vs Feature

| Layer | Contains | Example |
|-------|----------|---------|
| **shared/ui** | Atomic UI (Button, Input) | `<Button variant="primary">` |
| **entities/*/ui** | Entity-specific UI | `<MachineCard machine={m}>` |
| **features/*/ui** | Feature-specific UI | `<PinPad onComplete={...}>` |
| **widgets** | Composed sections | `<MachineDashboard>` (grid + stats + alerts) |

---

## Widgets to Create

| Widget | Source | Contains |
|--------|--------|----------|
| `sidebar` | App.tsx NavItem | Navigation sidebar with links |
| `machine-dashboard` | DashboardView | Machine grid, OEE chart, stats |
| `operator-controls` | OperatorTerminal | Job slider, action buttons, queue |
| `project-wizard` | ProjectsView | Multi-step job creation |
| `alerts-panel` | DashboardView | Alert list with actions |
| `loading-schedule` | DashboardView | "Carga del día" section |
| `job-queue` | OperatorTerminal | Sortable job list |
| `event-feed` | DashboardView | Recent events list |

---

## Directory Structure

```
src/widgets/
├── sidebar/
│   ├── ui/
│   │   ├── Sidebar.tsx
│   │   ├── NavItem.tsx
│   │   └── UserMenu.tsx
│   └── index.ts
├── machine-dashboard/
│   ├── ui/
│   │   ├── MachineDashboard.tsx
│   │   ├── MachineGrid.tsx
│   │   └── OeeChart.tsx
│   └── index.ts
├── operator-controls/
│   ├── ui/
│   │   ├── OperatorControls.tsx
│   │   ├── JobProgressSlider.tsx
│   │   ├── ActionButtons.tsx
│   │   └── MachineSelector.tsx
│   └── index.ts
├── project-wizard/
│   ├── ui/
│   │   ├── ProjectWizard.tsx
│   │   ├── StepClient.tsx
│   │   ├── StepJobs.tsx
│   │   └── StepReview.tsx
│   ├── model/
│   │   └── useWizardState.ts
│   └── index.ts
├── alerts-panel/
│   ├── ui/
│   │   ├── AlertsPanel.tsx
│   │   └── AlertCard.tsx
│   └── index.ts
├── loading-schedule/
│   ├── ui/
│   │   └── LoadingSchedule.tsx
│   └── index.ts
├── job-queue/
│   ├── ui/
│   │   ├── JobQueue.tsx
│   │   └── JobQueueItem.tsx
│   └── index.ts
└── event-feed/
    ├── ui/
    │   ├── EventFeed.tsx
    │   └── EventItem.tsx
    └── index.ts
```

---

## Widget: Sidebar

### Extract from App.tsx

```typescript
// Current App.tsx lines 27-40
const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      isActive 
      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    {icon}
    <span className="font-bold text-sm uppercase tracking-wider">{label}</span>
  </button>
);
```

### New Implementation

```typescript
// src/widgets/sidebar/ui/NavItem.tsx

import React from 'react';
import { Link } from '@tanstack/react-router';
import { cn } from '@/shared/lib/cn';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  params?: Record<string, string>;
}

export const NavItem: React.FC<NavItemProps> = ({ icon, label, to, params }) => (
  <Link
    to={to}
    params={params}
    className={cn(
      'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
      'text-slate-400 hover:bg-slate-800 hover:text-white'
    )}
    activeProps={{
      className: 'bg-blue-600 text-white shadow-lg shadow-blue-600/20',
    }}
  >
    {icon}
    <span className="font-bold text-sm uppercase tracking-wider">{label}</span>
  </Link>
);
```

```typescript
// src/widgets/sidebar/ui/Sidebar.tsx

import React from 'react';
import {
  LayoutDashboard,
  Settings,
  MonitorPlay,
  Package,
  ClipboardList,
  Factory,
  ListTodo,
  Users,
  LogOut,
} from 'lucide-react';
import { NavItem } from './NavItem';
import { useAuth } from '@/features/auth';
import { useAppNavigate } from '@/shared/hooks/useAppNavigate';

export const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  const { toLogin } = useAppNavigate();

  const handleLogout = () => {
    logout();
    toLogin();
  };

  return (
    <aside className="w-64 h-full bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Factory className="w-6 h-6 text-white" />
        </div>
        <span className="font-black tracking-tighter text-xl text-white">
          STRUCTURA
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <NavItem
          icon={<LayoutDashboard size={20} />}
          label="Dashboard"
          to="/"
        />
        <NavItem
          icon={<MonitorPlay size={20} />}
          label="Terminal"
          to="/operator/$machineId"
          params={{ machineId: '' }}
        />
        <NavItem
          icon={<ClipboardList size={20} />}
          label="Proyectos"
          to="/projects"
        />
        <NavItem
          icon={<ListTodo size={20} />}
          label="Producción"
          to="/orders"
        />
        <NavItem
          icon={<Package size={20} />}
          label="Stock"
          to="/inventory"
        />
        <NavItem
          icon={<Users size={20} />}
          label="Clientes"
          to="/clients"
        />
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <NavItem
          icon={<Settings size={20} />}
          label="Ajustes"
          to="/settings/$tab"
          params={{ tab: 'general' }}
        />
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl 
                     text-red-400 hover:bg-red-400/10 transition-all 
                     font-bold text-xs uppercase tracking-widest"
        >
          <LogOut size={20} />
          Salir
        </button>
      </div>
    </aside>
  );
};
```

```typescript
// src/widgets/sidebar/index.ts

export { Sidebar } from './ui/Sidebar';
export { NavItem } from './ui/NavItem';
```

---

## Widget: Machine Dashboard

```typescript
// src/widgets/machine-dashboard/ui/MachineDashboard.tsx

import React from 'react';
import { useMachineStore, MachineCard, useAverageOee } from '@/entities/machine';
import { useJobStore } from '@/entities/job';
import { useProjectStore } from '@/entities/project';
import { useAppNavigate } from '@/shared/hooks/useAppNavigate';
import { MachineGrid } from './MachineGrid';
import { OeeChart } from './OeeChart';

export const MachineDashboard: React.FC = () => {
  const machines = useMachineStore(s => s.machines);
  const jobs = useJobStore(s => s.jobs);
  const projects = useProjectStore(s => s.projects);
  const avgOee = useAverageOee();
  const { toOperator, toSettings } = useAppNavigate();

  return (
    <div className="space-y-6">
      {/* OEE Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-900 p-6 rounded-3xl">
          <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">
            OEE Promedio
          </div>
          <div className="text-4xl font-black text-white">{avgOee}%</div>
        </div>
        <OeeChart machines={machines} />
      </div>

      {/* Machine Grid */}
      <MachineGrid
        machines={machines}
        jobs={jobs}
        projects={projects}
        onMachineClick={(id) => toOperator(id)}
        onMachineEdit={(id) => toSettings('machines')}
      />
    </div>
  );
};
```

```typescript
// src/widgets/machine-dashboard/ui/MachineGrid.tsx

import React from 'react';
import { Machine, Job, Project } from '@/shared/types';
import { MachineCard } from '@/entities/machine';

interface MachineGridProps {
  machines: Machine[];
  jobs: Job[];
  projects: Project[];
  onMachineClick: (machineId: string) => void;
  onMachineEdit: (machineId: string) => void;
}

export const MachineGrid: React.FC<MachineGridProps> = ({
  machines,
  jobs,
  projects,
  onMachineClick,
  onMachineEdit,
}) => {
  const activeMachines = machines.filter(m => m.isActive);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {activeMachines.map(machine => {
        const activeJob = jobs.find(j => j.id === machine.currentJobId);
        const project = activeJob
          ? projects.find(p => p.id === activeJob.projectId)
          : null;

        return (
          <MachineCard
            key={machine.id}
            machine={machine}
            activeJob={activeJob}
            projectName={project?.name}
            onClick={() => onMachineClick(machine.id)}
            onEdit={() => onMachineEdit(machine.id)}
          />
        );
      })}
    </div>
  );
};
```

```typescript
// src/widgets/machine-dashboard/index.ts

export { MachineDashboard } from './ui/MachineDashboard';
export { MachineGrid } from './ui/MachineGrid';
export { OeeChart } from './ui/OeeChart';
```

---

## Widget: Operator Controls

```typescript
// src/widgets/operator-controls/ui/OperatorControls.tsx

import React from 'react';
import { useMachineStore } from '@/entities/machine';
import { useJobStore } from '@/entities/job';
import { useJobActions } from '@/features/job-management';
import { JobProgressSlider } from './JobProgressSlider';
import { ActionButtons } from './ActionButtons';
import { MachineSelector } from './MachineSelector';

interface OperatorControlsProps {
  machineId: string;
  onMachineChange: (machineId: string) => void;
}

export const OperatorControls: React.FC<OperatorControlsProps> = ({
  machineId,
  onMachineChange,
}) => {
  const machine = useMachineStore(s => s.getById(machineId));
  const jobs = useJobStore(s => s.jobs);
  const { handleJobCompletion, updateProgress, loadJobOnMachine } = useJobActions();

  const activeJob = jobs.find(j => j.id === machine?.currentJobId);
  const machineQueue = jobs
    .filter(j => j.assignedMachineId === machineId && j.status !== 'COMPLETED')
    .sort((a, b) => (a.priorityIndex || 0) - (b.priorityIndex || 0));

  if (!machine) {
    return (
      <MachineSelector
        selectedId={machineId}
        onSelect={onMachineChange}
      />
    );
  }

  const handleProgressChange = (percent: number) => {
    if (!activeJob) return;
    const newQty = Math.round((percent / 100) * activeJob.targetQuantity);
    updateProgress(activeJob.id, newQty);
  };

  const handleComplete = async () => {
    if (!activeJob) return;
    await handleJobCompletion(activeJob.id);
  };

  const handleLoadJob = (jobId: string) => {
    loadJobOnMachine(machineId, jobId);
  };

  return (
    <div className="space-y-6">
      <MachineSelector
        selectedId={machineId}
        onSelect={onMachineChange}
      />

      {activeJob ? (
        <>
          <JobProgressSlider
            job={activeJob}
            onProgressChange={handleProgressChange}
            onComplete={handleComplete}
          />
          <ActionButtons
            machine={machine}
            job={activeJob}
          />
        </>
      ) : (
        <div className="text-center text-slate-500 py-10">
          No hay trabajo activo. Selecciona uno de la cola.
        </div>
      )}

      {/* Job Queue */}
      <div className="bg-slate-800 rounded-2xl p-4">
        <h3 className="text-sm font-black uppercase text-slate-400 mb-4">
          Cola de Trabajos
        </h3>
        {machineQueue.map(job => (
          <button
            key={job.id}
            onClick={() => handleLoadJob(job.id)}
            className="w-full text-left p-3 rounded-xl hover:bg-slate-700 transition"
          >
            <div className="font-bold text-white">{job.productName}</div>
            <div className="text-xs text-slate-500">
              {job.targetQuantity} {job.unit}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
```

```typescript
// src/widgets/operator-controls/ui/JobProgressSlider.tsx

import React from 'react';
import { Job } from '@/shared/types';
import { CheckCircle } from 'lucide-react';

interface JobProgressSliderProps {
  job: Job;
  onProgressChange: (percent: number) => void;
  onComplete: () => void;
}

export const JobProgressSlider: React.FC<JobProgressSliderProps> = ({
  job,
  onProgressChange,
  onComplete,
}) => {
  const progress = Math.round((job.completedQuantity / job.targetQuantity) * 100);

  return (
    <div className="bg-slate-800 rounded-3xl p-8">
      <div className="mb-6">
        <h3 className="text-2xl font-black text-white uppercase tracking-tight">
          {job.productName}
        </h3>
        <p className="text-slate-500 text-sm">
          {job.completedQuantity} / {job.targetQuantity} {job.unit}
        </p>
      </div>

      {/* Progress bar */}
      <div className="relative mb-8">
        <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="absolute right-0 top-6 text-4xl font-black text-white">
          {progress}%
        </div>
      </div>

      {/* Slider */}
      <input
        type="range"
        min="0"
        max="100"
        value={progress}
        onChange={(e) => onProgressChange(parseInt(e.target.value))}
        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
      />

      {/* Complete button */}
      <button
        onClick={onComplete}
        disabled={progress < 100}
        className="mt-6 w-full py-4 bg-green-600 hover:bg-green-500 
                   disabled:bg-slate-700 disabled:text-slate-500
                   text-white font-black uppercase rounded-2xl 
                   flex items-center justify-center gap-3 transition"
      >
        <CheckCircle size={24} />
        Marcar Completo
      </button>
    </div>
  );
};
```

```typescript
// src/widgets/operator-controls/index.ts

export { OperatorControls } from './ui/OperatorControls';
export { JobProgressSlider } from './ui/JobProgressSlider';
export { ActionButtons } from './ui/ActionButtons';
export { MachineSelector } from './ui/MachineSelector';
```

---

## Widget: Project Wizard

```typescript
// src/widgets/project-wizard/model/useWizardState.ts

import { useState, useCallback } from 'react';
import type { Job, Project } from '@/shared/types';

type WizardStep = 1 | 2 | 3;

interface WizardState {
  step: WizardStep;
  project: Partial<Project>;
  jobs: Partial<Job>[];
}

export function useWizardState(initialProject?: Partial<Project>) {
  const [state, setState] = useState<WizardState>({
    step: 1,
    project: initialProject || {
      name: '',
      clientId: '',
      deadline: new Date().toISOString().split('T')[0],
      status: 'PLANNING',
    },
    jobs: [],
  });

  const nextStep = useCallback(() => {
    setState(s => ({
      ...s,
      step: Math.min(s.step + 1, 3) as WizardStep,
    }));
  }, []);

  const prevStep = useCallback(() => {
    setState(s => ({
      ...s,
      step: Math.max(s.step - 1, 1) as WizardStep,
    }));
  }, []);

  const updateProject = useCallback((updates: Partial<Project>) => {
    setState(s => ({
      ...s,
      project: { ...s.project, ...updates },
    }));
  }, []);

  const addJob = useCallback((job: Partial<Job>) => {
    setState(s => ({
      ...s,
      jobs: [...s.jobs, job],
    }));
  }, []);

  const removeJob = useCallback((index: number) => {
    setState(s => ({
      ...s,
      jobs: s.jobs.filter((_, i) => i !== index),
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      step: 1,
      project: {
        name: '',
        clientId: '',
        deadline: new Date().toISOString().split('T')[0],
        status: 'PLANNING',
      },
      jobs: [],
    });
  }, []);

  return {
    ...state,
    nextStep,
    prevStep,
    updateProject,
    addJob,
    removeJob,
    reset,
  };
}
```

```typescript
// src/widgets/project-wizard/ui/ProjectWizard.tsx

import React from 'react';
import { useWizardState } from '../model/useWizardState';
import { StepClient } from './StepClient';
import { StepJobs } from './StepJobs';
import { StepReview } from './StepReview';
import { useProjectStore } from '@/entities/project';
import { useJobStore } from '@/entities/job';

interface ProjectWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

export const ProjectWizard: React.FC<ProjectWizardProps> = ({
  onComplete,
  onCancel,
}) => {
  const wizard = useWizardState();
  const createProject = useProjectStore(s => s.create);
  const createJob = useJobStore(s => s.create);

  const handleSubmit = async () => {
    // Create project
    const project = await createProject(wizard.project as any);

    // Create jobs
    for (const job of wizard.jobs) {
      await createJob({
        ...job,
        projectId: project.id,
      } as any);
    }

    wizard.reset();
    onComplete();
  };

  return (
    <div className="bg-slate-900 rounded-3xl p-8">
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-4 mb-8">
        {[1, 2, 3].map(s => (
          <div
            key={s}
            className={`w-10 h-10 rounded-full flex items-center justify-center
                        font-black text-sm ${
              s === wizard.step
                ? 'bg-blue-600 text-white'
                : s < wizard.step
                ? 'bg-green-600 text-white'
                : 'bg-slate-700 text-slate-500'
            }`}
          >
            {s}
          </div>
        ))}
      </div>

      {/* Step content */}
      {wizard.step === 1 && (
        <StepClient
          project={wizard.project}
          onUpdate={wizard.updateProject}
          onNext={wizard.nextStep}
          onCancel={onCancel}
        />
      )}
      {wizard.step === 2 && (
        <StepJobs
          jobs={wizard.jobs}
          onAddJob={wizard.addJob}
          onRemoveJob={wizard.removeJob}
          onNext={wizard.nextStep}
          onBack={wizard.prevStep}
        />
      )}
      {wizard.step === 3 && (
        <StepReview
          project={wizard.project}
          jobs={wizard.jobs}
          onSubmit={handleSubmit}
          onBack={wizard.prevStep}
        />
      )}
    </div>
  );
};
```

```typescript
// src/widgets/project-wizard/index.ts

export { ProjectWizard } from './ui/ProjectWizard';
export { useWizardState } from './model/useWizardState';
```

---

## Migration Checklist

### Step 1: Create sidebar widget
- [ ] Create `widgets/sidebar/ui/NavItem.tsx`
- [ ] Create `widgets/sidebar/ui/Sidebar.tsx`
- [ ] Create `widgets/sidebar/index.ts`
- [ ] Update authenticated layout to use Sidebar

### Step 2: Create machine-dashboard widget
- [ ] Create `widgets/machine-dashboard/ui/MachineGrid.tsx`
- [ ] Create `widgets/machine-dashboard/ui/OeeChart.tsx`
- [ ] Create `widgets/machine-dashboard/ui/MachineDashboard.tsx`
- [ ] Create `widgets/machine-dashboard/index.ts`

### Step 3: Create operator-controls widget
- [ ] Create `widgets/operator-controls/ui/MachineSelector.tsx`
- [ ] Create `widgets/operator-controls/ui/JobProgressSlider.tsx`
- [ ] Create `widgets/operator-controls/ui/ActionButtons.tsx`
- [ ] Create `widgets/operator-controls/ui/OperatorControls.tsx`
- [ ] Create `widgets/operator-controls/index.ts`

### Step 4: Create project-wizard widget
- [ ] Create `widgets/project-wizard/model/useWizardState.ts`
- [ ] Create `widgets/project-wizard/ui/StepClient.tsx`
- [ ] Create `widgets/project-wizard/ui/StepJobs.tsx`
- [ ] Create `widgets/project-wizard/ui/StepReview.tsx`
- [ ] Create `widgets/project-wizard/ui/ProjectWizard.tsx`
- [ ] Create `widgets/project-wizard/index.ts`

### Step 5: Create remaining widgets
- [ ] Create `widgets/alerts-panel/`
- [ ] Create `widgets/loading-schedule/`
- [ ] Create `widgets/job-queue/`
- [ ] Create `widgets/event-feed/`

### Step 6: Update pages to use widgets
- [ ] DashboardPage uses MachineDashboard, AlertsPanel, EventFeed
- [ ] OperatorPage uses OperatorControls, JobQueue
- [ ] ProjectsPage uses ProjectWizard

---

## Next Phase

After completing this phase, proceed to: `06-app-shell.md`
