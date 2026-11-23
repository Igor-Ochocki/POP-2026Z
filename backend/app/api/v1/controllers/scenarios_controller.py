from abc import ABC, abstractmethod
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.scenario import (
    ScenarioDetailSchema,
    TaskCreateSchema,
    TaskSchema,
    VictoryConditionCreateSchema,
    VictoryConditionSchema,
)
from app.services.scenarios_service import IScenariosService, ScenariosService


class IScenariosApi(ABC):
    @abstractmethod
    def load_scenario(self, game_id: str, user_id: str) -> ScenarioDetailSchema: ...

    @abstractmethod
    def add_task(self, game_id: str, user_id: str, dto: TaskCreateSchema) -> TaskSchema: ...

    @abstractmethod
    def get_victory_condition_list(self, game_id: str, user_id: str) -> list[VictoryConditionSchema]: ...

    @abstractmethod
    def get_victory_condition(self, game_id: str, victory_condition_id: str, user_id: str) -> VictoryConditionSchema: ...

    @abstractmethod
    def create_victory_condition(
        self, game_id: str, user_id: str, dto: VictoryConditionCreateSchema
    ) -> VictoryConditionSchema: ...

    @abstractmethod
    def edit_victory_condition(
        self, game_id: str, victory_condition_id: str, user_id: str, dto: VictoryConditionCreateSchema
    ) -> VictoryConditionSchema: ...


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


@router.get("/{game_id}/scenario/victory_conditions", response_model=list[VictoryConditionSchema])
def get_victory_condition_list(
    game_id: str,
    user_id: str,
    service: Annotated[IScenariosService, Depends(get_scenarios_service)],
) -> list[VictoryConditionSchema]:
    return service.get_victory_condition_list(game_id, user_id)


@router.get(
    "/{game_id}/scenario/victory_conditions/{victory_condition_id}",
    response_model=VictoryConditionSchema,
)
def get_victory_condition(
    game_id: str,
    victory_condition_id: str,
    user_id: str,
    service: Annotated[IScenariosService, Depends(get_scenarios_service)],
) -> VictoryConditionSchema:
    return service.get_victory_condition(game_id, victory_condition_id, user_id)


@router.post(
    "/{game_id}/scenario/victory_conditions",
    response_model=VictoryConditionSchema,
    status_code=201,
)
def create_victory_condition(
    game_id: str,
    dto: VictoryConditionCreateSchema,
    user_id: str,
    service: Annotated[IScenariosService, Depends(get_scenarios_service)],
) -> VictoryConditionSchema:
    return service.create_victory_condition(game_id, user_id, dto)


@router.put(
    "/{game_id}/scenario/victory_conditions/{victory_condition_id}",
    response_model=VictoryConditionSchema,
)
def edit_victory_condition(
    game_id: str,
    victory_condition_id: str,
    dto: VictoryConditionCreateSchema,
    user_id: str,
    service: Annotated[IScenariosService, Depends(get_scenarios_service)],
) -> VictoryConditionSchema:
    return service.edit_victory_condition(game_id, victory_condition_id, user_id, dto)
