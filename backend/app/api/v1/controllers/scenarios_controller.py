from abc import ABC, abstractmethod
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.scenario import ScenarioDetailSchema
from app.services.scenarios_service import IScenariosService, ScenariosService


class ScenariosApi(ABC):
    @abstractmethod
    def load_scenario(self, game_id: str, user_id: str) -> ScenarioDetailSchema: ...


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
