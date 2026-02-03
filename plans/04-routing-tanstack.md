# Phase 4: TanStack Router Setup

## Goal

Replace the `currentView` state-based navigation with TanStack Router for:
- Type-safe routes with params
- URL-based navigation (deep links, bookmarks)
- Browser back/forward support
- Code splitting (lazy loading)

---

## Install Dependencies

```bash
npm install @tanstack/react-router
```

---

## Directory Structure

```
src/
├── app/
│   ├── routes/
│   │   ├── index.ts           # Router configuration
│   │   ├── __root.tsx         # Root layout
│   │   ├── _authenticated.tsx # Auth layout (protected routes)
│   │   ├── login.tsx
│   │   ├── dashboard.tsx
│   │   ├── operator.$machineId.tsx
│   │   ├── projects.tsx
│   │   ├── projects.$projectId.tsx
│   │   ├── orders.tsx
│   │   ├── inventory.tsx
│   │   ├── clients.tsx
│   │   └── settings.$tab.tsx
│   └── App.tsx
└── pages/
    ├── dashboard/
    │   └── ui/DashboardPage.tsx
    ├── operator/
    │   └── ui/OperatorPage.tsx
    ├── projects/
    │   └── ui/ProjectsPage.tsx
    ├── orders/
    │   └── ui/OrdersPage.tsx
    ├── inventory/
    │   └── ui/InventoryPage.tsx
    ├── clients/
    │   └── ui/ClientsPage.tsx
    ├── settings/
    │   └── ui/SettingsPage.tsx
    └── login/
        └── ui/LoginPage.tsx
```

---

## Route Configuration

### 1. Root Route

```typescript
// src/app/routes/__root.tsx

import { createRootRoute, Outlet } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <div className="h-screen bg-[#0f172a] text-slate-200 overflow-hidden">
      <Outlet />
    </div>
  );
}
```

### 2. Authenticated Layout (Protected Routes)

```typescript
// src/app/routes/_authenticated.tsx

import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { useUserStore } from '@/entities/user';
import { Sidebar } from '@/widgets/sidebar';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: () => {
    const currentUser = useUserStore.getState().currentUser;
    if (!currentUser) {
      throw redirect({ to: '/login' });
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const currentUser = useUserStore(s => s.currentUser);

  // Operators see only the terminal
  if (currentUser?.role === 'OPERATOR') {
    return (
      <main className="h-full">
        <Outlet />
      </main>
    );
  }

  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
```

### 3. Login Route

```typescript
// src/app/routes/login.tsx

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/features/auth';
import { LoginPage } from '@/pages/login';

export const Route = createFileRoute('/login')({
  component: LoginRoute,
});

function LoginRoute() {
  const navigate = useNavigate();
  const { login, currentUser } = useAuth();

  // Redirect if already logged in
  if (currentUser) {
    navigate({
      to: currentUser.role === 'OPERATOR' ? '/operator/$machineId' : '/',
      params: { machineId: '' },
    });
  }

  const handleLogin = async (pin: string) => {
    const result = await login(pin);
    if (result.success) {
      const user = useUserStore.getState().currentUser;
      navigate({
        to: user?.role === 'OPERATOR' ? '/operator/$machineId' : '/',
        params: { machineId: '' },
      });
    }
    return result;
  };

  return <LoginPage onLogin={handleLogin} />;
}
```

### 4. Dashboard Route

```typescript
// src/app/routes/_authenticated/dashboard.tsx

import { createFileRoute } from '@tanstack/react-router';
import { DashboardPage } from '@/pages/dashboard';

export const Route = createFileRoute('/_authenticated/')({
  component: DashboardPage,
});
```

### 5. Operator Route (with machine param)

```typescript
// src/app/routes/_authenticated/operator.$machineId.tsx

import { createFileRoute } from '@tanstack/react-router';
import { OperatorPage } from '@/pages/operator';

export const Route = createFileRoute('/_authenticated/operator/$machineId')({
  component: OperatorRoute,
});

function OperatorRoute() {
  const { machineId } = Route.useParams();
  return <OperatorPage initialMachineId={machineId} />;
}
```

### 6. Projects Route (with optional project param)

```typescript
// src/app/routes/_authenticated/projects.tsx

import { createFileRoute } from '@tanstack/react-router';
import { ProjectsPage } from '@/pages/projects';

export const Route = createFileRoute('/_authenticated/projects')({
  component: ProjectsPage,
});
```

```typescript
// src/app/routes/_authenticated/projects.$projectId.tsx

import { createFileRoute } from '@tanstack/react-router';
import { ProjectsPage } from '@/pages/projects';

export const Route = createFileRoute('/_authenticated/projects/$projectId')({
  component: ProjectDetailRoute,
});

function ProjectDetailRoute() {
  const { projectId } = Route.useParams();
  return <ProjectsPage selectedProjectId={projectId} />;
}
```

### 7. Settings Route (with tab param)

```typescript
// src/app/routes/_authenticated/settings.$tab.tsx

import { createFileRoute } from '@tanstack/react-router';
import { SettingsPage } from '@/pages/settings';

type SettingsTab = 'general' | 'users' | 'machines' | 'workforce' | 'messages';

export const Route = createFileRoute('/_authenticated/settings/$tab')({
  parseParams: (params) => ({
    tab: (params.tab as SettingsTab) || 'general',
  }),
  component: SettingsRoute,
});

function SettingsRoute() {
  const { tab } = Route.useParams();
  return <SettingsPage initialTab={tab} />;
}
```

---

## Router Setup

```typescript
// src/app/routes/index.ts

import { createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen'; // Auto-generated

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
});

// Type registration for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
```

---

## App Entry Point

```typescript
// src/app/App.tsx

import { RouterProvider } from '@tanstack/react-router';
import { router } from './routes';

export function App() {
  return <RouterProvider router={router} />;
}
```

```typescript
// src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## Navigation Hooks

### useAppNavigate (type-safe navigation)

```typescript
// src/shared/hooks/useAppNavigate.ts

import { useNavigate } from '@tanstack/react-router';

export function useAppNavigate() {
  const navigate = useNavigate();

  return {
    toDashboard: () => navigate({ to: '/' }),
    toOperator: (machineId?: string) =>
      navigate({ to: '/operator/$machineId', params: { machineId: machineId || '' } }),
    toProjects: () => navigate({ to: '/projects' }),
    toProject: (projectId: string) =>
      navigate({ to: '/projects/$projectId', params: { projectId } }),
    toOrders: () => navigate({ to: '/orders' }),
    toInventory: () => navigate({ to: '/inventory' }),
    toClients: () => navigate({ to: '/clients' }),
    toSettings: (tab: string = 'general') =>
      navigate({ to: '/settings/$tab', params: { tab } }),
    toLogin: () => navigate({ to: '/login' }),
  };
}
```

### Usage in Components

```typescript
// Before
const navigateToOperator = (machineId: string) => {
  setSelectedMachineForOperator(machineId);
  setCurrentView('OPERATOR');
};

// After
const { toOperator } = useAppNavigate();
// ...
<MachineCard onClick={() => toOperator(machine.id)} />
```

---

## Route Map (Current → New)

| Current View State | New URL | Route File |
|-------------------|---------|------------|
| `DASHBOARD` | `/` | `_authenticated/index.tsx` |
| `OPERATOR` | `/operator/:machineId?` | `_authenticated/operator.$machineId.tsx` |
| `PROJECTS` | `/projects/:projectId?` | `_authenticated/projects.tsx` |
| `ORDERS` | `/orders` | `_authenticated/orders.tsx` |
| `INVENTORY` | `/inventory` | `_authenticated/inventory.tsx` |
| `CLIENTS` | `/clients` | `_authenticated/clients.tsx` |
| `SETTINGS` | `/settings/:tab` | `_authenticated/settings.$tab.tsx` |
| (Login) | `/login` | `login.tsx` |

---

## Migration Checklist

### Step 1: Install and configure
- [ ] Install `@tanstack/react-router`
- [ ] Create `src/app/routes/` folder
- [ ] Create root route `__root.tsx`

### Step 2: Create route files
- [ ] Create `_authenticated.tsx` (auth guard layout)
- [ ] Create `login.tsx`
- [ ] Create `_authenticated/index.tsx` (dashboard)
- [ ] Create `_authenticated/operator.$machineId.tsx`
- [ ] Create `_authenticated/projects.tsx`
- [ ] Create `_authenticated/orders.tsx`
- [ ] Create `_authenticated/inventory.tsx`
- [ ] Create `_authenticated/clients.tsx`
- [ ] Create `_authenticated/settings.$tab.tsx`

### Step 3: Create thin page components
- [ ] Create `pages/dashboard/ui/DashboardPage.tsx`
- [ ] Create `pages/operator/ui/OperatorPage.tsx`
- [ ] Create `pages/projects/ui/ProjectsPage.tsx`
- [ ] Create `pages/orders/ui/OrdersPage.tsx`
- [ ] Create `pages/inventory/ui/InventoryPage.tsx`
- [ ] Create `pages/clients/ui/ClientsPage.tsx`
- [ ] Create `pages/settings/ui/SettingsPage.tsx`
- [ ] Create `pages/login/ui/LoginPage.tsx`

### Step 4: Create navigation hook
- [ ] Create `useAppNavigate` hook
- [ ] Update all navigation calls in views

### Step 5: Update main entry
- [ ] Update `main.tsx` to use RouterProvider
- [ ] Delete old App.tsx navigation state

### Step 6: Test all routes
- [ ] `/` loads dashboard
- [ ] `/login` works for auth
- [ ] `/operator/M-01` loads specific machine
- [ ] `/projects/PRJ-123` loads specific project
- [ ] `/settings/users` loads users tab
- [ ] Browser back/forward works
- [ ] Refresh on any route works

---

## Code Splitting (Lazy Loading)

For better performance, lazy load routes:

```typescript
// src/app/routes/_authenticated/projects.tsx

import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

const ProjectsPage = lazy(() => import('@/pages/projects'));

export const Route = createFileRoute('/_authenticated/projects')({
  component: () => (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <ProjectsPage />
    </Suspense>
  ),
});
```

---

## Search Params (Advanced)

For filtered views, use search params:

```typescript
// src/app/routes/_authenticated/orders.tsx

import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

const ordersSearchSchema = z.object({
  status: z.enum(['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
  machineId: z.string().optional(),
});

export const Route = createFileRoute('/_authenticated/orders')({
  validateSearch: ordersSearchSchema,
  component: OrdersRoute,
});

function OrdersRoute() {
  const { status, machineId } = Route.useSearch();
  return <OrdersPage filterStatus={status} filterMachineId={machineId} />;
}
```

Usage: `/orders?status=PENDING&machineId=M-01`

---

## Next Phase

After completing this phase, proceed to: `05-widgets-layer.md`
