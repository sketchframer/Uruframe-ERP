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
