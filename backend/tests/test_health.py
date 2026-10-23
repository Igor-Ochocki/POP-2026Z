from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.services.health_service import HealthService


def test_health_service_reports_database_ok(db_session: Session) -> None:
    result = HealthService(db_session).check()

    assert result.status == "ok"
    assert result.database == "ok"


def test_health_endpoint_returns_ok(client: TestClient) -> None:
    response = client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "database": "ok"}
