"""SQLAlchemy engine, session, get_db dependency; SQLite pragmas on startup."""

from collections.abc import Generator
from contextlib import contextmanager

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker

from app.config import settings
from app.models.base import Base

engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False},
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def set_sqlite_pragmas(conn) -> None:
    with conn.execute(text("PRAGMA journal_mode=WAL")) as _:
        pass
    with conn.execute(text("PRAGMA busy_timeout=5000")) as _:
        pass


@contextmanager
def get_engine_connection():
    with engine.connect() as conn:
        set_sqlite_pragmas(conn)
        yield conn


def init_db_and_pragmas() -> None:
    """Ensure DB exists and set pragmas on a new connection (e.g. at startup)."""
    with engine.connect() as conn:
        set_sqlite_pragmas(conn)


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency: one session per request, closed in finally."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
