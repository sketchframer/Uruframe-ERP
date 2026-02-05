"""FastAPI app: CORS, lifespan (ensure DB + run migrations), mount routers."""

import subprocess
import sys
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db_and_pragmas
from app.routers import auth, resources

# Backend root (parent of app package) for Alembic cwd
BACKEND_ROOT = Path(__file__).resolve().parent.parent


def run_migrations() -> None:
    """Run Alembic migrations (up to head)."""
    try:
        result = subprocess.run(
            [sys.executable, "-m", "alembic", "upgrade", "head"],
            cwd=str(BACKEND_ROOT),
            capture_output=True,
            text=True,
        )
        if result.returncode != 0:
            print("Migration warning:", result.stderr or result.stdout)
    except Exception as e:
        print("Migration warning:", e)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db_and_pragmas()
    run_migrations()
    yield


app = FastAPI(title="Structura API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth first so /api/auth/* is matched before /api/{resource}
app.include_router(auth.router)
app.include_router(resources.router)


@app.get("/health")
def health():
    return {"status": "ok"}
