"""SQLAlchemy ORM models (snake_case columns). JSON columns stored as TEXT; encode/decode in serialization."""

from sqlalchemy import Boolean, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(256), nullable=False)
    role: Mapped[str] = mapped_column(String(32), nullable=False)
    pin: Mapped[str] = mapped_column(String(32), nullable=False)
    avatar: Mapped[str | None] = mapped_column(String(512), nullable=True)


class Machine(Base):
    __tablename__ = "machines"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(256), nullable=False)
    type: Mapped[str] = mapped_column(String(64), nullable=False)
    category: Mapped[str | None] = mapped_column(String(32), nullable=True)
    brand: Mapped[str | None] = mapped_column(String(128), nullable=True)
    status: Mapped[str] = mapped_column(String(32), nullable=False)
    current_job_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    operator_ids: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    efficiency: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    oee_availability: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    oee_performance: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    oee_quality: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    temperature: Mapped[float | None] = mapped_column(Float, nullable=True)
    last_maintenance: Mapped[str | None] = mapped_column(String(32), nullable=True)
    maintenance_reason: Mapped[str | None] = mapped_column(String(256), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    color: Mapped[str | None] = mapped_column(String(32), nullable=True)
    total_meters_produced: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    next_maintenance_meters: Mapped[int] = mapped_column(Integer, nullable=False, default=0)


class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    project_id: Mapped[str] = mapped_column(String(64), nullable=False)
    machine_type: Mapped[str] = mapped_column(String(64), nullable=False)
    assigned_machine_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    operator_ids: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    product_name: Mapped[str] = mapped_column(String(256), nullable=False)
    target_quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    completed_quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    scrap_quantity: Mapped[int | None] = mapped_column(Integer, nullable=True)
    unit: Mapped[str] = mapped_column(String(32), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False)
    start_date: Mapped[str | None] = mapped_column(String(32), nullable=True)
    end_date: Mapped[str | None] = mapped_column(String(32), nullable=True)
    priority_index: Mapped[int | None] = mapped_column(Integer, nullable=True)
    file_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    operator_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    requires_panelizado: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    linked_job_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    workflow_stages: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    current_coil_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    is_stock: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    tonnage: Mapped[float | None] = mapped_column(Float, nullable=True)
    completed_at: Mapped[str | None] = mapped_column(String(32), nullable=True)


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(256), nullable=False)
    client_id: Mapped[str] = mapped_column(String(64), nullable=False)
    deadline: Mapped[str] = mapped_column(String(32), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    budget: Mapped[float | None] = mapped_column(Float, nullable=True)


class Client(Base):
    __tablename__ = "clients"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(256), nullable=False)
    contact_person: Mapped[str] = mapped_column(String(256), nullable=False)
    email: Mapped[str] = mapped_column(String(256), nullable=False)
    phone: Mapped[str] = mapped_column(String(64), nullable=False)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    tax_id: Mapped[str | None] = mapped_column(String(64), nullable=True)


class InventoryItem(Base):
    __tablename__ = "inventory"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(256), nullable=False)
    sku: Mapped[str] = mapped_column(String(64), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    unit: Mapped[str] = mapped_column(String(16), nullable=False)
    min_threshold: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    location: Mapped[str] = mapped_column(String(256), nullable=False)
    is_manufactured: Mapped[bool | None] = mapped_column(Boolean, nullable=True)


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    type: Mapped[str] = mapped_column(String(64), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    timestamp: Mapped[str] = mapped_column(String(64), nullable=False)
    severity: Mapped[str] = mapped_column(String(16), nullable=False)
    related_id: Mapped[str | None] = mapped_column(String(64), nullable=True)


class Event(Base):
    __tablename__ = "events"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    timestamp: Mapped[str] = mapped_column(String(64), nullable=False)
    machine_id: Mapped[str] = mapped_column(String(64), nullable=False)
    type: Mapped[str] = mapped_column(String(64), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    severity: Mapped[str] = mapped_column(String(16), nullable=False)


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    from_: Mapped[str] = mapped_column("from", String(64), nullable=False)
    to: Mapped[str] = mapped_column(String(64), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    timestamp: Mapped[str] = mapped_column(String(64), nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)


class ProjectAccessory(Base):
    __tablename__ = "project_accessories"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    project_id: Mapped[str] = mapped_column(String(64), nullable=False)
    inventory_item_id: Mapped[str] = mapped_column(String(64), nullable=False)
    quantity_required: Mapped[int] = mapped_column(Integer, nullable=False)
    quantity_allocated: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    is_fulfilled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
