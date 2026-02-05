"""Centralized JSON column encode/decode for DB rows; snake_case <-> camelCase."""

import json
from typing import Any

from app.registry import JSON_COLUMNS, RESOURCE_TO_TABLE


def _table_for_resource(resource: str) -> str:
    return RESOURCE_TO_TABLE.get(resource, resource.replace("-", "_"))


def snake_to_camel(name: str) -> str:
    parts = name.split("_")
    return parts[0] + "".join(p.capitalize() for p in parts[1:])


def camel_to_snake(name: str) -> str:
    result = []
    for i, c in enumerate(name):
        if c.isupper() and i > 0:
            result.append("_")
        result.append(c.lower())
    return "".join(result)


def row_to_camel(row_dict: dict[str, Any]) -> dict[str, Any]:
    """Convert DB row (snake_case keys) to API response (camelCase keys)."""
    return {snake_to_camel(k): v for k, v in row_dict.items()}


def body_to_snake(body: dict[str, Any]) -> dict[str, Any]:
    """Convert request body (camelCase keys) to DB row (snake_case keys)."""
    return {camel_to_snake(k): v for k, v in body.items()}


def encode_row_for_db(row_dict: dict[str, Any], resource: str) -> dict[str, Any]:
    """Encode JSON columns for writing to DB (Python -> JSON string)."""
    table = _table_for_resource(resource)
    cols = JSON_COLUMNS.get(table, [])
    out = dict(row_dict)
    for col in cols:
        if col in out and out[col] is not None and not isinstance(out[col], str):
            out[col] = json.dumps(out[col])
    return out


def decode_row_from_db(row_dict: dict[str, Any], resource: str) -> dict[str, Any]:
    """Decode JSON columns when reading from DB (JSON string -> Python)."""
    table = _table_for_resource(resource)
    cols = JSON_COLUMNS.get(table, [])
    out = dict(row_dict)
    for col in cols:
        if col in out and out[col] is not None:
            val = out[col]
            if isinstance(val, str):
                try:
                    out[col] = json.loads(val)
                except json.JSONDecodeError:
                    out[col] = val
    return out
