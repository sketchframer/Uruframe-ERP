"""Add foreign keys, indexes, unique constraints, check constraints, and proper date types.

Revision ID: 002
Revises: 001
Create Date: 2026-02-09

Uses batch_alter_table throughout for SQLite compatibility.
Cleans up existing data before applying constraints.
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _cleanup_existing_data(conn) -> None:
    """Fix data that would violate new constraints.

    - Deduplicate users.pin (keep first, delete later duplicates)
    - Ensure projects.client_id references an existing client
    """
    # 1) Remove duplicate PINs: keep the first user per PIN, delete the rest
    result = conn.execute(sa.text(
        "SELECT pin, GROUP_CONCAT(id) AS ids FROM users GROUP BY pin HAVING COUNT(*) > 1"
    ))
    for row in result:
        ids = row[1].split(",")
        keep_id = ids[0]
        for dup_id in ids[1:]:
            conn.execute(sa.text("DELETE FROM users WHERE id = :id"), {"id": dup_id})

    # 2) Ensure FK targets exist for projects.client_id
    #    Create a placeholder client for any orphaned references.
    orphans = conn.execute(sa.text(
        "SELECT DISTINCT p.client_id FROM projects p "
        "LEFT JOIN clients c ON p.client_id = c.id "
        "WHERE c.id IS NULL AND p.client_id != ''"
    )).fetchall()
    for (client_id,) in orphans:
        conn.execute(sa.text(
            "INSERT INTO clients (id, name, contact_person, email, phone) "
            "VALUES (:id, :name, :cp, :email, :phone)"
        ), {
            "id": client_id,
            "name": f"Unknown ({client_id})",
            "cp": "N/A",
            "email": f"{client_id}@placeholder.local",
            "phone": "N/A",
        })

    # Handle empty-string client_id: create one placeholder and reassign
    empty_count = conn.execute(
        sa.text("SELECT COUNT(*) FROM projects WHERE client_id = ''")
    ).scalar()
    if empty_count:
        placeholder_id = "CLI-UNKNOWN"
        exists = conn.execute(
            sa.text("SELECT 1 FROM clients WHERE id = :id"), {"id": placeholder_id}
        ).scalar()
        if not exists:
            conn.execute(sa.text(
                "INSERT INTO clients (id, name, contact_person, email, phone) "
                "VALUES (:id, 'Sin cliente asignado', 'N/A', 'unknown@placeholder.local', 'N/A')"
            ), {"id": placeholder_id})
        conn.execute(sa.text(
            "UPDATE projects SET client_id = :id WHERE client_id = ''"
        ), {"id": placeholder_id})


def upgrade() -> None:
    # Get raw DBAPI connection for data cleanup
    conn = op.get_bind()
    _cleanup_existing_data(conn)

    # ------------------------------------------------------------------
    # users: add unique constraint on pin
    # ------------------------------------------------------------------
    with op.batch_alter_table("users") as batch_op:
        batch_op.create_unique_constraint("uq_users_pin", ["pin"])

    # ------------------------------------------------------------------
    # clients: add unique constraint on email
    # ------------------------------------------------------------------
    with op.batch_alter_table("clients") as batch_op:
        batch_op.create_unique_constraint("uq_clients_email", ["email"])

    # ------------------------------------------------------------------
    # inventory: add unique on sku, check on quantity
    # ------------------------------------------------------------------
    with op.batch_alter_table("inventory") as batch_op:
        batch_op.create_unique_constraint("uq_inventory_sku", ["sku"])
        batch_op.create_check_constraint("ck_inventory_quantity", "quantity >= 0")

    # ------------------------------------------------------------------
    # machines: index on status, check constraints on OEE
    # Note: date columns stay as String — SQLite has no real date types,
    # and batch ALTER corrupts date strings. Validation happens in Python.
    # ------------------------------------------------------------------
    with op.batch_alter_table("machines") as batch_op:
        batch_op.create_index("ix_machines_status", ["status"])
        batch_op.create_check_constraint(
            "ck_machine_efficiency", "efficiency >= 0 AND efficiency <= 100",
        )
        batch_op.create_check_constraint(
            "ck_machine_oee_avail", "oee_availability >= 0 AND oee_availability <= 100",
        )
        batch_op.create_check_constraint(
            "ck_machine_oee_perf", "oee_performance >= 0 AND oee_performance <= 100",
        )
        batch_op.create_check_constraint(
            "ck_machine_oee_qual", "oee_quality >= 0 AND oee_quality <= 100",
        )

    # ------------------------------------------------------------------
    # projects: FK to clients, indexes
    # ------------------------------------------------------------------
    with op.batch_alter_table("projects") as batch_op:
        batch_op.create_foreign_key("fk_projects_client_id", "clients", ["client_id"], ["id"])
        batch_op.create_index("ix_projects_client_id", ["client_id"])
        batch_op.create_index("ix_projects_status", ["status"])

    # ------------------------------------------------------------------
    # jobs: FKs, indexes, check constraints
    # ------------------------------------------------------------------
    with op.batch_alter_table("jobs") as batch_op:
        batch_op.create_foreign_key("fk_jobs_project_id", "projects", ["project_id"], ["id"])
        batch_op.create_foreign_key(
            "fk_jobs_assigned_machine_id", "machines", ["assigned_machine_id"], ["id"],
        )
        batch_op.create_foreign_key("fk_jobs_linked_job_id", "jobs", ["linked_job_id"], ["id"])
        batch_op.create_index("ix_jobs_project_id", ["project_id"])
        batch_op.create_index("ix_jobs_assigned_machine_id", ["assigned_machine_id"])
        batch_op.create_index("ix_jobs_status", ["status"])
        batch_op.create_check_constraint("ck_job_completed_qty", "completed_quantity >= 0")
        batch_op.create_check_constraint("ck_job_target_qty", "target_quantity >= 0")

    # ------------------------------------------------------------------
    # alerts: indexes
    # ------------------------------------------------------------------
    with op.batch_alter_table("alerts") as batch_op:
        batch_op.create_index("ix_alerts_timestamp", ["timestamp"])
        batch_op.create_index("ix_alerts_severity", ["severity"])

    # ------------------------------------------------------------------
    # events: FK to machines, indexes
    # ------------------------------------------------------------------
    with op.batch_alter_table("events") as batch_op:
        batch_op.create_foreign_key("fk_events_machine_id", "machines", ["machine_id"], ["id"])
        batch_op.create_index("ix_events_machine_id", ["machine_id"])
        batch_op.create_index("ix_events_timestamp", ["timestamp"])

    # ------------------------------------------------------------------
    # messages: FKs to users, indexes
    # ------------------------------------------------------------------
    with op.batch_alter_table("messages") as batch_op:
        batch_op.create_foreign_key("fk_messages_from", "users", ["from"], ["id"])
        batch_op.create_foreign_key("fk_messages_to", "users", ["to"], ["id"])
        batch_op.create_index("ix_messages_to", ["to"])
        batch_op.create_index("ix_messages_is_read", ["is_read"])

    # ------------------------------------------------------------------
    # project_accessories: FKs to projects and inventory, indexes
    # ------------------------------------------------------------------
    with op.batch_alter_table("project_accessories") as batch_op:
        batch_op.create_foreign_key(
            "fk_pa_project_id", "projects", ["project_id"], ["id"],
        )
        batch_op.create_foreign_key(
            "fk_pa_inventory_item_id", "inventory", ["inventory_item_id"], ["id"],
        )
        batch_op.create_index("ix_pa_project_id", ["project_id"])
        batch_op.create_index("ix_pa_inventory_item_id", ["inventory_item_id"])


def downgrade() -> None:
    # Reverse in opposite order. Batch ops recreate the table without constraints.

    with op.batch_alter_table("project_accessories") as batch_op:
        batch_op.drop_index("ix_pa_inventory_item_id")
        batch_op.drop_index("ix_pa_project_id")
        batch_op.drop_constraint("fk_pa_inventory_item_id", type_="foreignkey")
        batch_op.drop_constraint("fk_pa_project_id", type_="foreignkey")

    with op.batch_alter_table("messages") as batch_op:
        batch_op.drop_index("ix_messages_is_read")
        batch_op.drop_index("ix_messages_to")
        batch_op.drop_constraint("fk_messages_to", type_="foreignkey")
        batch_op.drop_constraint("fk_messages_from", type_="foreignkey")

    with op.batch_alter_table("events") as batch_op:
        batch_op.drop_index("ix_events_timestamp")
        batch_op.drop_index("ix_events_machine_id")
        batch_op.drop_constraint("fk_events_machine_id", type_="foreignkey")

    with op.batch_alter_table("alerts") as batch_op:
        batch_op.drop_index("ix_alerts_severity")
        batch_op.drop_index("ix_alerts_timestamp")

    with op.batch_alter_table("jobs") as batch_op:
        batch_op.drop_constraint("ck_job_target_qty", type_="check")
        batch_op.drop_constraint("ck_job_completed_qty", type_="check")
        batch_op.drop_index("ix_jobs_status")
        batch_op.drop_index("ix_jobs_assigned_machine_id")
        batch_op.drop_index("ix_jobs_project_id")
        batch_op.drop_constraint("fk_jobs_linked_job_id", type_="foreignkey")
        batch_op.drop_constraint("fk_jobs_assigned_machine_id", type_="foreignkey")
        batch_op.drop_constraint("fk_jobs_project_id", type_="foreignkey")

    with op.batch_alter_table("projects") as batch_op:
        batch_op.drop_index("ix_projects_status")
        batch_op.drop_index("ix_projects_client_id")
        batch_op.drop_constraint("fk_projects_client_id", type_="foreignkey")

    with op.batch_alter_table("machines") as batch_op:
        batch_op.drop_constraint("ck_machine_oee_qual", type_="check")
        batch_op.drop_constraint("ck_machine_oee_perf", type_="check")
        batch_op.drop_constraint("ck_machine_oee_avail", type_="check")
        batch_op.drop_constraint("ck_machine_efficiency", type_="check")
        batch_op.drop_index("ix_machines_status")

    with op.batch_alter_table("inventory") as batch_op:
        batch_op.drop_constraint("ck_inventory_quantity", type_="check")
        batch_op.drop_constraint("uq_inventory_sku", type_="unique")

    with op.batch_alter_table("clients") as batch_op:
        batch_op.drop_constraint("uq_clients_email", type_="unique")

    with op.batch_alter_table("users") as batch_op:
        batch_op.drop_constraint("uq_users_pin", type_="unique")
