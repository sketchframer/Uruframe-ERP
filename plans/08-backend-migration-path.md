# Phase 8: Backend Migration Path

## Goal

This plan documents how to migrate from localStorage to a real backend when ready. The architecture from phases 1-6 makes this transition straightforward.

---

## Current State (After FSD Migration)

```
Browser
  └── Zustand Stores
        └── Repository Interface
              └── localStorageRepository.ts  ← swap this
```

---

## Target State (With Backend)

```
Browser
  └── Zustand Stores
        └── Repository Interface
              └── apiRepository.ts  ← new implementation
                    └── FastAPI Backend
                          └── PostgreSQL
```

---

## Backend Technology Stack (Recommended)

| Layer | Technology | Why |
|-------|------------|-----|
| API Framework | FastAPI | Fast, typed, Python, auto OpenAPI docs |
| Database | PostgreSQL | Robust, supports JSON, good for ERP |
| ORM | SQLAlchemy 2.0 | Async support, type hints |
| Auth | JWT + PIN | Keep current PIN flow, add tokens |
| Deployment | Docker + Railway/Render | Simple, scalable |

---

## Step 1: Create API Repository

### New File Structure

```
src/shared/api/
├── repository.ts           # Interface (unchanged)
├── localStorageRepository.ts
├── apiRepository.ts        # NEW
├── apiClient.ts            # NEW - fetch wrapper
└── config.ts               # NEW - API URL config
```

### API Client

```typescript
// src/shared/api/apiClient.ts

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
}

class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: unknown
  ) {
    super(`API Error: ${status} ${statusText}`);
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;

  // Get auth token from user store
  const token = localStorage.getItem('auth_token');

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new ApiError(response.status, response.statusText, data);
  }

  return response.json();
}

// Convenience methods
export const api = {
  get: <T>(endpoint: string) => apiClient<T>(endpoint),
  post: <T>(endpoint: string, body: unknown) =>
    apiClient<T>(endpoint, { method: 'POST', body }),
  put: <T>(endpoint: string, body: unknown) =>
    apiClient<T>(endpoint, { method: 'PUT', body }),
  patch: <T>(endpoint: string, body: unknown) =>
    apiClient<T>(endpoint, { method: 'PATCH', body }),
  delete: <T>(endpoint: string) =>
    apiClient<T>(endpoint, { method: 'DELETE' }),
};
```

### API Repository Implementation

```typescript
// src/shared/api/apiRepository.ts

import type { Repository } from './repository';
import { api } from './apiClient';

export function createApiRepository<T extends { id: string }>(
  endpoint: string
): Repository<T> {
  return {
    async getAll(): Promise<T[]> {
      return api.get<T[]>(endpoint);
    },

    async getById(id: string): Promise<T | null> {
      try {
        return await api.get<T>(`${endpoint}/${id}`);
      } catch (error) {
        if ((error as any).status === 404) return null;
        throw error;
      }
    },

    async create(item: Omit<T, 'id'> & { id?: string }): Promise<T> {
      return api.post<T>(endpoint, item);
    },

    async update(id: string, updates: Partial<T>): Promise<T> {
      return api.patch<T>(`${endpoint}/${id}`, updates);
    },

    async delete(id: string): Promise<void> {
      await api.delete(`${endpoint}/${id}`);
    },

    async query(predicate: (item: T) => boolean): Promise<T[]> {
      // For complex queries, implement server-side filtering
      // For now, filter client-side
      const all = await this.getAll();
      return all.filter(predicate);
    },
  };
}
```

---

## Step 2: Swap Repository in Entity Stores

### Before (localStorage)

```typescript
// src/entities/machine/api/machineRepository.ts

import { createLocalStorageRepository } from '@/shared/api/localStorageRepository';
import type { Machine } from '@/shared/types';

export const machineRepository = createLocalStorageRepository<Machine>('machines');
```

### After (API)

```typescript
// src/entities/machine/api/machineRepository.ts

import { createApiRepository } from '@/shared/api/apiRepository';
import type { Machine } from '@/shared/types';

export const machineRepository = createApiRepository<Machine>('/api/machines');
```

### Toggle with Environment Variable

```typescript
// src/entities/machine/api/machineRepository.ts

import { createLocalStorageRepository } from '@/shared/api/localStorageRepository';
import { createApiRepository } from '@/shared/api/apiRepository';
import type { Machine } from '@/shared/types';

const USE_API = import.meta.env.VITE_USE_API === 'true';

export const machineRepository = USE_API
  ? createApiRepository<Machine>('/api/machines')
  : createLocalStorageRepository<Machine>('machines');
```

---

## Step 3: Backend API Design

### Endpoints

```
# Machines
GET    /api/machines           # List all
GET    /api/machines/:id       # Get one
POST   /api/machines           # Create
PATCH  /api/machines/:id       # Update
DELETE /api/machines/:id       # Delete

# Jobs
GET    /api/jobs               # List all (with filters)
GET    /api/jobs/:id           # Get one
POST   /api/jobs               # Create
PATCH  /api/jobs/:id           # Update (progress, status)
DELETE /api/jobs/:id           # Delete

# Projects
GET    /api/projects           # List all
GET    /api/projects/:id       # Get one with jobs
POST   /api/projects           # Create
PATCH  /api/projects/:id       # Update
DELETE /api/projects/:id       # Delete

# Users
GET    /api/users              # List all (admin only)
POST   /api/users              # Create (admin only)
PATCH  /api/users/:id          # Update
DELETE /api/users/:id          # Delete (admin only)

# Auth
POST   /api/auth/login         # PIN login, returns JWT
POST   /api/auth/logout        # Invalidate token
GET    /api/auth/me            # Current user

# Clients
GET    /api/clients            # List all
POST   /api/clients            # Create
PATCH  /api/clients/:id        # Update
DELETE /api/clients/:id        # Delete

# Inventory
GET    /api/inventory          # List all
POST   /api/inventory          # Create
PATCH  /api/inventory/:id      # Update
DELETE /api/inventory/:id      # Delete

# Alerts
GET    /api/alerts             # List all (with filters)
POST   /api/alerts             # Create
PATCH  /api/alerts/:id         # Dismiss/update
DELETE /api/alerts/:id         # Delete

# Messages
GET    /api/messages           # List for current user
POST   /api/messages           # Send
PATCH  /api/messages/:id       # Mark read
DELETE /api/messages/:id       # Delete

# Events
GET    /api/events             # List all (paginated)
POST   /api/events             # Log event
```

---

## Step 4: FastAPI Backend Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py               # FastAPI app
│   ├── config.py             # Settings
│   ├── database.py           # DB connection
│   ├── models/               # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── machine.py
│   │   ├── job.py
│   │   ├── project.py
│   │   ├── user.py
│   │   ├── client.py
│   │   ├── inventory.py
│   │   ├── alert.py
│   │   ├── message.py
│   │   └── event.py
│   ├── schemas/              # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── machine.py
│   │   ├── job.py
│   │   └── ...
│   ├── routers/              # API routes
│   │   ├── __init__.py
│   │   ├── machines.py
│   │   ├── jobs.py
│   │   ├── projects.py
│   │   ├── auth.py
│   │   └── ...
│   ├── services/             # Business logic
│   │   ├── __init__.py
│   │   ├── job_service.py
│   │   └── logistics_service.py
│   └── auth/
│       ├── __init__.py
│       ├── jwt.py
│       └── dependencies.py
├── alembic/                  # Migrations
├── tests/
├── pyproject.toml
├── Dockerfile
└── docker-compose.yml
```

### Example: Machine Model

```python
# backend/app/models/machine.py

from sqlalchemy import Column, String, Integer, Float, Boolean, Enum, ARRAY
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class MachineStatus(str, enum.Enum):
    RUNNING = "RUNNING"
    IDLE = "IDLE"
    MAINTENANCE = "MAINTENANCE"
    ERROR = "ERROR"
    OFFLINE = "OFFLINE"

class MachineType(str, enum.Enum):
    CONFORMADORA = "CONFORMADORA"
    PANELIZADO = "PANELIZADO"
    SOLDADURA = "SOLDADURA"
    PINTURA = "PINTURA"
    CARGA = "CARGA"
    PANELES_SIP = "PANELES_SIP"
    HERRERIA = "HERRERIA"

class Machine(Base):
    __tablename__ = "machines"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    type = Column(Enum(MachineType), nullable=False)
    category = Column(String, nullable=True)
    brand = Column(String, nullable=True)
    status = Column(Enum(MachineStatus), default=MachineStatus.IDLE)
    current_job_id = Column(String, nullable=True)
    operator_ids = Column(ARRAY(String), default=[])
    efficiency = Column(Float, default=0)
    oee_availability = Column(Float, default=0)
    oee_performance = Column(Float, default=0)
    oee_quality = Column(Float, default=0)
    is_active = Column(Boolean, default=True)
    color = Column(String, nullable=True)
    total_meters_produced = Column(Integer, default=0)
    next_maintenance_meters = Column(Integer, default=0)

    # Relationships
    jobs = relationship("Job", back_populates="machine")
```

### Example: Machine Router

```python
# backend/app/routers/machines.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.database import get_db
from app.schemas.machine import MachineCreate, MachineUpdate, MachineResponse
from app.models.machine import Machine
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/api/machines", tags=["machines"])

@router.get("/", response_model=List[MachineResponse])
async def list_machines(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    result = await db.execute(select(Machine))
    return result.scalars().all()

@router.get("/{machine_id}", response_model=MachineResponse)
async def get_machine(
    machine_id: str,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    result = await db.execute(
        select(Machine).where(Machine.id == machine_id)
    )
    machine = result.scalar_one_or_none()
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")
    return machine

@router.post("/", response_model=MachineResponse)
async def create_machine(
    machine: MachineCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    db_machine = Machine(**machine.dict())
    db.add(db_machine)
    await db.commit()
    await db.refresh(db_machine)
    return db_machine

@router.patch("/{machine_id}", response_model=MachineResponse)
async def update_machine(
    machine_id: str,
    updates: MachineUpdate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    result = await db.execute(
        select(Machine).where(Machine.id == machine_id)
    )
    machine = result.scalar_one_or_none()
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")
    
    for key, value in updates.dict(exclude_unset=True).items():
        setattr(machine, key, value)
    
    await db.commit()
    await db.refresh(machine)
    return machine

@router.delete("/{machine_id}")
async def delete_machine(
    machine_id: str,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    result = await db.execute(
        select(Machine).where(Machine.id == machine_id)
    )
    machine = result.scalar_one_or_none()
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")
    
    await db.delete(machine)
    await db.commit()
    return {"ok": True}
```

---

## Step 5: Authentication Flow

### Backend: JWT Auth

```python
# backend/app/auth/jwt.py

from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.config import settings

ALGORITHM = "HS256"

def create_access_token(user_id: str, role: str) -> str:
    expire = datetime.utcnow() + timedelta(hours=settings.JWT_EXPIRE_HOURS)
    to_encode = {
        "sub": user_id,
        "role": role,
        "exp": expire,
    }
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=ALGORITHM)

def verify_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
```

### Backend: Login Endpoint

```python
# backend/app/routers/auth.py

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.user import User
from app.auth.jwt import create_access_token
from app.schemas.auth import LoginRequest, LoginResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/login", response_model=LoginResponse)
async def login(
    request: LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    # Find user by PIN
    result = await db.execute(
        select(User).where(User.pin == request.pin)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid PIN")
    
    # Create JWT token
    token = create_access_token(user.id, user.role)
    
    return LoginResponse(
        token=token,
        user=user,
    )
```

### Frontend: Update Auth Feature

```typescript
// src/features/auth/api/authService.ts

import { api } from '@/shared/api/apiClient';
import type { User } from '@/shared/types';

interface LoginResponse {
  token: string;
  user: User;
}

export async function loginWithPin(pin: string): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/api/auth/login', { pin });
  
  // Store token
  localStorage.setItem('auth_token', response.token);
  
  return response;
}

export async function logout(): Promise<void> {
  localStorage.removeItem('auth_token');
  await api.post('/api/auth/logout', {});
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    return await api.get<User>('/api/auth/me');
  } catch {
    return null;
  }
}
```

---

## Step 6: Data Migration

### Export from localStorage

```typescript
// scripts/exportData.ts

const STORAGE_KEY = 'structura_erp_factory_data_v3';

function exportData() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    console.log('No data found');
    return;
  }

  const parsed = JSON.parse(data);
  
  // Download as JSON file
  const blob = new Blob([JSON.stringify(parsed, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'structura-export.json';
  a.click();
}

exportData();
```

### Import to Database

```python
# backend/scripts/import_data.py

import json
import asyncio
from app.database import async_session
from app.models import Machine, Job, Project, User, Client, Inventory

async def import_data(filepath: str):
    with open(filepath) as f:
        data = json.load(f)
    
    async with async_session() as db:
        # Import machines
        for m in data.get('machines', []):
            db.add(Machine(**m))
        
        # Import users
        for u in data.get('users', []):
            db.add(User(**u))
        
        # Import projects
        for p in data.get('projects', []):
            db.add(Project(**p))
        
        # Import jobs
        for j in data.get('jobs', []):
            db.add(Job(**j))
        
        # Import clients
        for c in data.get('clients', []):
            db.add(Client(**c))
        
        # Import inventory
        for i in data.get('inventory', []):
            db.add(Inventory(**i))
        
        await db.commit()
        print("Data imported successfully")

if __name__ == "__main__":
    asyncio.run(import_data("structura-export.json"))
```

---

## Step 7: Environment Configuration

### Frontend .env

```env
# .env.development
VITE_API_URL=http://localhost:8000
VITE_USE_API=true

# .env.production
VITE_API_URL=https://api.structura.example.com
VITE_USE_API=true
```

### Backend .env

```env
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/structura
JWT_SECRET=your-secret-key-here
JWT_EXPIRE_HOURS=24
CORS_ORIGINS=http://localhost:5173,https://structura.example.com
```

---

## Migration Checklist

### Step 1: Prepare Frontend
- [ ] Create `apiClient.ts`
- [ ] Create `apiRepository.ts`
- [ ] Add environment toggle for API/localStorage
- [ ] Update auth feature for JWT

### Step 2: Create Backend
- [ ] Set up FastAPI project
- [ ] Create database models
- [ ] Create Pydantic schemas
- [ ] Create API routers
- [ ] Add JWT authentication
- [ ] Add CORS middleware

### Step 3: Database
- [ ] Set up PostgreSQL
- [ ] Run Alembic migrations
- [ ] Seed initial data

### Step 4: Data Migration
- [ ] Export localStorage data
- [ ] Import to database
- [ ] Verify data integrity

### Step 5: Switch Over
- [ ] Set `VITE_USE_API=true`
- [ ] Test all features
- [ ] Monitor for errors

### Step 6: Clean Up
- [ ] Remove localStorage fallback (optional)
- [ ] Remove seed data from frontend
- [ ] Update documentation

---

## Rollback Plan

If issues occur, switch back instantly:

```env
# .env
VITE_USE_API=false  # Reverts to localStorage
```

Data remains in localStorage until explicitly cleared.

---

## Next Steps After Backend

1. **Real-time updates**: Add WebSocket support for live machine status
2. **File uploads**: Store job files on S3/Cloudflare R2
3. **Reports**: Add reporting endpoints with data aggregation
4. **Mobile app**: API is ready for React Native client
