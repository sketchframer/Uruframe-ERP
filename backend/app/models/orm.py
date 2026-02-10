"""SQLAlchemy ORM models with FK constraints, indexes, check constraints, and relationships.

JSON columns (operator_ids, workflow_stages) remain TEXT; encode/decode in serialization.
Date/datetime columns stay as String in SQLite (no real date types); validation in Python.
"""

from __future__ import annotations

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


# ---------------------------------------------------------------------------
# Users
# ---------------------------------------------------------------------------
class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(256), nullable=False)
    role: Mapped[str] = mapped_column(String(32), nullable=False)
    pin: Mapped[str] = mapped_column(String(32), nullable=False, unique=True)
    avatar: Mapped[str | None] = mapped_column(String(512), nullable=True)

    # relationships
    sent_messages: Mapped[list[Message]] = relationship(
        foreign_keys="Message.from_", back_populates="sender",
    )
    received_messages: Mapped[list[Message]] = relationship(
        foreign_keys="Message.to", back_populates="recipient",
    )


# ---------------------------------------------------------------------------
# Machines
# ---------------------------------------------------------------------------
class Machine(Base):
    __tablename__ = "machines"
    __table_args__ = (
        CheckConstraint("efficiency >= 0 AND efficiency <= 100", name="ck_machine_efficiency"),
        CheckConstraint("oee_availability >= 0 AND oee_availability <= 100", name="ck_machine_oee_avail"),
        CheckConstraint("oee_performance >= 0 AND oee_performance <= 100", name="ck_machine_oee_perf"),
        CheckConstraint("oee_quality >= 0 AND oee_quality <= 100", name="ck_machine_oee_qual"),
    )

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(256), nullable=False)
    type: Mapped[str] = mapped_column(String(64), nullable=False)
    category: Mapped[str | None] = mapped_column(String(32), nullable=True)
    brand: Mapped[str | None] = mapped_column(String(128), nullable=True)
    status: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
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

    # relationships
    jobs: Mapped[list[Job]] = relationship(back_populates="machine")
    events: Mapped[list[Event]] = relationship(back_populates="machine")


# ---------------------------------------------------------------------------
# Jobs
# ---------------------------------------------------------------------------
class Job(Base):
    __tablename__ = "jobs"
    __table_args__ = (
        CheckConstraint("completed_quantity >= 0", name="ck_job_completed_qty"),
        CheckConstraint("target_quantity >= 0", name="ck_job_target_qty"),
    )

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    project_id: Mapped[str] = mapped_column(
        ForeignKey("projects.id"), nullable=False, index=True,
    )
    machine_type: Mapped[str] = mapped_column(String(64), nullable=False)
    assigned_machine_id: Mapped[str | None] = mapped_column(
        ForeignKey("machines.id"), nullable=True, index=True,
    )
    operator_ids: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    product_name: Mapped[str] = mapped_column(String(256), nullable=False)
    target_quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    completed_quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    scrap_quantity: Mapped[int | None] = mapped_column(Integer, nullable=True)
    unit: Mapped[str] = mapped_column(String(32), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    start_date: Mapped[str | None] = mapped_column(String(32), nullable=True)
    end_date: Mapped[str | None] = mapped_column(String(32), nullable=True)
    priority_index: Mapped[int | None] = mapped_column(Integer, nullable=True)
    file_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    operator_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    requires_panelizado: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    linked_job_id: Mapped[str | None] = mapped_column(
        ForeignKey("jobs.id"), nullable=True,
    )
    workflow_stages: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    current_coil_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    is_stock: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    tonnage: Mapped[float | None] = mapped_column(Float, nullable=True)
    completed_at: Mapped[str | None] = mapped_column(String(32), nullable=True)

    # relationships
    project: Mapped[Project] = relationship(back_populates="jobs")
    machine: Mapped[Machine | None] = relationship(back_populates="jobs")
    linked_job: Mapped[Job | None] = relationship(remote_side="Job.id")


# ---------------------------------------------------------------------------
# Projects
# ---------------------------------------------------------------------------
class Project(Base):
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(256), nullable=False)
    client_id: Mapped[str | None] = mapped_column(
        ForeignKey("clients.id"), nullable=True, index=True,
    )
    deadline: Mapped[str] = mapped_column(String(32), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    budget: Mapped[float | None] = mapped_column(Float, nullable=True)

    # relationships
    client: Mapped[Client | None] = relationship(back_populates="projects")
    jobs: Mapped[list[Job]] = relationship(back_populates="project")
    accessories: Mapped[list[ProjectAccessory]] = relationship(back_populates="project")


# ---------------------------------------------------------------------------
# Clients
# ---------------------------------------------------------------------------
class Client(Base):
    __tablename__ = "clients"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(256), nullable=False)
    contact_person: Mapped[str] = mapped_column(String(256), nullable=False)
    email: Mapped[str] = mapped_column(String(256), nullable=False, unique=True)
    phone: Mapped[str] = mapped_column(String(64), nullable=False)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    tax_id: Mapped[str | None] = mapped_column(String(64), nullable=True)

    # relationships
    projects: Mapped[list[Project]] = relationship(back_populates="client")


# ---------------------------------------------------------------------------
# Inventory
# ---------------------------------------------------------------------------
class InventoryItem(Base):
    __tablename__ = "inventory"
    __table_args__ = (
        CheckConstraint("quantity >= 0", name="ck_inventory_quantity"),
    )

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(256), nullable=False)
    sku: Mapped[str] = mapped_column(String(64), nullable=False, unique=True)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    unit: Mapped[str] = mapped_column(String(16), nullable=False)
    min_threshold: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    location: Mapped[str] = mapped_column(String(256), nullable=False)
    is_manufactured: Mapped[bool | None] = mapped_column(Boolean, nullable=True)

    # relationships
    accessories: Mapped[list[ProjectAccessory]] = relationship(back_populates="inventory_item")


# ---------------------------------------------------------------------------
# Alerts
# ---------------------------------------------------------------------------
class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    type: Mapped[str] = mapped_column(String(64), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    timestamp: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    severity: Mapped[str] = mapped_column(String(16), nullable=False, index=True)
    related_id: Mapped[str | None] = mapped_column(String(64), nullable=True)


# ---------------------------------------------------------------------------
# Events
# ---------------------------------------------------------------------------
class Event(Base):
    __tablename__ = "events"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    timestamp: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    machine_id: Mapped[str] = mapped_column(
        ForeignKey("machines.id"), nullable=False, index=True,
    )
    type: Mapped[str] = mapped_column(String(64), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    severity: Mapped[str] = mapped_column(String(16), nullable=False)

    # relationships
    machine: Mapped[Machine] = relationship(back_populates="events")


# ---------------------------------------------------------------------------
# Messages
# ---------------------------------------------------------------------------
class Message(Base):
    __tablename__ = "messages"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    from_: Mapped[str] = mapped_column(
        "from", ForeignKey("users.id"), nullable=False,
    )
    to: Mapped[str] = mapped_column(
        ForeignKey("users.id"), nullable=False, index=True,
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    timestamp: Mapped[str] = mapped_column(String(64), nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, index=True)

    # relationships
    sender: Mapped[User] = relationship(foreign_keys=[from_], back_populates="sent_messages")
    recipient: Mapped[User] = relationship(foreign_keys=[to], back_populates="received_messages")


# ---------------------------------------------------------------------------
# ProjectAccessories
# ---------------------------------------------------------------------------
class ProjectAccessory(Base):
    __tablename__ = "project_accessories"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    project_id: Mapped[str] = mapped_column(
        ForeignKey("projects.id"), nullable=False, index=True,
    )
    inventory_item_id: Mapped[str] = mapped_column(
        ForeignKey("inventory.id"), nullable=False, index=True,
    )
    quantity_required: Mapped[int] = mapped_column(Integer, nullable=False)
    quantity_allocated: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    is_fulfilled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # relationships
    project: Mapped[Project] = relationship(back_populates="accessories")
    inventory_item: Mapped[InventoryItem] = relationship(back_populates="accessories")
