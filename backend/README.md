# Structura Backend

FastAPI + SQLite backend for Structura ERP. Run from repo root or backend:

- `uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
- `uv run alembic upgrade head`
- `uv run python -m app.seed` (optional `--reset`)
