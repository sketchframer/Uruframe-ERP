# Plan 13: Accessibility (a11y)

## Goal

Make the app accessible to all users, including those using screen readers, keyboard navigation, or with visual impairments.

---

## Current Issues

| Issue | Impact | WCAG Level |
|-------|--------|------------|
| No focus indicators | Keyboard users can't see where they are | A |
| Color-only status | Color blind users can't distinguish status | A |
| No ARIA labels | Screen readers can't describe elements | A |
| No skip links | Keyboard users must tab through everything | A |
| Low contrast text | Hard to read for low vision | AA |
| No focus trapping in modals | Focus escapes dialogs | A |

---

## 1. Focus Management

### Visible Focus Indicators

```typescript
// src/shared/ui/theme/focus.ts

export const focusRing = `
  focus:outline-none 
  focus-visible:ring-2 
  focus-visible:ring-blue-500 
  focus-visible:ring-offset-2 
  focus-visible:ring-offset-slate-900
`;

export const focusWithin = `
  focus-within:ring-2 
  focus-within:ring-blue-500/50
`;
```

### Update Button Component

```typescript
// src/shared/ui/primitives/Button.tsx

import { focusRing } from '../theme/focus';

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center',
          focusRing,  // Add focus ring
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
```

### Skip to Content Link

```typescript
// src/shared/ui/layout/SkipLink.tsx

export const SkipLink: React.FC = () => (
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4
               focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white
               focus:rounded-lg focus:font-bold"
  >
    Saltar al contenido principal
  </a>
);
```

---

## 2. Semantic HTML & ARIA

### Machine Status with ARIA

```typescript
// src/entities/machine/ui/MachineCard.tsx

export const MachineCard: React.FC<MachineCardProps> = ({ machine }) => {
  const statusLabel = {
    RUNNING: 'en funcionamiento',
    IDLE: 'inactivo',
    ERROR: 'con error',
    MAINTENANCE: 'en mantenimiento',
    OFFLINE: 'fuera de línea',
  }[machine.status];

  return (
    <article
      role="article"
      aria-label={`Máquina ${machine.name}`}
      className="..."
    >
      <header>
        <h3 id={`machine-${machine.id}-title`}>
          {machine.name}
        </h3>
        <div
          role="status"
          aria-label={`Estado: ${statusLabel}`}
          className="..."
        >
          {/* Visual status indicator */}
          <span aria-hidden="true">{machine.status}</span>
          {/* Screen reader text */}
          <span className="sr-only">{statusLabel}</span>
        </div>
      </header>
      
      <div aria-describedby={`machine-${machine.id}-title`}>
        {/* Efficiency with proper labeling */}
        <div>
          <span id={`eff-label-${machine.id}`}>Eficiencia</span>
          <span aria-labelledby={`eff-label-${machine.id}`}>
            {machine.efficiency}%
          </span>
        </div>
      </div>
    </article>
  );
};
```

### Form Accessibility

```typescript
// src/shared/ui/primitives/Input.tsx

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, required, ...props }, ref) => {
    const inputId = id || useId();
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    return (
      <div>
        {label && (
          <label htmlFor={inputId} className="...">
            {label}
            {required && <span aria-hidden="true"> *</span>}
            {required && <span className="sr-only">(requerido)</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={cn(
            error && errorId,
            hint && !error && hintId
          )}
          aria-required={required}
          {...props}
        />
        {error && (
          <p id={errorId} role="alert" className="text-red-500">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={hintId} className="text-slate-500">
            {hint}
          </p>
        )}
      </div>
    );
  }
);
```

---

## 3. Keyboard Navigation

### Modal Focus Trap

```typescript
// src/shared/ui/overlay/Modal.tsx

import { useRef, useEffect } from 'react';

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store current focus
      previousFocus.current = document.activeElement as HTMLElement;
      
      // Focus first focusable element in modal
      const focusable = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      (focusable?.[0] as HTMLElement)?.focus();
    }

    return () => {
      // Restore focus when modal closes
      previousFocus.current?.focus();
    };
  }, [isOpen]);

  // Trap focus within modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      const focusable = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) return;

      const first = focusable[0] as HTMLElement;
      const last = focusable[focusable.length - 1] as HTMLElement;

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      ref={modalRef}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>,
    document.body
  );
};
```

### Keyboard Navigation for Lists

```typescript
// src/widgets/job-queue/ui/JobQueue.tsx

export const JobQueue: React.FC<JobQueueProps> = ({ jobs, onSelect }) => {
  const [focusIndex, setFocusIndex] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusIndex(i => Math.min(i + 1, jobs.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onSelect(jobs[focusIndex].id);
        break;
      case 'Home':
        e.preventDefault();
        setFocusIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusIndex(jobs.length - 1);
        break;
    }
  };

  return (
    <ul
      ref={listRef}
      role="listbox"
      aria-label="Cola de trabajos"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {jobs.map((job, index) => (
        <li
          key={job.id}
          role="option"
          aria-selected={index === focusIndex}
          tabIndex={index === focusIndex ? 0 : -1}
          onClick={() => onSelect(job.id)}
          className={cn(
            'cursor-pointer',
            index === focusIndex && 'ring-2 ring-blue-500'
          )}
        >
          {job.productName}
        </li>
      ))}
    </ul>
  );
};
```

---

## 4. Color & Contrast

### Status with Icons (Not Just Color)

```typescript
// src/shared/ui/feedback/StatusBadge.tsx

import { 
  Play, 
  Pause, 
  AlertCircle, 
  Wrench, 
  Power 
} from 'lucide-react';

const statusConfig = {
  RUNNING: { icon: Play, label: 'En Marcha', color: 'success' },
  IDLE: { icon: Pause, label: 'Inactivo', color: 'warning' },
  ERROR: { icon: AlertCircle, label: 'Error', color: 'error' },
  MAINTENANCE: { icon: Wrench, label: 'Mantención', color: 'warning' },
  OFFLINE: { icon: Power, label: 'Fuera de Línea', color: 'default' },
};

export const StatusBadge: React.FC<{ status: MachineStatus }> = ({ status }) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.color}>
      <Icon size={12} aria-hidden="true" />
      <span>{config.label}</span>
    </Badge>
  );
};
```

### Ensure Sufficient Contrast

```typescript
// src/shared/ui/theme/colors.ts

// All text colors should have at least 4.5:1 contrast ratio
export const accessibleColors = {
  // Background: #0f172a (dark slate)
  text: {
    primary: '#f8fafc',    // Contrast: 15.4:1 ✓
    secondary: '#94a3b8',  // Contrast: 5.2:1 ✓
    muted: '#64748b',      // Contrast: 3.5:1 ✗ (use only for decorative)
  },
  
  // For muted text, use a lighter shade
  textAccessible: {
    muted: '#8b9cb8',      // Contrast: 4.5:1 ✓
  },
};
```

---

## 5. Screen Reader Announcements

### Live Region for Updates

```typescript
// src/shared/ui/feedback/LiveRegion.tsx

import { createContext, useContext, useState, useCallback } from 'react';

interface LiveRegionContextValue {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
}

const LiveRegionContext = createContext<LiveRegionContextValue | null>(null);

export const LiveRegionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [politeMessage, setPoliteMessage] = useState('');
  const [assertiveMessage, setAssertiveMessage] = useState('');

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (priority === 'assertive') {
      setAssertiveMessage('');
      setTimeout(() => setAssertiveMessage(message), 100);
    } else {
      setPoliteMessage('');
      setTimeout(() => setPoliteMessage(message), 100);
    }
  }, []);

  return (
    <LiveRegionContext.Provider value={{ announce }}>
      {children}
      {/* Polite announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {politeMessage}
      </div>
      {/* Assertive announcements (interrupts) */}
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {assertiveMessage}
      </div>
    </LiveRegionContext.Provider>
  );
};

export const useLiveRegion = () => {
  const context = useContext(LiveRegionContext);
  if (!context) throw new Error('useLiveRegion must be used within LiveRegionProvider');
  return context;
};
```

### Usage

```typescript
// When a job is completed
const { announce } = useLiveRegion();

const handleComplete = async () => {
  await completeJob(jobId);
  announce('Trabajo completado exitosamente');
};

// For critical alerts
const handleError = () => {
  announce('Error: La máquina se ha detenido', 'assertive');
};
```

---

## 6. Responsive Text Size

```css
/* src/shared/styles/accessibility.css */

/* Respect user's font size preferences */
html {
  font-size: 100%; /* 16px base, scales with browser settings */
}

/* Use rem/em for text, not px */
.text-base {
  font-size: 0.875rem; /* 14px at default, scales up if user increases font size */
}

/* Ensure text can be zoomed to 200% without breaking layout */
@media (min-width: 320px) {
  html {
    font-size: calc(14px + (16 - 14) * ((100vw - 320px) / (1920 - 320)));
  }
}
```

---

## 7. Reduced Motion

```typescript
// src/shared/hooks/usePrefersReducedMotion.ts

import { useState, useEffect } from 'react';

export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}
```

```typescript
// Usage in animations
const prefersReducedMotion = usePrefersReducedMotion();

<div
  className={cn(
    'transition-all',
    prefersReducedMotion ? 'duration-0' : 'duration-300'
  )}
/>
```

---

## Testing Checklist

### Automated Testing
- [ ] Run axe-core on all pages
- [ ] Check color contrast ratios
- [ ] Validate HTML semantics

### Manual Testing
- [ ] Navigate entire app with keyboard only
- [ ] Test with screen reader (VoiceOver/NVDA)
- [ ] Test at 200% zoom
- [ ] Test with reduced motion enabled
- [ ] Test with high contrast mode

### WCAG Compliance Targets
- [ ] Level A: All criteria met
- [ ] Level AA: All criteria met
- [ ] Level AAA: Best effort

---

## Migration Checklist

- [ ] Add focus ring styles to all interactive elements
- [ ] Add skip link component
- [ ] Add ARIA labels to all buttons/links
- [ ] Add role and aria-label to status badges
- [ ] Implement focus trap in modals
- [ ] Add keyboard navigation to lists
- [ ] Ensure all colors meet contrast requirements
- [ ] Add icons alongside color indicators
- [ ] Create LiveRegion provider
- [ ] Test with screen reader
- [ ] Add reduced motion support
