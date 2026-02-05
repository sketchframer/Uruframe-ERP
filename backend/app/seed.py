"""Deterministic, idempotent seed: known IDs, UPSERT. Run: uv run python -m app.seed [--reset]."""

import argparse
import sys
from pathlib import Path

# Ensure backend root is on path when run as __main__
backend_root = Path(__file__).resolve().parent.parent
if str(backend_root) not in sys.path:
    sys.path.insert(0, str(backend_root))

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import SessionLocal, init_db_and_pragmas
from app.models.orm import Machine, User

# Known IDs matching frontend seeds.ts
INITIAL_USERS = [
    {"id": "U-001", "name": "Admin Principal", "role": "ADMIN", "pin": "1234", "avatar": None},
    {"id": "U-002", "name": "Juan Perez", "role": "OPERATOR", "pin": "0000", "avatar": None},
    {"id": "U-003", "name": "Maria Gomez", "role": "OPERATOR", "pin": "1111", "avatar": None},
    {"id": "U-004", "name": "Carlos Diaz", "role": "OPERATOR", "pin": "2222", "avatar": None},
]

INITIAL_MACHINES = [
    {
        "id": "M-01",
        "name": "Conf. China 1",
        "brand": "China",
        "type": "CONFORMADORA",
        "category": "STANDARD",
        "status": "IDLE",
        "efficiency": 92,
        "oee_availability": 95,
        "oee_performance": 97,
        "oee_quality": 99,
        "operator_ids": '["U-002"]',
        "current_job_id": None,
        "is_active": True,
        "last_maintenance": "2023-10-01",
        "color": "#10b981",
        "total_meters_produced": 12000,
        "next_maintenance_meters": 15000,
    },
    {
        "id": "M-02",
        "name": "Conf. Cunmac",
        "brand": "Cunmac",
        "type": "CONFORMADORA",
        "category": "STANDARD",
        "status": "IDLE",
        "efficiency": 0,
        "oee_availability": 0,
        "oee_performance": 0,
        "oee_quality": 0,
        "operator_ids": "[]",
        "current_job_id": None,
        "is_active": True,
        "last_maintenance": "2023-09-15",
        "color": "#f59e0b",
        "total_meters_produced": 8000,
        "next_maintenance_meters": 10000,
    },
    {
        "id": "M-03",
        "name": "Conf. Framemac",
        "brand": "Framemac",
        "type": "CONFORMADORA",
        "category": "STANDARD",
        "status": "IDLE",
        "efficiency": 88,
        "oee_availability": 90,
        "oee_performance": 95,
        "oee_quality": 98,
        "operator_ids": '["U-004"]',
        "current_job_id": None,
        "is_active": True,
        "last_maintenance": "2023-10-10",
        "color": "#06b6d4",
        "total_meters_produced": 15000,
        "next_maintenance_meters": 20000,
    },
    {
        "id": "M-06",
        "name": "Taller Herrería",
        "brand": "Interno",
        "type": "HERRERIA",
        "category": None,
        "status": "IDLE",
        "efficiency": 100,
        "oee_availability": 100,
        "oee_performance": 100,
        "oee_quality": 100,
        "operator_ids": '["U-004"]',
        "current_job_id": None,
        "is_active": True,
        "last_maintenance": None,
        "color": "#f97316",
        "total_meters_produced": 0,
        "next_maintenance_meters": 0,
    },
    {
        "id": "M-07",
        "name": "Estación Panelizado",
        "brand": "Pinnacle",
        "type": "PANELIZADO",
        "category": None,
        "status": "IDLE",
        "efficiency": 100,
        "oee_availability": 100,
        "oee_performance": 100,
        "oee_quality": 100,
        "operator_ids": '["U-003"]',
        "current_job_id": None,
        "is_active": True,
        "last_maintenance": None,
        "color": "#8b5cf6",
        "total_meters_produced": 0,
        "next_maintenance_meters": 0,
    },
    {
        "id": "M-CARGA",
        "name": "Unidad de Despacho",
        "brand": "Logística",
        "type": "CARGA",
        "category": None,
        "status": "IDLE",
        "efficiency": 100,
        "oee_availability": 100,
        "oee_performance": 100,
        "oee_quality": 100,
        "operator_ids": "[]",
        "current_job_id": None,
        "is_active": True,
        "last_maintenance": None,
        "color": "#3b82f6",
        "total_meters_produced": 0,
        "next_maintenance_meters": 0,
    },
]


def seed_users(db: Session, reset: bool) -> None:
    if reset:
        db.execute(text("DELETE FROM users"))
        db.commit()
    for u in INITIAL_USERS:
        existing = db.get(User, u["id"])
        if existing:
            for k, v in u.items():
                setattr(existing, k, v)
        else:
            db.add(User(**u))
    db.commit()


def seed_machines(db: Session, reset: bool) -> None:
    if reset:
        db.execute(text("DELETE FROM machines"))
        db.commit()
    for m in INITIAL_MACHINES:
        existing = db.get(Machine, m["id"])
        if existing:
            for k, v in m.items():
                setattr(existing, k, v)
        else:
            db.add(Machine(**m))
    db.commit()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--reset", action="store_true", help="Clear users and machines before inserting")
    args = parser.parse_args()
    init_db_and_pragmas()
    db = SessionLocal()
    try:
        seed_users(db, args.reset)
        seed_machines(db, args.reset)
        print("Seed done.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
