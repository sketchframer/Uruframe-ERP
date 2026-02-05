"""Generic resource CRUD routes (kebab-case URLs)."""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.registry import RESOURCE_NAMES
from app.services.resource import (
    resource_create,
    resource_delete,
    resource_get,
    resource_list,
    resource_update,
)

router = APIRouter(prefix="/api", tags=["resources"])


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
    return resource_list(db, resource, limit=limit, offset=offset, order_by=order_by, order=order)


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


@router.post("/{resource}")
def create_resource(
    resource: str,
    body: dict[str, Any],
    db: Session = Depends(get_db),
):
    if resource not in RESOURCE_NAMES:
        raise HTTPException(status_code=404, detail="Not found")
    try:
        return resource_create(db, resource, body)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{resource}/{id}")
def update_resource(
    resource: str,
    id: str,
    body: dict[str, Any],
    db: Session = Depends(get_db),
):
    if resource not in RESOURCE_NAMES:
        raise HTTPException(status_code=404, detail="Not found")
    item = resource_update(db, resource, id, body)
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
