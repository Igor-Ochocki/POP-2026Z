from sqlalchemy import text
from sqlalchemy.orm import Session

from app.schemas.health import HealthResponseSchema


class HealthService:
    """Example service - services own the DB session and run all ORM queries."""

    def __init__(self, db_session: Session) -> None:
        self.db_session = db_session

    def check(self) -> HealthResponseSchema:
        try:
            self.db_session.execute(text("SELECT 1"))
            database = "ok"
        except Exception:
            database = "unavailable"
        return HealthResponseSchema(status="ok", database=database)
