from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.health import HealthResponseSchema
from app.services.health_service import HealthService

router = APIRouter(prefix="/health", tags=["health"])


def get_health_service(db: Annotated[Session, Depends(get_db)]) -> HealthService:
    return HealthService(db)


@router.get("", response_model=HealthResponseSchema)
def get_health(service: Annotated[HealthService, Depends(get_health_service)]) -> HealthResponseSchema:
    return service.check()
