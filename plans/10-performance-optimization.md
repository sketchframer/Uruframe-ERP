# Plan 10: Performance Optimization

## Goal

Optimize the app for production: faster loads, smaller bundles, smoother interactions.

---

## Current Performance Issues

| Issue | Impact | Solution |
|-------|--------|----------|
| Single bundle | Slow initial load | Code splitting |
| No lazy loading | All views loaded upfront | Route-based splitting |
| Re-renders on state changes | UI lag | Selective subscriptions |
| Large localStorage reads | Slow hydration | Incremental loading |
| No image optimization | Heavy assets | Lazy images |

---

## 1. Code Splitting with Lazy Routes

### Before

```typescript
// All views imported synchronously
import { DashboardView } from './views/DashboardView';
import { ProjectsView } from './views/ProjectsView';
import { OperatorTerminal } from './views/OperatorTerminal';
// ... all loaded on initial page load
```

### After

```typescript
// src/app/routes/_authenticated/projects.tsx

import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import { FullPageSpinner } from '@/shared/ui';

const ProjectsPage = lazy(() => 
  import('@/pages/projects').then(m => ({ default: m.ProjectsPage }))
);

export const Route = createFileRoute('/_authenticated/projects')({
  component: () => (
    <Suspense fallback={<FullPageSpinner />}>
      <ProjectsPage />
    </Suspense>
  ),
});
```

### Route-Level Prefetching

```typescript
// Prefetch on hover for faster navigation
<Link
  to="/projects"
  preload="intent"  // Prefetch when user hovers
>
  Proyectos
</Link>
```

---

## 2. Zustand Selective Subscriptions

### Problem: Unnecessary Re-renders

```typescript
// BAD: Re-renders when ANY part of the store changes
const { machines, jobs, projects, alerts } = useMachineStore();
```

### Solution: Select Only What You Need

```typescript
// GOOD: Only re-renders when machines change
const machines = useMachineStore(state => state.machines);

// GOOD: Shallow comparison for arrays
import { shallow } from 'zustand/shallow';

const { machines, isLoading } = useMachineStore(
  state => ({ machines: state.machines, isLoading: state.isLoading }),
  shallow
);
```

### Derived State with useMemo

```typescript
// Compute expensive values only when dependencies change
const runningMachines = useMemo(
  () => machines.filter(m => m.status === 'RUNNING'),
  [machines]
);

const avgOee = useMemo(
  () => machines.reduce((acc, m) => acc + m.efficiency, 0) / machines.length,
  [machines]
);
```

---

## 3. Component Memoization

### Memoize Expensive Components

```typescript
// src/entities/machine/ui/MachineCard.tsx

import { memo } from 'react';

export const MachineCard = memo<MachineCardProps>(({ 
  machine, 
  onClick, 
  onEdit 
}) => {
  // ... component body
});

// Only re-render if props actually changed
MachineCard.displayName = 'MachineCard';
```

### Memoize Callbacks

```typescript
// src/widgets/machine-dashboard/ui/MachineDashboard.tsx

const handleMachineClick = useCallback((id: string) => {
  navigate(`/operator/${id}`);
}, [navigate]);

const handleMachineEdit = useCallback((id: string) => {
  navigate(`/settings/machines`);
}, [navigate]);
```

### Memoize Mapped Elements

```typescript
// Avoid creating new arrays on every render
const machineCards = useMemo(
  () => machines.map(machine => (
    <MachineCard
      key={machine.id}
      machine={machine}
      onClick={() => handleMachineClick(machine.id)}
      onEdit={() => handleMachineEdit(machine.id)}
    />
  )),
  [machines, handleMachineClick, handleMachineEdit]
);
```

---

## 4. Virtual Lists for Large Data

### Problem: Rendering 1000+ Jobs

```typescript
// BAD: Renders all items, even off-screen
{jobs.map(job => <JobRow key={job.id} job={job} />)}
```

### Solution: Virtualized List

```bash
npm install @tanstack/react-virtual
```

```typescript
// src/widgets/job-queue/ui/VirtualJobList.tsx

import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

interface VirtualJobListProps {
  jobs: Job[];
  onJobClick: (jobId: string) => void;
}

export const VirtualJobList: React.FC<VirtualJobListProps> = ({ 
  jobs, 
  onJobClick 
}) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: jobs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72, // Estimated row height
    overscan: 5, // Render 5 extra items above/below viewport
  });

  return (
    <div
      ref={parentRef}
      className="h-[400px] overflow-auto"
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map(virtualRow => {
          const job = jobs[virtualRow.index];
          return (
            <div
              key={job.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <JobRow job={job} onClick={() => onJobClick(job.id)} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
```

---

## 5. Incremental Data Loading

### Problem: Loading All Data at Once

```typescript
// BAD: Blocks UI while loading everything
useEffect(() => {
  Promise.all([
    machineStore.fetchAll(),
    jobStore.fetchAll(),
    projectStore.fetchAll(),
    // ... 10 more stores
  ]);
}, []);
```

### Solution: Progressive Loading

```typescript
// src/app/providers/DataHydrationProvider.tsx

import { useEffect, useState } from 'react';
import { useMachineStore } from '@/entities/machine';
import { useJobStore } from '@/entities/job';
import { useProjectStore } from '@/entities/project';

type LoadingStage = 'critical' | 'secondary' | 'complete';

export const DataHydrationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [stage, setStage] = useState<LoadingStage>('critical');

  useEffect(() => {
    async function hydrate() {
      // Stage 1: Critical data (needed for initial render)
      await Promise.all([
        useMachineStore.getState().hydrate(),
        useUserStore.getState().hydrate(),
      ]);
      setStage('secondary');

      // Stage 2: Secondary data (can load in background)
      await Promise.all([
        useJobStore.getState().hydrate(),
        useProjectStore.getState().hydrate(),
      ]);
      setStage('complete');

      // Stage 3: Non-critical data (lazy load)
      useEventStore.getState().hydrate();
      useAlertStore.getState().hydrate();
      useMessageStore.getState().hydrate();
    }

    hydrate();
  }, []);

  if (stage === 'critical') {
    return <FullPageSpinner />;
  }

  return <>{children}</>;
};
```

---

## 6. Debounce Expensive Operations

### Problem: Updating on Every Keystroke

```typescript
// BAD: Fires on every character typed
<input
  value={searchTerm}
  onChange={(e) => {
    setSearchTerm(e.target.value);
    filterJobs(e.target.value); // Expensive!
  }}
/>
```

### Solution: Debounced Updates

```typescript
// src/shared/hooks/useDebounce.ts

import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

```typescript
// Usage
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebounce(searchTerm, 300);

// Only filter when debounced value changes
const filteredJobs = useMemo(
  () => jobs.filter(j => j.productName.includes(debouncedSearch)),
  [jobs, debouncedSearch]
);
```

---

## 7. Image Optimization

### Lazy Loading Images

```typescript
// src/shared/ui/data/LazyImage.tsx

import { useState, useRef, useEffect } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className,
  placeholder = '/placeholder.svg',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <img
      ref={imgRef}
      src={isInView ? src : placeholder}
      alt={alt}
      className={cn(
        className,
        'transition-opacity duration-300',
        isLoaded ? 'opacity-100' : 'opacity-0'
      )}
      onLoad={() => setIsLoaded(true)}
    />
  );
};
```

---

## 8. Bundle Analysis

### Setup

```bash
npm install -D rollup-plugin-visualizer
```

```typescript
// vite.config.ts

import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['@tanstack/react-router'],
          'vendor-charts': ['recharts'],
          'vendor-icons': ['lucide-react'],
        },
      },
    },
  },
});
```

### Target Bundle Sizes

| Chunk | Target Size (gzip) |
|-------|-------------------|
| Initial (app shell) | < 50 KB |
| vendor-react | < 45 KB |
| vendor-router | < 15 KB |
| vendor-charts | < 40 KB |
| Each page chunk | < 20 KB |

---

## 9. Performance Monitoring

### Add Web Vitals

```bash
npm install web-vitals
```

```typescript
// src/app/vitals.ts

import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  console.log(metric); // Or send to analytics service
}

export function reportWebVitals() {
  onCLS(sendToAnalytics);  // Cumulative Layout Shift
  onFID(sendToAnalytics);  // First Input Delay
  onFCP(sendToAnalytics);  // First Contentful Paint
  onLCP(sendToAnalytics);  // Largest Contentful Paint
  onTTFB(sendToAnalytics); // Time to First Byte
}
```

### Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| LCP | < 2.5s | TBD |
| FID | < 100ms | TBD |
| CLS | < 0.1 | TBD |
| TTI | < 3.5s | TBD |

---

## 10. Production Build Optimizations

### Vite Configuration

```typescript
// vite.config.ts

export default defineConfig({
  build: {
    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // Remove console.logs
        drop_debugger: true,
      },
    },
    
    // Source maps for production debugging (optional)
    sourcemap: false,
    
    // Chunk size warnings
    chunkSizeWarningLimit: 500,
    
    // CSS code splitting
    cssCodeSplit: true,
    
    // Asset inlining threshold
    assetsInlineLimit: 4096,
  },
  
  // Preload critical assets
  optimizeDeps: {
    include: ['react', 'react-dom', 'zustand'],
  },
});
```

---

## Migration Checklist

### Code Splitting
- [ ] Convert routes to lazy imports
- [ ] Add Suspense boundaries with spinners
- [ ] Enable route prefetching on hover

### State Optimization
- [ ] Use selective Zustand subscriptions
- [ ] Add shallow comparison where needed
- [ ] Memoize derived state with useMemo

### Component Optimization
- [ ] Wrap expensive components with memo()
- [ ] Memoize callbacks with useCallback
- [ ] Use stable keys in lists

### Data Loading
- [ ] Implement progressive hydration
- [ ] Add debouncing to search inputs
- [ ] Virtualize long lists

### Build Optimization
- [ ] Configure manual chunks
- [ ] Analyze bundle with visualizer
- [ ] Enable production minification
- [ ] Remove console.logs in prod

### Monitoring
- [ ] Add Web Vitals reporting
- [ ] Set up performance budgets
- [ ] Monitor bundle size in CI

---

## Performance Budget CI Check

```yaml
# .github/workflows/perf.yml

name: Performance Budget

on: [push, pull_request]

jobs:
  bundle-size:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build
      
      - name: Check bundle size
        run: |
          SIZE=$(du -sb dist/assets/*.js | awk '{sum += $1} END {print sum}')
          MAX=512000  # 500KB limit
          if [ $SIZE -gt $MAX ]; then
            echo "Bundle too large: $SIZE bytes (max: $MAX)"
            exit 1
          fi
          echo "Bundle size OK: $SIZE bytes"
```
