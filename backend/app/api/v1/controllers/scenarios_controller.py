from abc import ABC, abstractmethod
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.scenario import ScenarioDetailSchema, TaskCreateSchema, TaskSchema
from app.services.scenarios_service import IScenariosService, ScenariosService


class IScenariosApi(ABC):
    @abstractmethod
    def load_scenario(self, game_id: str, user_id: str) -> ScenarioDetailSchema: ...

    @abstractmethod
    def add_task(self, game_id: str, user_id: str, dto: TaskCreateSchema) -> TaskSchema: ...


router = APIRouter(prefix="/games", tags=["scenario"])


def get_scenarios_service(db: Annotated[Session, Depends(get_db)]) -> IScenariosService:
    return ScenariosService(db)


@router.get("/{game_id}/scenario", response_model=ScenarioDetailSchema)
def load_scenario(
    game_id: str,
    user_id: str,
    service: Annotated[IScenariosService, Depends(get_scenarios_service)],
) -> ScenarioDetailSchema:
    return service.load_scenario(game_id, user_id)


@router.post("/{game_id}/scenario/tasks", response_model=TaskSchema, status_code=201)
def add_task(
    game_id: str,
    user_id: str,
    dto: TaskCreateSchema,
    service: Annotated[IScenariosService, Depends(get_scenarios_service)],
) -> TaskSchema:
    return service.add_task(game_id, user_id, dto)
