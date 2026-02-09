"""Generic resource CRUD routes (kebab-case URLs) with schema validation."""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.schemas import SCHEMA_REGISTRY
from app.registry import RESOURCE_NAMES
from app.services.resource import (
    resource_create,
    resource_delete,
    resource_get,
    resource_list,
    resource_update,
)

router = APIRouter(prefix="/api", tags=["resources"])


def _validate_body(resource: str, action: str, body: dict[str, Any]) -> dict[str, Any]:
    """Validate body against the schema registry. Returns camelCase dict for the service."""
    schemas = SCHEMA_REGISTRY.get(resource)
    if not schemas or action not in schemas:
        # No schema registered: pass through (shouldn't happen with current registry)
        return body

    schema_cls = schemas[action]
    try:
        validated = schema_cls(**body)
    except ValidationError as e:
        # Return the first error in a clean format
        errors = e.errors()
        detail = "; ".join(
            f"{'.'.join(str(loc) for loc in err['loc'])}: {err['msg']}"
            for err in errors[:3]  # limit to 3 errors
        )
        raise HTTPException(status_code=422, detail=detail)

    # Dump back to dict preserving camelCase for service layer
    if action == "update":
        return validated.model_dump(by_alias=True, exclude_unset=True)
    return validated.model_dump(by_alias=True)


@router.get("/{resource}")
def list_resources(
    resource: str,
    db: Session = Depends(get_db),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    order_by: str | None = Query(None, alias="orderBy"),
    order: str = Query("asc"),
):
    if resource not in RESOURCE_NAMES:
        raise HTTPException(status_code=404, detail="Not found")
    return resource_list(
        db, resource, limit=limit, offset=offset, order_by=order_by, order=order,
    )


@router.get("/{resource}/{id}")
def get_resource(
    resource: str,
    id: str,
    db: Session = Depends(get_db),
):
    if resource not in RESOURCE_NAMES:
        raise HTTPException(status_code=404, detail="Not found")
    item = resource_get(db, resource, id)
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    return item


@router.post("/{resource}", status_code=201)
def create_resource(
    resource: str,
    body: dict[str, Any],
    db: Session = Depends(get_db),
):
    if resource not in RESOURCE_NAMES:
        raise HTTPException(status_code=404, detail="Not found")
    validated = _validate_body(resource, "create", body)
    return resource_create(db, resource, validated)


@router.patch("/{resource}/{id}")
def update_resource(
    resource: str,
    id: str,
    body: dict[str, Any],
    db: Session = Depends(get_db),
):
    if resource not in RESOURCE_NAMES:
        raise HTTPException(status_code=404, detail="Not found")
    validated = _validate_body(resource, "update", body)
    item = resource_update(db, resource, id, validated)
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    return item


@router.delete("/{resource}/{id}", status_code=204)
def delete_resource(
    resource: str,
    id: str,
    db: Session = Depends(get_db),
):
    if resource not in RESOURCE_NAMES:
        raise HTTPException(status_code=404, detail="Not found")
    ok = resource_delete(db, resource, id)
    if not ok:
        raise HTTPException(status_code=404, detail="Not found")
