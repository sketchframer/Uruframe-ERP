"""Single mapping: URL resource (kebab-case) <-> table name (snake_case) <-> JSON columns."""

# URL path segment (kebab-case) -> DB table name (snake_case)
RESOURCE_TO_TABLE: dict[str, str] = {
    "users": "users",
    "machines": "machines",
    "jobs": "jobs",
    "projects": "projects",
    "clients": "clients",
    "inventory": "inventory",
    "alerts": "alerts",
    "events": "events",
    "messages": "messages",
    "project-accessories": "project_accessories",
}

# Table name -> list of columns that store JSON (snake_case column names)
JSON_COLUMNS: dict[str, list[str]] = {
    "machines": ["operator_ids"],
    "jobs": ["operator_ids", "workflow_stages"],
    "users": [],
    "projects": [],
    "clients": [],
    "inventory": [],
    "alerts": [],
    "events": [],
    "messages": [],
    "project_accessories": [],
}

# Valid resource names for generic CRUD
RESOURCE_NAMES: set[str] = set(RESOURCE_TO_TABLE)

# Per-resource allowlist for order_by (snake_case column names)
ORDERABLE_COLUMNS: dict[str, set[str]] = {
    "users": {"id", "name", "role"},
    "machines": {"id", "name", "type", "status", "efficiency", "last_maintenance", "is_active"},
    "jobs": {"id", "status", "priority_index", "start_date", "end_date", "product_name", "target_quantity"},
    "projects": {"id", "name", "deadline", "status", "budget"},
    "clients": {"id", "name", "email"},
    "inventory": {"id", "name", "sku", "quantity", "location"},
    "alerts": {"id", "timestamp", "severity", "type"},
    "events": {"id", "timestamp", "type", "severity"},
    "messages": {"id", "timestamp", "is_read"},
    "project-accessories": {"id", "project_id", "quantity_required", "is_fulfilled"},
}
