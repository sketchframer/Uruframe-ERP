"""Pydantic schemas for API request/response validation.

- All schemas use camelCase aliases to accept frontend JSON directly.
- `populate_by_name=True` allows both camelCase and snake_case.
- Enums match frontend TypeScript types exactly.
"""

from enum import StrEnum
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def camel_alias(name: str) -> str:
    """Convert snake_case to camelCase."""
    parts = name.split("_")
    return parts[0] + "".join(p.capitalize() for p in parts[1:])


_CAMEL_CONFIG = ConfigDict(
    alias_generator=camel_alias,
    populate_by_name=True,
    extra="forbid",
)


# ---------------------------------------------------------------------------
# Enums (match frontend TypeScript types)
# ---------------------------------------------------------------------------

class UserRole(StrEnum):
    ADMIN = "ADMIN"
    OPERATOR = "OPERATOR"


class MachineStatus(StrEnum):
    RUNNING = "RUNNING"
    IDLE = "IDLE"
    MAINTENANCE = "MAINTENANCE"
    ERROR = "ERROR"
    OFFLINE = "OFFLINE"


class MachineType(StrEnum):
    CONFORMADORA = "CONFORMADORA"
    PANELIZADO = "PANELIZADO"
    SOLDADURA = "SOLDADURA"
    PINTURA = "PINTURA"
    CARGA = "CARGA"
    PANELES_SIP = "PANELES_SIP"
    HERRERIA = "HERRERIA"


class JobStatus(StrEnum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    HALTED = "HALTED"


class ProjectStatus(StrEnum):
    PLANNING = "PLANNING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    DELAYED = "DELAYED"
    ARCHIVED = "ARCHIVED"


class AlertSeverity(StrEnum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class AlertType(StrEnum):
    MACHINE_STOPPED = "MACHINE_STOPPED"
    UNASSIGNED_OPERATOR = "UNASSIGNED_OPERATOR"
    DELAY_RISK = "DELAY_RISK"
    LOW_STOCK = "LOW_STOCK"
    JOB_READY = "JOB_READY"
    PROJECT_COMPLETED = "PROJECT_COMPLETED"
    OPERATOR_ALERT = "OPERATOR_ALERT"
    MAINTENANCE_DUE = "MAINTENANCE_DUE"
    JOB_FINISHED = "JOB_FINISHED"
    READY_FOR_DELIVERY = "READY_FOR_DELIVERY"


class EventType(StrEnum):
    JOB_START = "JOB_START"
    JOB_COMPLETE = "JOB_COMPLETE"
    COIL_CHANGE = "COIL_CHANGE"
    ERROR_LOG = "ERROR_LOG"
    QUALITY_CHECK = "QUALITY_CHECK"
    CALIBRATION = "CALIBRATION"
    CLEANING = "CLEANING"
    STAGE_COMPLETE = "STAGE_COMPLETE"
    SCRAP_REPORT = "SCRAP_REPORT"


class EventSeverity(StrEnum):
    INFO = "INFO"
    WARNING = "WARNING"
    CRITICAL = "CRITICAL"


class InventoryUnit(StrEnum):
    KG = "kg"
    M = "m"
    UNITS = "units"
    L = "L"


# ---------------------------------------------------------------------------
# Users
# ---------------------------------------------------------------------------

class UserCreate(BaseModel):
    model_config = _CAMEL_CONFIG

    id: str | None = None
    name: str = Field(min_length=1, max_length=256)
    role: UserRole
    pin: str = Field(min_length=4, max_length=32)
    avatar: str | None = None


class UserUpdate(BaseModel):
    model_config = ConfigDict(alias_generator=camel_alias, populate_by_name=True, extra="forbid")

    name: str | None = Field(None, min_length=1, max_length=256)
    role: UserRole | None = None
    pin: str | None = Field(None, min_length=4, max_length=32)
    avatar: str | None = None


class UserResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    name: str
    role: str
    pin: str
    avatar: str | None = None


# ---------------------------------------------------------------------------
# Machines
# ---------------------------------------------------------------------------

class MachineCreate(BaseModel):
    model_config = _CAMEL_CONFIG

    id: str | None = None
    name: str = Field(min_length=1, max_length=256)
    type: MachineType
    category: str | None = None
    brand: str | None = None
    status: MachineStatus = MachineStatus.IDLE
    current_job_id: str | None = None
    operator_ids: list[str] = Field(default_factory=list)
    efficiency: float = Field(0, ge=0, le=100)
    oee_availability: float = Field(0, ge=0, le=100)
    oee_performance: float = Field(0, ge=0, le=100)
    oee_quality: float = Field(0, ge=0, le=100)
    temperature: float | None = None
    last_maintenance: str | None = None
    maintenance_reason: str | None = None
    is_active: bool = True
    color: str | None = None
    total_meters_produced: int = Field(0, ge=0)
    next_maintenance_meters: int = Field(0, ge=0)


class MachineUpdate(BaseModel):
    model_config = ConfigDict(alias_generator=camel_alias, populate_by_name=True, extra="forbid")

    name: str | None = Field(None, min_length=1, max_length=256)
    type: MachineType | None = None
    category: str | None = None
    brand: str | None = None
    status: MachineStatus | None = None
    current_job_id: str | None = None
    operator_ids: list[str] | None = None
    efficiency: float | None = Field(None, ge=0, le=100)
    oee_availability: float | None = Field(None, ge=0, le=100)
    oee_performance: float | None = Field(None, ge=0, le=100)
    oee_quality: float | None = Field(None, ge=0, le=100)
    temperature: float | None = None
    last_maintenance: str | None = None
    maintenance_reason: str | None = None
    is_active: bool | None = None
    color: str | None = None
    total_meters_produced: int | None = Field(None, ge=0)
    next_maintenance_meters: int | None = Field(None, ge=0)


# ---------------------------------------------------------------------------
# Jobs
# ---------------------------------------------------------------------------

class JobCreate(BaseModel):
    model_config = _CAMEL_CONFIG

    id: str | None = None
    project_id: str
    machine_type: MachineType
    assigned_machine_id: str | None = None
    operator_ids: list[str] = Field(default_factory=list)
    product_name: str = Field(min_length=1, max_length=256)
    target_quantity: int = Field(0, ge=0)
    completed_quantity: int = Field(0, ge=0)
    scrap_quantity: int | None = None
    unit: str = Field(min_length=1, max_length=32)
    status: JobStatus = JobStatus.PENDING
    start_date: str | None = None
    end_date: str | None = None
    priority_index: int | None = None
    file_url: str | None = None
    notes: str | None = None
    operator_notes: str | None = None
    requires_panelizado: bool | None = None
    linked_job_id: str | None = None
    workflow_stages: list[dict[str, Any]] = Field(default_factory=list)
    current_coil_id: str | None = None
    is_stock: bool | None = None
    tonnage: float | None = None
    completed_at: str | None = None


class JobUpdate(BaseModel):
    model_config = ConfigDict(alias_generator=camel_alias, populate_by_name=True, extra="forbid")

    project_id: str | None = None
    machine_type: MachineType | None = None
    assigned_machine_id: str | None = None
    operator_ids: list[str] | None = None
    product_name: str | None = Field(None, min_length=1, max_length=256)
    target_quantity: int | None = Field(None, ge=0)
    completed_quantity: int | None = Field(None, ge=0)
    scrap_quantity: int | None = None
    unit: str | None = None
    status: JobStatus | None = None
    start_date: str | None = None
    end_date: str | None = None
    priority_index: int | None = None
    file_url: str | None = None
    notes: str | None = None
    operator_notes: str | None = None
    requires_panelizado: bool | None = None
    linked_job_id: str | None = None
    workflow_stages: list[dict[str, Any]] | None = None
    current_coil_id: str | None = None
    is_stock: bool | None = None
    tonnage: float | None = None
    completed_at: str | None = None


# ---------------------------------------------------------------------------
# Projects
# ---------------------------------------------------------------------------

class ProjectCreate(BaseModel):
    model_config = _CAMEL_CONFIG

    id: str | None = None
    name: str = Field(min_length=1, max_length=256)
    client_id: str
    deadline: str  # ISO date string, validated in serialization
    status: ProjectStatus = ProjectStatus.PLANNING
    description: str | None = None
    budget: float | None = Field(None, ge=0)


class ProjectUpdate(BaseModel):
    model_config = ConfigDict(alias_generator=camel_alias, populate_by_name=True, extra="forbid")

    name: str | None = Field(None, min_length=1, max_length=256)
    client_id: str | None = None
    deadline: str | None = None
    status: ProjectStatus | None = None
    description: str | None = None
    budget: float | None = Field(None, ge=0)


# ---------------------------------------------------------------------------
# Clients
# ---------------------------------------------------------------------------

class ClientCreate(BaseModel):
    model_config = _CAMEL_CONFIG

    id: str | None = None
    name: str = Field(min_length=1, max_length=256)
    contact_person: str = Field(min_length=1, max_length=256)
    email: str = Field(min_length=1, max_length=256)
    phone: str = Field(min_length=1, max_length=64)
    address: str | None = None
    tax_id: str | None = None


class ClientUpdate(BaseModel):
    model_config = ConfigDict(alias_generator=camel_alias, populate_by_name=True, extra="forbid")

    name: str | None = Field(None, min_length=1, max_length=256)
    contact_person: str | None = Field(None, min_length=1, max_length=256)
    email: str | None = Field(None, min_length=1, max_length=256)
    phone: str | None = Field(None, min_length=1, max_length=64)
    address: str | None = None
    tax_id: str | None = None


# ---------------------------------------------------------------------------
# Inventory
# ---------------------------------------------------------------------------

class InventoryCreate(BaseModel):
    model_config = _CAMEL_CONFIG

    id: str | None = None
    name: str = Field(min_length=1, max_length=256)
    sku: str = Field(min_length=1, max_length=64)
    quantity: int = Field(0, ge=0)
    unit: InventoryUnit
    min_threshold: int = Field(0, ge=0)
    location: str = Field(min_length=1, max_length=256)
    is_manufactured: bool | None = None


class InventoryUpdate(BaseModel):
    model_config = ConfigDict(alias_generator=camel_alias, populate_by_name=True, extra="forbid")

    name: str | None = Field(None, min_length=1, max_length=256)
    sku: str | None = Field(None, min_length=1, max_length=64)
    quantity: int | None = Field(None, ge=0)
    unit: InventoryUnit | None = None
    min_threshold: int | None = Field(None, ge=0)
    location: str | None = Field(None, min_length=1, max_length=256)
    is_manufactured: bool | None = None


# ---------------------------------------------------------------------------
# Alerts
# ---------------------------------------------------------------------------

class AlertCreate(BaseModel):
    model_config = _CAMEL_CONFIG

    id: str | None = None
    type: AlertType
    message: str = Field(min_length=1)
    timestamp: str  # ISO datetime
    severity: AlertSeverity
    related_id: str | None = None


class AlertUpdate(BaseModel):
    model_config = ConfigDict(alias_generator=camel_alias, populate_by_name=True, extra="forbid")

    type: AlertType | None = None
    message: str | None = Field(None, min_length=1)
    timestamp: str | None = None
    severity: AlertSeverity | None = None
    related_id: str | None = None


# ---------------------------------------------------------------------------
# Events
# ---------------------------------------------------------------------------

class EventCreate(BaseModel):
    model_config = _CAMEL_CONFIG

    id: str | None = None
    timestamp: str  # ISO datetime
    machine_id: str
    type: EventType
    description: str = Field(min_length=1)
    severity: EventSeverity


class EventUpdate(BaseModel):
    model_config = ConfigDict(alias_generator=camel_alias, populate_by_name=True, extra="forbid")

    timestamp: str | None = None
    machine_id: str | None = None
    type: EventType | None = None
    description: str | None = Field(None, min_length=1)
    severity: EventSeverity | None = None


# ---------------------------------------------------------------------------
# Messages
# ---------------------------------------------------------------------------

class MessageCreate(BaseModel):
    model_config = ConfigDict(alias_generator=camel_alias, populate_by_name=True, extra="forbid")

    id: str | None = None
    from_: str = Field(alias="from")
    to: str
    content: str = Field(min_length=1)
    timestamp: str  # ISO datetime
    is_read: bool = False


class MessageUpdate(BaseModel):
    model_config = ConfigDict(alias_generator=camel_alias, populate_by_name=True, extra="forbid")

    content: str | None = Field(None, min_length=1)
    is_read: bool | None = None


# ---------------------------------------------------------------------------
# ProjectAccessories
# ---------------------------------------------------------------------------

class ProjectAccessoryCreate(BaseModel):
    model_config = _CAMEL_CONFIG

    id: str | None = None
    project_id: str
    inventory_item_id: str
    quantity_required: int = Field(ge=1)
    quantity_allocated: int = Field(0, ge=0)
    is_fulfilled: bool = False


class ProjectAccessoryUpdate(BaseModel):
    model_config = ConfigDict(alias_generator=camel_alias, populate_by_name=True, extra="forbid")

    project_id: str | None = None
    inventory_item_id: str | None = None
    quantity_required: int | None = Field(None, ge=1)
    quantity_allocated: int | None = Field(None, ge=0)
    is_fulfilled: bool | None = None


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

class LoginRequest(BaseModel):
    pin: str


class LoginResponse(BaseModel):
    token: str
    user: UserResponse


# ---------------------------------------------------------------------------
# Schema registry: resource name -> (CreateSchema, UpdateSchema)
# ---------------------------------------------------------------------------

SCHEMA_REGISTRY: dict[str, dict[str, type[BaseModel]]] = {
    "users": {"create": UserCreate, "update": UserUpdate},
    "machines": {"create": MachineCreate, "update": MachineUpdate},
    "jobs": {"create": JobCreate, "update": JobUpdate},
    "projects": {"create": ProjectCreate, "update": ProjectUpdate},
    "clients": {"create": ClientCreate, "update": ClientUpdate},
    "inventory": {"create": InventoryCreate, "update": InventoryUpdate},
    "alerts": {"create": AlertCreate, "update": AlertUpdate},
    "events": {"create": EventCreate, "update": EventUpdate},
    "messages": {"create": MessageCreate, "update": MessageUpdate},
    "project-accessories": {"create": ProjectAccessoryCreate, "update": ProjectAccessoryUpdate},
}
