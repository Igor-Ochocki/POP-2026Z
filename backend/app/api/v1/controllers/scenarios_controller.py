from abc import ABC, abstractmethod
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.scenario import ScenarioDetailSchema, CreateTaskDTO, TaskSchema
from app.services.scenarios_service import IScenariosService, ScenariosService


class IScenariosApi(ABC):
    @abstractmethod
    def load_scenario(self, game_id: str, user_id: str) -> ScenarioDetailSchema: ...
    
    @abstractmethod
    def add_task(self, game_id: str, user_id: str): ...

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



@router.post("/{game_id}/scenario/tasks")
def add_task(
    game_id: str,
    user_id: str,
    create_task_dto: CreateTaskDTO,
    service: Annotated[IScenariosService, Depends(get_scenarios_service)],
):
    return service.add_task(game_id, user_id, create_task_dto)