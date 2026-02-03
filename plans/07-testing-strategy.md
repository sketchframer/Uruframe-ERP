# Plan 7: Testing Strategy

## Goal

Establish a comprehensive testing strategy for the ERP system covering unit tests, integration tests, and E2E tests.

---

## Testing Pyramid

```
        /\
       /  \     E2E Tests (Playwright)
      /----\    - Critical user flows
     /      \   - 5-10 tests
    /--------\  
   /          \ Integration Tests (Vitest + Testing Library)
  /------------\  - Feature combinations
 /              \ - Store interactions
/----------------\ - 20-30 tests

Unit Tests (Vitest)
- Pure functions
- Store logic
- Utilities
- 50+ tests
```

---

## Install Dependencies

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
npm install -D @playwright/test
npm install -D @vitest/coverage-v8
```

---

## Configuration

### vitest.config.ts

```typescript
// vitest.config.ts

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Test Setup

```typescript
// src/test/setup.ts

import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as any;

// Reset mocks between tests
afterEach(() => {
  vi.clearAllMocks();
  localStorageMock.getItem.mockReset();
  localStorageMock.setItem.mockReset();
});
```

### Test Utilities

```typescript
// src/test/utils.tsx

import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { RouterProvider, createMemoryHistory, createRouter } from '@tanstack/react-router';

// Custom render with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialRoute?: string;
}

export function renderWithProviders(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) {
  const { initialRoute = '/', ...renderOptions } = options;

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return <>{children}</>;
  };

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Store test helper
export function createMockStore<T>(initialState: T) {
  let state = initialState;
  const listeners = new Set<() => void>();

  return {
    getState: () => state,
    setState: (newState: Partial<T>) => {
      state = { ...state, ...newState };
      listeners.forEach(listener => listener());
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    reset: () => {
      state = initialState;
    },
  };
}
```

---

## Unit Tests

### Testing Pure Functions (lib/)

```typescript
// src/features/job-management/lib/jobSequencing.test.ts

import { describe, it, expect } from 'vitest';
import {
  areAllConformadoraJobsComplete,
  areAllJobsComplete,
  createPanelizadoJob,
} from './jobSequencing';

describe('jobSequencing', () => {
  describe('areAllConformadoraJobsComplete', () => {
    it('returns true when all CC jobs are completed', () => {
      const jobs = [
        { id: '1', projectId: 'P1', machineType: 'CONFORMADORA', status: 'COMPLETED' },
        { id: '2', projectId: 'P1', machineType: 'CONFORMADORA', status: 'COMPLETED' },
        { id: '3', projectId: 'P1', machineType: 'PANELIZADO', status: 'PENDING' },
      ] as any[];

      expect(areAllConformadoraJobsComplete(jobs, 'P1')).toBe(true);
    });

    it('returns false when some CC jobs are not completed', () => {
      const jobs = [
        { id: '1', projectId: 'P1', machineType: 'CONFORMADORA', status: 'COMPLETED' },
        { id: '2', projectId: 'P1', machineType: 'CONFORMADORA', status: 'IN_PROGRESS' },
      ] as any[];

      expect(areAllConformadoraJobsComplete(jobs, 'P1')).toBe(false);
    });

    it('returns false when there are no CC jobs', () => {
      const jobs = [
        { id: '1', projectId: 'P1', machineType: 'PANELIZADO', status: 'COMPLETED' },
      ] as any[];

      expect(areAllConformadoraJobsComplete(jobs, 'P1')).toBe(false);
    });

    it('ignores jobs from other projects', () => {
      const jobs = [
        { id: '1', projectId: 'P1', machineType: 'CONFORMADORA', status: 'COMPLETED' },
        { id: '2', projectId: 'P2', machineType: 'CONFORMADORA', status: 'PENDING' },
      ] as any[];

      expect(areAllConformadoraJobsComplete(jobs, 'P1')).toBe(true);
    });
  });

  describe('createPanelizadoJob', () => {
    it('creates a panelizado job with correct properties', () => {
      const job = createPanelizadoJob('P1', 'Test Project', 'M-PANEL');

      expect(job).toEqual({
        projectId: 'P1',
        productName: 'PANELIZADO: Test Project',
        targetQuantity: 1,
        completedQuantity: 0,
        unit: 'proyecto',
        machineType: 'PANELIZADO',
        status: 'PENDING',
        assignedMachineId: 'M-PANEL',
        priorityIndex: 99,
      });
    });
  });
});
```

### Testing Utilities

```typescript
// src/shared/utils/id.test.ts

import { describe, it, expect, vi } from 'vitest';
import { generateId, generateJobId, generateProjectId } from './id';

describe('id utilities', () => {
  it('generateId creates unique IDs with prefix', () => {
    const id1 = generateId('TEST');
    const id2 = generateId('TEST');

    expect(id1).toMatch(/^TEST-\d+-[a-z0-9]+$/);
    expect(id1).not.toBe(id2);
  });

  it('generateJobId creates job IDs', () => {
    const id = generateJobId();
    expect(id).toMatch(/^JOB-/);
  });

  it('generateProjectId creates project IDs', () => {
    const id = generateProjectId();
    expect(id).toMatch(/^PRJ-/);
  });
});
```

### Testing Validation

```typescript
// src/features/auth/lib/pinValidation.test.ts

import { describe, it, expect } from 'vitest';
import { validatePinFormat } from './pinValidation';

describe('pinValidation', () => {
  it('accepts 4-digit PINs', () => {
    expect(validatePinFormat('1234')).toBe(true);
    expect(validatePinFormat('0000')).toBe(true);
    expect(validatePinFormat('9999')).toBe(true);
  });

  it('rejects non-4-digit strings', () => {
    expect(validatePinFormat('123')).toBe(false);
    expect(validatePinFormat('12345')).toBe(false);
    expect(validatePinFormat('')).toBe(false);
  });

  it('rejects non-numeric strings', () => {
    expect(validatePinFormat('abcd')).toBe(false);
    expect(validatePinFormat('12ab')).toBe(false);
    expect(validatePinFormat('12.4')).toBe(false);
  });
});
```

---

## Store Tests

### Testing Zustand Stores

```typescript
// src/entities/machine/model/machineStore.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useMachineStore } from './machineStore';
import { MachineStatus } from '@/shared/types';

// Mock the repository
vi.mock('../api/machineRepository', () => ({
  machineRepository: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

import { machineRepository } from '../api/machineRepository';

describe('machineStore', () => {
  beforeEach(() => {
    // Reset store state
    useMachineStore.setState({
      machines: [],
      isLoading: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  describe('fetchAll', () => {
    it('loads machines and sets loading state', async () => {
      const mockMachines = [
        { id: 'M-01', name: 'Machine 1', status: MachineStatus.IDLE },
      ];
      (machineRepository.getAll as any).mockResolvedValue(mockMachines);

      await useMachineStore.getState().fetchAll();

      expect(useMachineStore.getState().machines).toEqual(mockMachines);
      expect(useMachineStore.getState().isLoading).toBe(false);
    });

    it('handles errors', async () => {
      (machineRepository.getAll as any).mockRejectedValue(new Error('Network error'));

      await useMachineStore.getState().fetchAll();

      expect(useMachineStore.getState().error).toBe('Network error');
      expect(useMachineStore.getState().isLoading).toBe(false);
    });
  });

  describe('updateStatus', () => {
    it('updates machine status in store and repository', async () => {
      useMachineStore.setState({
        machines: [{ id: 'M-01', name: 'Machine 1', status: MachineStatus.IDLE }] as any,
      });
      (machineRepository.update as any).mockResolvedValue({});

      await useMachineStore.getState().updateStatus('M-01', MachineStatus.RUNNING);

      expect(machineRepository.update).toHaveBeenCalledWith('M-01', {
        status: MachineStatus.RUNNING,
      });
      expect(useMachineStore.getState().machines[0].status).toBe(MachineStatus.RUNNING);
    });
  });

  describe('getById', () => {
    it('returns machine by id', () => {
      const machine = { id: 'M-01', name: 'Machine 1' };
      useMachineStore.setState({ machines: [machine] as any });

      expect(useMachineStore.getState().getById('M-01')).toEqual(machine);
    });

    it('returns undefined for non-existent id', () => {
      useMachineStore.setState({ machines: [] });

      expect(useMachineStore.getState().getById('M-99')).toBeUndefined();
    });
  });
});
```

---

## Component Tests

### Testing UI Components

```typescript
// src/entities/machine/ui/MachineCard.test.tsx

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MachineCard } from './MachineCard';
import { MachineStatus } from '@/shared/types';

describe('MachineCard', () => {
  const mockMachine = {
    id: 'M-01',
    name: 'Test Machine',
    brand: 'TestBrand',
    type: 'CONFORMADORA' as const,
    status: MachineStatus.IDLE,
    efficiency: 85,
    operatorIds: [],
    currentJobId: null,
    isActive: true,
    oee_availability: 90,
    oee_performance: 88,
    oee_quality: 95,
    totalMetersProduced: 1000,
    nextMaintenanceMeters: 2000,
  };

  it('renders machine name and brand', () => {
    render(
      <MachineCard
        machine={mockMachine}
        onClick={() => {}}
        onEdit={() => {}}
      />
    );

    expect(screen.getByText('Test Machine')).toBeInTheDocument();
    expect(screen.getByText('TestBrand')).toBeInTheDocument();
  });

  it('displays correct status badge', () => {
    render(
      <MachineCard
        machine={mockMachine}
        onClick={() => {}}
        onEdit={() => {}}
      />
    );

    expect(screen.getByText('IDLE')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(
      <MachineCard
        machine={mockMachine}
        onClick={onClick}
        onEdit={() => {}}
      />
    );

    fireEvent.click(screen.getByText('Test Machine'));
    expect(onClick).toHaveBeenCalled();
  });

  it('shows active job info when provided', () => {
    const activeJob = {
      id: 'J-01',
      productName: 'Test Product',
      targetQuantity: 100,
      completedQuantity: 50,
    };

    render(
      <MachineCard
        machine={mockMachine}
        activeJob={activeJob as any}
        onClick={() => {}}
        onEdit={() => {}}
      />
    );

    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });
});
```

### Testing Feature Hooks

```typescript
// src/features/auth/model/useAuth.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from './useAuth';
import { useUserStore } from '@/entities/user';

vi.mock('@/entities/user', () => ({
  useUserStore: vi.fn(),
}));

describe('useAuth', () => {
  const mockLogin = vi.fn();
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useUserStore as any).mockImplementation((selector: any) => {
      const state = {
        currentUser: null,
        login: mockLogin,
        logout: mockLogout,
      };
      return selector(state);
    });
  });

  it('returns isAuthenticated false when no user', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.currentUser).toBeNull();
  });

  it('login calls store login with PIN', async () => {
    mockLogin.mockResolvedValue({ id: 'U-01', name: 'Test User' });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      const response = await result.current.login('1234');
      expect(response.success).toBe(true);
    });

    expect(mockLogin).toHaveBeenCalledWith('1234');
  });

  it('login returns error for invalid PIN format', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      const response = await result.current.login('12');
      expect(response.success).toBe(false);
      expect(response.error).toBe('PIN must be 4 digits');
    });

    expect(mockLogin).not.toHaveBeenCalled();
  });
});
```

---

## E2E Tests (Playwright)

### Configuration

```typescript
// playwright.config.ts

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

### E2E Test Examples

```typescript
// e2e/auth.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should login with valid PIN', async ({ page }) => {
    await page.goto('/login');

    // Enter PIN
    await page.click('button:has-text("1")');
    await page.click('button:has-text("2")');
    await page.click('button:has-text("3")');
    await page.click('button:has-text("4")');

    // Should redirect to dashboard
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should show error for invalid PIN', async ({ page }) => {
    await page.goto('/login');

    // Enter wrong PIN
    await page.click('button:has-text("9")');
    await page.click('button:has-text("9")');
    await page.click('button:has-text("9")');
    await page.click('button:has-text("9")');

    // Should show error
    await expect(page.locator('text=Acceso Denegado')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.click('button:has-text("1")');
    await page.click('button:has-text("2")');
    await page.click('button:has-text("3")');
    await page.click('button:has-text("4")');

    // Click logout
    await page.click('button:has-text("Salir")');

    // Should be back at login
    await expect(page).toHaveURL('/login');
  });
});
```

```typescript
// e2e/operator-flow.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Operator Terminal', () => {
  test.beforeEach(async ({ page }) => {
    // Login as operator
    await page.goto('/login');
    await page.click('button:has-text("0")');
    await page.click('button:has-text("0")');
    await page.click('button:has-text("0")');
    await page.click('button:has-text("0")');
  });

  test('should show operator terminal after login', async ({ page }) => {
    await expect(page.locator('text=OPERADOR ACTIVO')).toBeVisible();
  });

  test('should update job progress with slider', async ({ page }) => {
    // Assuming there's an active job
    const slider = page.locator('input[type="range"]');
    if (await slider.isVisible()) {
      await slider.fill('50');
      await expect(page.locator('text=50%')).toBeVisible();
    }
  });
});
```

---

## Test Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:watch": "vitest --watch",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

## Test Coverage Goals

| Layer | Target Coverage |
|-------|-----------------|
| `shared/lib/` | 90%+ |
| `shared/utils/` | 90%+ |
| `features/*/lib/` | 85%+ |
| `entities/*/model/` | 80%+ |
| `features/*/model/` | 75%+ |
| UI components | 60%+ |
| E2E critical paths | 100% |

---

## Migration Checklist

- [ ] Install testing dependencies
- [ ] Create `vitest.config.ts`
- [ ] Create `src/test/setup.ts`
- [ ] Create `src/test/utils.tsx`
- [ ] Write unit tests for `shared/lib/` and `shared/utils/`
- [ ] Write unit tests for `features/*/lib/`
- [ ] Write store tests for each entity
- [ ] Write component tests for key UI components
- [ ] Create `playwright.config.ts`
- [ ] Write E2E tests for auth flow
- [ ] Write E2E tests for operator flow
- [ ] Write E2E tests for admin flow
- [ ] Set up CI to run tests on push

---

## Continuous Integration

```yaml
# .github/workflows/test.yml

name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run test:coverage
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```
