# Plan 11: Internationalization (i18n)

## Goal

Add multi-language support to the app, starting with Spanish (current) and English.

---

## Current State

All text is hardcoded in Spanish throughout the codebase:
- UI labels: "Crear Proyecto", "Guardar", "Cancelar"
- Status labels: "En Marcha", "Inactivo", "Error"
- Messages: "Acceso Denegado", "PROYECTO LISTO"

---

## Technology Choice

| Option | Pros | Cons |
|--------|------|------|
| react-i18next | Most popular, feature-rich | Slightly heavier |
| react-intl | Good for formatting | More verbose |
| Custom hooks | Lightweight | Limited features |

**Recommendation**: `react-i18next` - industry standard, good tooling.

---

## Installation

```bash
npm install i18next react-i18next i18next-browser-languagedetector
```

---

## Directory Structure

```
src/
├── shared/
│   └── i18n/
│       ├── index.ts           # i18n configuration
│       ├── locales/
│       │   ├── es/
│       │   │   ├── common.json
│       │   │   ├── dashboard.json
│       │   │   ├── machines.json
│       │   │   ├── jobs.json
│       │   │   ├── projects.json
│       │   │   └── settings.json
│       │   └── en/
│       │       ├── common.json
│       │       ├── dashboard.json
│       │       ├── machines.json
│       │       ├── jobs.json
│       │       ├── projects.json
│       │       └── settings.json
│       └── types.ts           # Type definitions
```

---

## i18n Configuration

```typescript
// src/shared/i18n/index.ts

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import esCommon from './locales/es/common.json';
import esDashboard from './locales/es/dashboard.json';
import esMachines from './locales/es/machines.json';
import esJobs from './locales/es/jobs.json';
import esProjects from './locales/es/projects.json';
import esSettings from './locales/es/settings.json';

import enCommon from './locales/en/common.json';
import enDashboard from './locales/en/dashboard.json';
import enMachines from './locales/en/machines.json';
import enJobs from './locales/en/jobs.json';
import enProjects from './locales/en/projects.json';
import enSettings from './locales/en/settings.json';

export const resources = {
  es: {
    common: esCommon,
    dashboard: esDashboard,
    machines: esMachines,
    jobs: esJobs,
    projects: esProjects,
    settings: esSettings,
  },
  en: {
    common: enCommon,
    dashboard: enDashboard,
    machines: enMachines,
    jobs: enJobs,
    projects: enProjects,
    settings: enSettings,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'es',
    defaultNS: 'common',
    
    interpolation: {
      escapeValue: false, // React already escapes
    },
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
```

---

## Translation Files

### Spanish (Current - Extract from Code)

```json
// src/shared/i18n/locales/es/common.json
{
  "app": {
    "name": "STRUCTURA",
    "tagline": "Sistema de Gestión de Planta"
  },
  "nav": {
    "dashboard": "Dashboard",
    "terminal": "Terminal",
    "projects": "Proyectos",
    "production": "Producción",
    "inventory": "Stock",
    "clients": "Clientes",
    "settings": "Ajustes",
    "logout": "Salir"
  },
  "actions": {
    "save": "Guardar",
    "cancel": "Cancelar",
    "create": "Crear",
    "edit": "Editar",
    "delete": "Eliminar",
    "confirm": "Confirmar",
    "back": "Volver",
    "next": "Siguiente",
    "search": "Buscar",
    "filter": "Filtrar",
    "close": "Cerrar"
  },
  "status": {
    "loading": "Cargando...",
    "error": "Error",
    "success": "Éxito",
    "pending": "Pendiente",
    "completed": "Completado",
    "inProgress": "En Progreso"
  }
}
```

```json
// src/shared/i18n/locales/es/machines.json
{
  "status": {
    "running": "En Marcha",
    "idle": "Inactivo",
    "error": "Error",
    "maintenance": "Mantención",
    "offline": "Fuera de Línea"
  },
  "types": {
    "conformadora": "Conformadora",
    "panelizado": "Panelizado",
    "soldadura": "Soldadura",
    "pintura": "Pintura",
    "carga": "Carga",
    "herreria": "Herrería"
  },
  "labels": {
    "efficiency": "Eficiencia",
    "oee": "OEE",
    "availability": "Disponibilidad",
    "performance": "Rendimiento",
    "quality": "Calidad",
    "operators": "Operadores",
    "currentJob": "Trabajo Actual",
    "noJob": "Sin trabajo asignado"
  },
  "actions": {
    "start": "Iniciar",
    "stop": "Detener",
    "pause": "Pausar",
    "maintenance": "Enviar a Mantención"
  }
}
```

```json
// src/shared/i18n/locales/es/jobs.json
{
  "status": {
    "pending": "Pendiente",
    "inProgress": "En Progreso",
    "completed": "Completado",
    "halted": "Detenido"
  },
  "labels": {
    "product": "Producto",
    "quantity": "Cantidad",
    "progress": "Progreso",
    "machine": "Máquina",
    "project": "Proyecto",
    "priority": "Prioridad",
    "notes": "Notas",
    "queue": "Cola de Trabajos"
  },
  "actions": {
    "complete": "Marcar Completo",
    "loadJob": "Cargar Trabajo",
    "updateProgress": "Actualizar Progreso"
  },
  "messages": {
    "jobCompleted": "Trabajo completado exitosamente",
    "noJobsInQueue": "No hay trabajos en la cola"
  }
}
```

```json
// src/shared/i18n/locales/es/projects.json
{
  "status": {
    "planning": "Planificación",
    "inProgress": "En Progreso",
    "completed": "Completado",
    "delayed": "Retrasado",
    "archived": "Archivado"
  },
  "labels": {
    "name": "Nombre",
    "client": "Cliente",
    "deadline": "Fecha Límite",
    "description": "Descripción",
    "jobs": "Trabajos",
    "accessories": "Accesorios"
  },
  "wizard": {
    "step1": "Cliente y Datos",
    "step2": "Trabajos",
    "step3": "Revisión",
    "selectClient": "Seleccionar Cliente",
    "addJob": "Agregar Trabajo"
  },
  "messages": {
    "readyForDelivery": "PROYECTO LISTO: {{name}} está pronto para despacho.",
    "created": "Proyecto creado exitosamente"
  }
}
```

### English

```json
// src/shared/i18n/locales/en/common.json
{
  "app": {
    "name": "STRUCTURA",
    "tagline": "Plant Management System"
  },
  "nav": {
    "dashboard": "Dashboard",
    "terminal": "Terminal",
    "projects": "Projects",
    "production": "Production",
    "inventory": "Inventory",
    "clients": "Clients",
    "settings": "Settings",
    "logout": "Logout"
  },
  "actions": {
    "save": "Save",
    "cancel": "Cancel",
    "create": "Create",
    "edit": "Edit",
    "delete": "Delete",
    "confirm": "Confirm",
    "back": "Back",
    "next": "Next",
    "search": "Search",
    "filter": "Filter",
    "close": "Close"
  },
  "status": {
    "loading": "Loading...",
    "error": "Error",
    "success": "Success",
    "pending": "Pending",
    "completed": "Completed",
    "inProgress": "In Progress"
  }
}
```

```json
// src/shared/i18n/locales/en/machines.json
{
  "status": {
    "running": "Running",
    "idle": "Idle",
    "error": "Error",
    "maintenance": "Maintenance",
    "offline": "Offline"
  },
  "types": {
    "conformadora": "Roll Former",
    "panelizado": "Panelizer",
    "soldadura": "Welding",
    "pintura": "Painting",
    "carga": "Loading",
    "herreria": "Metalwork"
  },
  "labels": {
    "efficiency": "Efficiency",
    "oee": "OEE",
    "availability": "Availability",
    "performance": "Performance",
    "quality": "Quality",
    "operators": "Operators",
    "currentJob": "Current Job",
    "noJob": "No job assigned"
  },
  "actions": {
    "start": "Start",
    "stop": "Stop",
    "pause": "Pause",
    "maintenance": "Send to Maintenance"
  }
}
```

---

## Usage in Components

### With useTranslation Hook

```typescript
// src/widgets/sidebar/ui/Sidebar.tsx

import { useTranslation } from 'react-i18next';

export const Sidebar: React.FC = () => {
  const { t } = useTranslation();

  return (
    <aside>
      <NavItem
        icon={<LayoutDashboard />}
        label={t('nav.dashboard')}
        to="/"
      />
      <NavItem
        icon={<ClipboardList />}
        label={t('nav.projects')}
        to="/projects"
      />
      {/* ... */}
    </aside>
  );
};
```

### With Namespace

```typescript
// src/entities/machine/ui/MachineCard.tsx

import { useTranslation } from 'react-i18next';

export const MachineCard: React.FC<MachineCardProps> = ({ machine }) => {
  const { t } = useTranslation('machines');

  return (
    <div>
      <Badge>{t(`status.${machine.status.toLowerCase()}`)}</Badge>
      <span>{t('labels.efficiency')}: {machine.efficiency}%</span>
    </div>
  );
};
```

### With Interpolation

```typescript
// src/features/logistics-messaging/lib/messageRules.ts

import i18n from '@/shared/i18n';

export function createDispatchMessage(project: Project): string {
  return i18n.t('projects:messages.readyForDelivery', { 
    name: project.name 
  });
}
```

---

## Language Switcher Component

```typescript
// src/shared/ui/LanguageSwitcher.tsx

import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
];

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  return (
    <div className="flex gap-2">
      {languages.map(lang => (
        <button
          key={lang.code}
          onClick={() => i18n.changeLanguage(lang.code)}
          className={cn(
            'px-3 py-2 rounded-lg transition-all',
            i18n.language === lang.code
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          )}
        >
          {lang.flag} {lang.label}
        </button>
      ))}
    </div>
  );
};
```

---

## Type Safety

```typescript
// src/shared/i18n/types.ts

import { resources } from './index';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: typeof resources['es'];
  }
}
```

This gives autocomplete for translation keys:
```typescript
t('nav.dashboard')  // ✓ Autocompleted
t('nav.invalid')    // ✗ Type error
```

---

## Provider Setup

```typescript
// src/app/providers/I18nProvider.tsx

import { I18nextProvider } from 'react-i18next';
import i18n from '@/shared/i18n';

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};
```

```typescript
// src/app/App.tsx

import { I18nProvider } from './providers/I18nProvider';

export function App() {
  return (
    <I18nProvider>
      <RouterProvider router={router} />
    </I18nProvider>
  );
}
```

---

## Migration Checklist

### Setup
- [ ] Install i18next dependencies
- [ ] Create i18n configuration
- [ ] Set up language detection
- [ ] Create translation file structure

### Extract Translations
- [ ] Extract common.json (nav, actions, status)
- [ ] Extract machines.json (machine-specific)
- [ ] Extract jobs.json (job-specific)
- [ ] Extract projects.json (project-specific)
- [ ] Extract settings.json (settings page)
- [ ] Extract dashboard.json (dashboard-specific)

### Create English Translations
- [ ] Translate common.json
- [ ] Translate machines.json
- [ ] Translate jobs.json
- [ ] Translate projects.json
- [ ] Translate settings.json
- [ ] Translate dashboard.json

### Update Components
- [ ] Update Sidebar with useTranslation
- [ ] Update MachineCard with useTranslation
- [ ] Update JobCard with useTranslation
- [ ] Update all views with useTranslation
- [ ] Update all widgets with useTranslation

### Features
- [ ] Add LanguageSwitcher to Settings
- [ ] Add language preference to user store
- [ ] Test RTL support (if needed later)

---

## Future Languages

To add a new language (e.g., Portuguese):

1. Create `src/shared/i18n/locales/pt/` folder
2. Copy and translate all JSON files
3. Add to resources in `index.ts`:
```typescript
import ptCommon from './locales/pt/common.json';
// ...

export const resources = {
  es: { /* ... */ },
  en: { /* ... */ },
  pt: {
    common: ptCommon,
    // ...
  },
};
```
4. Add to language switcher
