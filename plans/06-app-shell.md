# Phase 6: App Shell and Final Assembly

## Goal

Wire together all layers into a cohesive application shell with proper providers, initialization, and cleanup of legacy code.

---

## Directory Structure

```
src/
├── app/
│   ├── providers/
│   │   ├── index.tsx           # Provider composition
│   │   ├── StoreProvider.tsx   # Store hydration
│   │   └── ThemeProvider.tsx   # Optional: theme context
│   ├── routes/
│   │   └── (all route files from Phase 4)
│   ├── styles/
│   │   └── global.css
│   ├── App.tsx                 # Main app component
│   └── main.tsx                # Entry point
└── (other FSD layers)
```

---

## Provider Stack

### 1. Store Hydration Provider

```typescript
// src/app/providers/StoreProvider.tsx

import React, { useEffect, useState } from 'react';
import { useMachineStore } from '@/entities/machine';
import { useUserStore } from '@/entities/user';
import { useJobStore } from '@/entities/job';
import { useProjectStore } from '@/entities/project';
import { useClientStore } from '@/entities/client';
import { useInventoryStore } from '@/entities/inventory';
import { useAlertStore } from '@/entities/alert';
import { useMessageStore } from '@/entities/message';
import { useEventStore } from '@/entities/event';

interface StoreProviderProps {
  children: React.ReactNode;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const hydrateStores = async () => {
      // Hydrate all stores in parallel
      await Promise.all([
        useMachineStore.getState().hydrate(),
        useUserStore.getState().hydrate(),
        useJobStore.getState().hydrate(),
        useProjectStore.getState().hydrate(),
        useClientStore.getState().hydrate(),
        useInventoryStore.getState().hydrate(),
        useAlertStore.getState().hydrate(),
        useMessageStore.getState().hydrate(),
        useEventStore.getState().hydrate(),
      ]);

      setIsHydrated(true);
    };

    hydrateStores();
  }, []);

  if (!isHydrated) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
};

const LoadingScreen = () => (
  <div className="fixed inset-0 bg-[#0f172a] flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent 
                      rounded-full animate-spin mx-auto mb-4" />
      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
        Cargando Sistema...
      </p>
    </div>
  </div>
);
```

### 2. Provider Composition

```typescript
// src/app/providers/index.tsx

import React from 'react';
import { RouterProvider } from '@tanstack/react-router';
import { router } from '../routes';
import { StoreProvider } from './StoreProvider';

interface ProvidersProps {
  children?: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = () => {
  return (
    <StoreProvider>
      <RouterProvider router={router} />
    </StoreProvider>
  );
};
```

---

## Main Entry Point

```typescript
// src/app/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Providers } from './providers';
import './styles/global.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <Providers />
  </React.StrictMode>
);
```

---

## Global Styles

```css
/* src/app/styles/global.css */

@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #475569;
}

/* Animation utilities */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

/* Range slider styling */
input[type='range'] {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
}

input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 24px;
  height: 24px;
  background: #3b82f6;
  border-radius: 50%;
  cursor: pointer;
  margin-top: -10px;
}

input[type='range']::-webkit-slider-runnable-track {
  height: 4px;
  background: #334155;
  border-radius: 2px;
}
```

---

## Files to Delete (Legacy Cleanup)

After migration is complete, remove these files:

```
# Old entry point
- /index.tsx          → replaced by /src/app/main.tsx

# Old root component
- /App.tsx            → replaced by /src/app/App.tsx + routes

# Old views folder
- /views/             → replaced by /src/pages/ + /src/widgets/
  - DashboardView.tsx
  - OperatorTerminal.tsx
  - ProjectsView.tsx
  - OrdersView.tsx
  - InventoryView.tsx
  - ClientsView.tsx
  - SettingsView.tsx
  - LoginView.tsx

# Old components
- /components/        → moved to /src/entities/*/ui/
  - MachineCard.tsx

# Old services
- /services/          → moved to /src/features/ai-assistant/api/
  - geminiService.ts

# Old types
- /types.ts           → split into /src/shared/types/
```

---

## Final Directory Structure

```
src/
├── app/
│   ├── providers/
│   │   ├── index.tsx
│   │   └── StoreProvider.tsx
│   ├── routes/
│   │   ├── __root.tsx
│   │   ├── _authenticated.tsx
│   │   ├── login.tsx
│   │   └── _authenticated/
│   │       ├── index.tsx
│   │       ├── operator.$machineId.tsx
│   │       ├── projects.tsx
│   │       ├── projects.$projectId.tsx
│   │       ├── orders.tsx
│   │       ├── inventory.tsx
│   │       ├── clients.tsx
│   │       └── settings.$tab.tsx
│   ├── styles/
│   │   └── global.css
│   └── main.tsx
├── pages/
│   ├── dashboard/
│   │   ├── ui/DashboardPage.tsx
│   │   └── index.ts
│   ├── operator/
│   │   ├── ui/OperatorPage.tsx
│   │   └── index.ts
│   ├── projects/
│   │   ├── ui/ProjectsPage.tsx
│   │   └── index.ts
│   ├── orders/
│   │   ├── ui/OrdersPage.tsx
│   │   └── index.ts
│   ├── inventory/
│   │   ├── ui/InventoryPage.tsx
│   │   └── index.ts
│   ├── clients/
│   │   ├── ui/ClientsPage.tsx
│   │   └── index.ts
│   ├── settings/
│   │   ├── ui/SettingsPage.tsx
│   │   └── index.ts
│   └── login/
│       ├── ui/LoginPage.tsx
│       └── index.ts
├── widgets/
│   ├── sidebar/
│   ├── machine-dashboard/
│   ├── operator-controls/
│   ├── project-wizard/
│   ├── alerts-panel/
│   ├── loading-schedule/
│   ├── job-queue/
│   └── event-feed/
├── features/
│   ├── auth/
│   ├── job-management/
│   ├── logistics-messaging/
│   ├── project-management/
│   └── ai-assistant/
├── entities/
│   ├── machine/
│   ├── job/
│   ├── project/
│   ├── user/
│   ├── client/
│   ├── inventory/
│   ├── alert/
│   ├── message/
│   └── event/
└── shared/
    ├── api/
    ├── ui/
    ├── hooks/
    ├── lib/
    ├── types/
    ├── utils/
    └── constants/
```

---

## Update package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext .ts,.tsx",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:coverage": "vitest --coverage"
  }
}
```

---

## Update vite.config.ts

```typescript
// vite.config.ts

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
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['@tanstack/react-router'],
          state: ['zustand'],
          charts: ['recharts'],
        },
      },
    },
  },
});
```

---

## Update tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

## Migration Checklist

### Step 1: Create app shell structure
- [ ] Create `src/app/` folder
- [ ] Create `src/app/providers/StoreProvider.tsx`
- [ ] Create `src/app/providers/index.tsx`
- [ ] Create `src/app/styles/global.css`
- [ ] Create `src/app/main.tsx`

### Step 2: Update configuration
- [ ] Update `vite.config.ts` with aliases and chunks
- [ ] Update `tsconfig.json` with paths
- [ ] Update `index.html` to point to new entry

### Step 3: Update index.html

```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Structura ERP - Factory OS</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/app/main.tsx"></script>
  </body>
</html>
```

### Step 4: Verify app runs
- [ ] Run `npm run dev`
- [ ] Login works
- [ ] Navigation works
- [ ] Data loads correctly
- [ ] All pages render

### Step 5: Clean up legacy files
- [ ] Delete `/index.tsx`
- [ ] Delete `/App.tsx`
- [ ] Delete `/views/` folder
- [ ] Delete `/components/` folder
- [ ] Delete `/services/` folder
- [ ] Delete `/types.ts`

### Step 6: Final verification
- [ ] Run `npm run build` - no errors
- [ ] Run `npm run type-check` - no errors
- [ ] Run `npm run lint` - no errors
- [ ] Test all functionality end-to-end

---

## Rollback Plan

If issues arise during migration:

1. Keep old files until migration is verified
2. Use feature flags if needed:

```typescript
// src/shared/constants/flags.ts
export const USE_NEW_ARCHITECTURE = true;

// In App.tsx
if (USE_NEW_ARCHITECTURE) {
  return <NewApp />;
} else {
  return <LegacyApp />;
}
```

3. Commit after each phase so you can revert specific phases

---

## Post-Migration Verification

### Functionality Checklist

- [ ] Login with PIN works
- [ ] Admin sees sidebar, operator sees terminal only
- [ ] Dashboard shows machines, OEE, alerts
- [ ] Operator terminal controls job progress
- [ ] Job completion triggers panelizado sequencing
- [ ] Project completion triggers logistics messages
- [ ] Projects can be created with wizard
- [ ] Orders can be created and assigned
- [ ] Inventory CRUD works
- [ ] Clients CRUD works
- [ ] Settings tabs all work
- [ ] Logout works
- [ ] Data persists across refresh
- [ ] Browser back/forward works
- [ ] Deep links work (e.g., /operator/M-01)

---

## Congratulations!

If you've completed all 6 phases, your app now has:

- Clean FSD architecture
- Zustand stores with repository abstraction
- Type-safe routing with TanStack Router
- Reusable widgets and features
- Clear layer boundaries
- Easy path to add a backend

**Next recommended plans:**
- `07-testing-strategy.md` - Add tests
- `08-backend-migration-path.md` - Add real API
- `09-ui-design-system.md` - Formalize UI components
