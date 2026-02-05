"""Initial tables (users, machines, jobs, projects, clients, inventory, alerts, events, messages, project_accessories).

Revision ID: 001
Revises:
Create Date: 2025-02-05

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("name", sa.String(256), nullable=False),
        sa.Column("role", sa.String(32), nullable=False),
        sa.Column("pin", sa.String(32), nullable=False),
        sa.Column("avatar", sa.String(512), nullable=True),
    )
    op.create_table(
        "machines",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("name", sa.String(256), nullable=False),
        sa.Column("type", sa.String(64), nullable=False),
        sa.Column("category", sa.String(32), nullable=True),
        sa.Column("brand", sa.String(128), nullable=True),
        sa.Column("status", sa.String(32), nullable=False),
        sa.Column("current_job_id", sa.String(64), nullable=True),
        sa.Column("operator_ids", sa.Text(), nullable=False, server_default="[]"),
        sa.Column("efficiency", sa.Float(), nullable=False, server_default="0"),
        sa.Column("oee_availability", sa.Float(), nullable=False, server_default="0"),
        sa.Column("oee_performance", sa.Float(), nullable=False, server_default="0"),
        sa.Column("oee_quality", sa.Float(), nullable=False, server_default="0"),
        sa.Column("temperature", sa.Float(), nullable=True),
        sa.Column("last_maintenance", sa.String(32), nullable=True),
        sa.Column("maintenance_reason", sa.String(256), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="1"),
        sa.Column("color", sa.String(32), nullable=True),
        sa.Column("total_meters_produced", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("next_maintenance_meters", sa.Integer(), nullable=False, server_default="0"),
    )
    op.create_table(
        "jobs",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("project_id", sa.String(64), nullable=False),
        sa.Column("machine_type", sa.String(64), nullable=False),
        sa.Column("assigned_machine_id", sa.String(64), nullable=True),
        sa.Column("operator_ids", sa.Text(), nullable=False, server_default="[]"),
        sa.Column("product_name", sa.String(256), nullable=False),
        sa.Column("target_quantity", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("completed_quantity", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("scrap_quantity", sa.Integer(), nullable=True),
        sa.Column("unit", sa.String(32), nullable=False),
        sa.Column("status", sa.String(32), nullable=False),
        sa.Column("start_date", sa.String(32), nullable=True),
        sa.Column("end_date", sa.String(32), nullable=True),
        sa.Column("priority_index", sa.Integer(), nullable=True),
        sa.Column("file_url", sa.String(512), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("operator_notes", sa.Text(), nullable=True),
        sa.Column("requires_panelizado", sa.Boolean(), nullable=True),
        sa.Column("linked_job_id", sa.String(64), nullable=True),
        sa.Column("workflow_stages", sa.Text(), nullable=False, server_default="[]"),
        sa.Column("current_coil_id", sa.String(64), nullable=True),
        sa.Column("is_stock", sa.Boolean(), nullable=True),
        sa.Column("tonnage", sa.Float(), nullable=True),
        sa.Column("completed_at", sa.String(32), nullable=True),
    )
    op.create_table(
        "projects",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("name", sa.String(256), nullable=False),
        sa.Column("client_id", sa.String(64), nullable=False),
        sa.Column("deadline", sa.String(32), nullable=False),
        sa.Column("status", sa.String(32), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("budget", sa.Float(), nullable=True),
    )
    op.create_table(
        "clients",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("name", sa.String(256), nullable=False),
        sa.Column("contact_person", sa.String(256), nullable=False),
        sa.Column("email", sa.String(256), nullable=False),
        sa.Column("phone", sa.String(64), nullable=False),
        sa.Column("address", sa.Text(), nullable=True),
        sa.Column("tax_id", sa.String(64), nullable=True),
    )
    op.create_table(
        "inventory",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("name", sa.String(256), nullable=False),
        sa.Column("sku", sa.String(64), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("unit", sa.String(16), nullable=False),
        sa.Column("min_threshold", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("location", sa.String(256), nullable=False),
        sa.Column("is_manufactured", sa.Boolean(), nullable=True),
    )
    op.create_table(
        "alerts",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("type", sa.String(64), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("timestamp", sa.String(64), nullable=False),
        sa.Column("severity", sa.String(16), nullable=False),
        sa.Column("related_id", sa.String(64), nullable=True),
    )
    op.create_table(
        "events",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("timestamp", sa.String(64), nullable=False),
        sa.Column("machine_id", sa.String(64), nullable=False),
        sa.Column("type", sa.String(64), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("severity", sa.String(16), nullable=False),
    )
    op.create_table(
        "messages",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("from", sa.String(64), nullable=False, quote=True),
        sa.Column("to", sa.String(64), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("timestamp", sa.String(64), nullable=False),
        sa.Column("is_read", sa.Boolean(), nullable=False, server_default="0"),
    )
    op.create_table(
        "project_accessories",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("project_id", sa.String(64), nullable=False),
        sa.Column("inventory_item_id", sa.String(64), nullable=False),
        sa.Column("quantity_required", sa.Integer(), nullable=False),
        sa.Column("quantity_allocated", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("is_fulfilled", sa.Boolean(), nullable=False, server_default="0"),
    )


def downgrade() -> None:
    op.drop_table("project_accessories")
    op.drop_table("messages")
    op.drop_table("events")
    op.drop_table("alerts")
    op.drop_table("inventory")
    op.drop_table("clients")
    op.drop_table("projects")
    op.drop_table("jobs")
    op.drop_table("machines")
    op.drop_table("users")
