from abc import ABC, abstractmethod
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.map import PlayerMapSchema
from app.services.maps_service import IMapsService, MapsService


class IMapsApi(ABC):
    @abstractmethod
    def get_player_map(self, game_id: str, user_id: str) -> PlayerMapSchema: ...


router = APIRouter(prefix="/games", tags=["maps"])


def get_maps_service(db: Annotated[Session, Depends(get_db)]) -> IMapsService:
    return MapsService(db)


@router.get("/{game_id}/map/player", response_model=PlayerMapSchema)
def get_player_map(
    game_id: str,
    user_id: str,
    service: Annotated[IMapsService, Depends(get_maps_service)],
) -> PlayerMapSchema:
    return service.get_player_map(game_id, user_id)
