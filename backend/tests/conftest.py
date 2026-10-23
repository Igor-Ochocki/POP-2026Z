from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.database import create_tables, get_db
from app.main import app


@pytest.fixture
def db_session() -> Generator[Session]:
    """Fresh in-memory SQLite database for every test."""
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    create_tables(engine)
    session = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)()
    try:
        yield session
    finally:
        session.close()
        engine.dispose()


@pytest.fixture
def client(db_session: Session) -> Generator[TestClient]:
    """HTTP client with get_db overridden to use the test database."""
    app.dependency_overrides[get_db] = lambda: db_session
    # No "with" block on purpose: lifespan (create_all on the real DB) is not triggered.
    yield TestClient(app)
    app.dependency_overrides.clear()
