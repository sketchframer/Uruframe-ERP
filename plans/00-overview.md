# Structura ERP - Migration Master Plan

## Current State Analysis

### Architecture Issues

| Problem | Impact | Location |
|---------|--------|----------|
| All state in App.tsx | Hard to test, maintain, scale | `App.tsx` (15+ useState) |
| Heavy prop drilling | Views receive 10-15 props each | All views |
| No URL routing | No deep links, back/forward broken | `currentView` state |
| Single localStorage blob | Size limits, no conflict handling | `STORAGE_KEY` |
| Business logic in UI | Rules mixed with rendering | `App.tsx` lines 115-200 |
| No clear boundaries | Can't assign ownership by domain | Entire codebase |

### Current File Structure

```
/
├── App.tsx              # 310 lines, all state + business logic
├── types.ts             # Domain types (good foundation)
├── index.tsx            # React entry
├── views/               # 8 views with prop drilling
│   ├── DashboardView.tsx
│   ├── OperatorTerminal.tsx
│   ├── ProjectsView.tsx   # 697 lines (too large)
│   ├── OrdersView.tsx
│   ├── InventoryView.tsx
│   ├── ClientsView.tsx
│   ├── SettingsView.tsx
│   └── LoginView.tsx
├── components/
│   └── MachineCard.tsx
└── services/
    └── geminiService.ts
```

### Domain Entities Identified

1. **Machine** - Factory machines (conformadora, panelizado, herrería, carga)
2. **Job** - Production orders with workflow stages
3. **Project** - Client projects with deadlines
4. **User** - Operators, admins, supervisors
5. **Client** - Customer master data
6. **Inventory** - Stock items with thresholds
7. **Alert** - System notifications
8. **Message** - Internal messaging
9. **Event** - Factory activity log
10. **Catalog** - Profile catalog items
11. **ProjectAccessory** - Accessories allocated to projects

---

## Target Architecture: Feature-Sliced Design

```
src/
├── app/                    # Application shell
│   ├── providers/
│   ├── routes/
│   └── App.tsx
├── pages/                  # Route entry points
├── widgets/                # Composed UI sections
├── features/               # Business use cases
├── entities/               # Domain models + stores
└── shared/                 # Cross-cutting concerns
```

### FSD Layer Rules

```
app → pages → widgets → features → entities → shared
         ↓         ↓          ↓           ↓
    (can import from layers to the right only)
```

---

## Migration Phases (Core FSD Restructure)

| Phase | Plan File | Effort | Dependencies |
|-------|-----------|--------|--------------|
| 1 | `01-foundation-shared-layer.md` | 1-2 days | None |
| 2 | `02-entities-layer.md` | 3-4 days | Phase 1 |
| 3 | `03-features-layer.md` | 2-3 days | Phase 2 |
| 4 | `04-routing-tanstack.md` | 1-2 days | Phase 2 |
| 5 | `05-widgets-layer.md` | 2-3 days | Phase 3, 4 |
| 6 | `06-app-shell.md` | 1 day | Phase 4, 5 |

## Quality & Best Practices

| Plan | Purpose | Priority |
|------|---------|----------|
| `07-testing-strategy.md` | Unit, integration, E2E testing | High |
| `12-error-handling.md` | Error boundaries, toasts, recovery | High |
| `13-accessibility.md` | WCAG compliance, keyboard nav, screen readers | High |

## Enhancement Plans

| Plan | Purpose | Priority |
|------|---------|----------|
| `08-backend-migration-path.md` | FastAPI + PostgreSQL backend | Medium |
| `09-ui-design-system.md` | Shared UI component library | Medium |
| `10-performance-optimization.md` | Code splitting, lazy loading, memoization | Medium |
| `11-internationalization.md` | Multi-language support (ES/EN) | Low |

---

## Technology Stack (Target)

| Layer | Technology | Why |
|-------|------------|-----|
| State | Zustand | Lightweight, TypeScript-first, no boilerplate |
| Routing | TanStack Router | Type-safe routes, search params |
| Data | Repository pattern | Backend-agnostic, easy to swap |
| Styling | Existing Tailwind classes | No change needed |
| AI | Gemini service | Keep current implementation |

---

## Success Criteria

- [ ] No prop drilling deeper than 2 levels
- [ ] Each entity store is independently testable
- [ ] Business logic is not in UI components
- [ ] URLs work for all pages (deep linking)
- [ ] Adding a new entity requires only `entities/` changes
- [ ] Backend migration requires only `shared/api/` changes

---

## How to Use These Plans

### Recommended Order

**Phase A: Core Architecture (Do First)**
1. `01-foundation-shared-layer.md` - Repository pattern, types, constants
2. `02-entities-layer.md` - Zustand stores for each domain
3. `03-features-layer.md` - Business logic extraction
4. `04-routing-tanstack.md` - URL-based navigation
5. `05-widgets-layer.md` - Composed UI sections
6. `06-app-shell.md` - Final assembly

**Phase B: Quality (Do During/After Core)**
- `07-testing-strategy.md` - Add tests as you build
- `12-error-handling.md` - Error boundaries and toasts
- `13-accessibility.md` - Keyboard nav and ARIA

**Phase C: Enhancements (Do When Needed)**
- `09-ui-design-system.md` - Extract shared components
- `10-performance-optimization.md` - Optimize before production
- `11-internationalization.md` - Add when multi-language needed
- `08-backend-migration-path.md` - Add when localStorage insufficient

### Each Plan Contains

- **Goal**: What you're trying to achieve
- **Directory structure**: Where files go
- **Code examples**: Copy-paste ready
- **Migration checklist**: Step-by-step tasks
- **Verification**: How to test it works

### Start Here

```bash
# Open the first plan
code plans/01-foundation-shared-layer.md
```

---

## Plan Summary

| # | Plan | Lines | Key Deliverables |
|---|------|-------|------------------|
| 00 | Overview | ~135 | This roadmap |
| 01 | Foundation | ~350 | Repository pattern, types, constants |
| 02 | Entities | ~400 | 9 Zustand stores |
| 03 | Features | ~450 | auth, job-management, logistics, ai |
| 04 | Routing | ~300 | TanStack Router, protected routes |
| 05 | Widgets | ~400 | sidebar, dashboard, controls, wizard |
| 06 | App Shell | ~200 | Providers, final App.tsx |
| 07 | Testing | ~700 | Vitest, Testing Library, Playwright |
| 08 | Backend | ~450 | FastAPI, PostgreSQL, JWT |
| 09 | UI System | ~500 | Button, Input, Card, Modal, Badge |
| 10 | Performance | ~400 | Lazy loading, memoization, virtual lists |
| 11 | i18n | ~350 | react-i18next, ES/EN translations |
| 12 | Error Handling | ~400 | ErrorBoundary, Toast, useAsync |
| 13 | Accessibility | ~400 | Focus, ARIA, keyboard, screen readers |

**Total: ~5,000 lines of documentation and code examples**
