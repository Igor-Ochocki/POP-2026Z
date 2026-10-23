import importlib
from collections.abc import Generator

from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import get_settings


class Base(DeclarativeBase):
    """Base class for all ORM models (app/models)."""


engine = create_engine(
    get_settings().database_url,
    # Required by SQLite when the session is used across FastAPI worker threads.
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def get_db() -> Generator[Session]:
    """FastAPI dependency - one database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables(bind: Engine = engine) -> None:
    """Create tables for every ORM model listed in app/models/__init__.py."""
    # Loading the app.models package registers all models in Base.metadata.
    importlib.import_module("app.models")
    Base.metadata.create_all(bind=bind)
