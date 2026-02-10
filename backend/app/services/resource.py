"""Generic resource CRUD service: list (limit/offset/orderBy), get, create, update, delete.

Includes transaction safety (rollback on error) and IntegrityError handling.
"""

import uuid
from typing import Any

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.orm import (
    Alert,
    Client,
    Event,
    InventoryItem,
    Job,
    Machine,
    Message,
    Project,
    ProjectAccessory,
    User,
)
from app.registry import ORDERABLE_COLUMNS, RESOURCE_TO_TABLE
from app.serialization import (
    body_to_snake,
    decode_row_from_db,
    encode_row_for_db,
    row_to_camel,
)

TABLE_TO_MODEL = {
    "users": User,
    "machines": Machine,
    "jobs": Job,
    "projects": Project,
    "clients": Client,
    "inventory": InventoryItem,
    "alerts": Alert,
    "events": Event,
    "messages": Message,
    "project_accessories": ProjectAccessory,
}

# Python-reserved words that differ between body key and ORM attribute name
_KEY_TO_ATTR: dict[str, str] = {
    "from": "from_",
}


def _model_for_resource(resource: str):
    table = RESOURCE_TO_TABLE.get(resource)
    if not table:
        return None
    return TABLE_TO_MODEL.get(table)


def _row_from_model(instance) -> dict[str, Any]:
    """Convert ORM instance to dict (snake_case keys)."""
    return {c.key: getattr(instance, c.key) for c in instance.__table__.columns}


def _safe_commit(db: Session) -> None:
    """Commit with rollback on IntegrityError, raising appropriate HTTP errors."""
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        msg = str(e.orig) if e.orig else str(e)
        if "UNIQUE constraint" in msg:
            raise HTTPException(status_code=409, detail="Duplicate entry: a record with this value already exists")
        if "FOREIGN KEY constraint" in msg:
            raise HTTPException(status_code=422, detail="Referenced record not found")
        raise HTTPException(status_code=400, detail="Data integrity error")
    except Exception:
        db.rollback()
        raise


def _remap_keys(d: dict[str, Any]) -> dict[str, Any]:
    """Remap reserved-word keys to their ORM attribute names."""
    return {_KEY_TO_ATTR.get(k, k): v for k, v in d.items()}


# ---------------------------------------------------------------------------
# CRUD operations
# ---------------------------------------------------------------------------

def resource_list(
    db: Session,
    resource: str,
    limit: int = 100,
    offset: int = 0,
    order_by: str | None = None,
    order: str = "asc",
    filters: dict[str, Any] | None = None,
) -> list[dict[str, Any]]:
    model = _model_for_resource(resource)
    if not model:
        return []

    q = select(model)

    if filters:
        for key, value in filters.items():
            if hasattr(model, key) and value is not None:
                q = q.where(getattr(model, key) == value)

    # Validate order_by against allowlist
    if order_by:
        allowed = ORDERABLE_COLUMNS.get(resource, set())
        if order_by not in allowed:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot order by '{order_by}'. Allowed: {sorted(allowed)}",
            )
        col = getattr(model, order_by)
        q = q.order_by(col.desc() if order == "desc" else col.asc())

    q = q.limit(limit).offset(offset)
    rows = db.execute(q).scalars().all()

    out = []
    for row in rows:
        d = _row_from_model(row)
        decoded = decode_row_from_db(d, resource)
        out.append(row_to_camel(decoded))
    return out


def resource_get(db: Session, resource: str, id: str) -> dict[str, Any] | None:
    model = _model_for_resource(resource)
    if not model:
        return None
    instance = db.get(model, id)
    if not instance:
        return None
    d = _row_from_model(instance)
    decoded = decode_row_from_db(d, resource)
    return row_to_camel(decoded)


def resource_create(db: Session, resource: str, body: dict[str, Any]) -> dict[str, Any]:
    model = _model_for_resource(resource)
    if not model:
        raise HTTPException(status_code=404, detail=f"Unknown resource: {resource}")

    table = RESOURCE_TO_TABLE[resource]
    body_snake = body_to_snake(body)

    # Normalize empty client_id to None for projects
    if resource == "projects" and not body_snake.get("client_id"):
        body_snake["client_id"] = None

    if not body_snake.get("id"):
        body_snake["id"] = f"{table.upper()[:3]}-{uuid.uuid4().hex[:8]}"

    encoded = encode_row_for_db(body_snake, resource)
    remapped = _remap_keys(encoded)
    instance = model(**{k: v for k, v in remapped.items() if hasattr(model, k)})
    db.add(instance)
    _safe_commit(db)
    db.refresh(instance)

    d = _row_from_model(instance)
    decoded = decode_row_from_db(d, resource)
    return row_to_camel(decoded)


def resource_update(
    db: Session, resource: str, id: str, body: dict[str, Any],
) -> dict[str, Any] | None:
    model = _model_for_resource(resource)
    if not model:
        return None
    instance = db.get(model, id)
    if not instance:
        return None

    body_snake = body_to_snake(body)
    encoded = encode_row_for_db(body_snake, resource)
    remapped = _remap_keys(encoded)

    for key, value in remapped.items():
        if hasattr(instance, key):
            setattr(instance, key, value)

    _safe_commit(db)
    db.refresh(instance)

    d = _row_from_model(instance)
    decoded = decode_row_from_db(d, resource)
    return row_to_camel(decoded)


def resource_delete(db: Session, resource: str, id: str) -> bool:
    model = _model_for_resource(resource)
    if not model:
        return False
    instance = db.get(model, id)
    if not instance:
        return False
    db.delete(instance)
    _safe_commit(db)
    return True
