from abc import ABC, abstractmethod
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.game import GameCreateSchema, GameResponseSchema
from app.schemas.map import MapSchema
from app.schemas.sensor import SensorSchema
from app.services.games_service import GamesService, IGamesService


class IGamesApi(ABC):
    @abstractmethod
    def get_game(self, game_id: str, user_id: str) -> GameResponseSchema: ...

    @abstractmethod
    def save_game(self, user_id: str, metadata: GameCreateSchema, as_draft: bool) -> GameResponseSchema: ...

    @abstractmethod
    def edit_game(self, game_id: str, user_id: str, metadata: GameCreateSchema, as_draft: bool) -> GameResponseSchema: ...

    @abstractmethod
    def get_games(self, user_id: str, tags: list[str], limit: int, offset: int) -> list[GameResponseSchema]: ...

    @abstractmethod
    def get_game_tags(self) -> list[str]: ...

    @abstractmethod
    def submit_to_reviewer(self, game_id: str, user_id: str) -> bool: ...

    @abstractmethod
    def get_map(self, game_id: str, user_id: str) -> MapSchema: ...

    @abstractmethod
    def edit_map(self, game_id: str, user_id: str, data: MapSchema) -> MapSchema: ...

    @abstractmethod
    def get_sensor_types(self) -> list[str]: ...

    @abstractmethod
    def add_sensor(self, game_id: str, user_id: str, room_id: int, data: SensorSchema) -> SensorSchema: ...


router = APIRouter(prefix="/games", tags=["games"])


def get_games_service(db: Annotated[Session, Depends(get_db)]) -> IGamesService:
    return GamesService(db)


@router.get("", response_model=list[GameResponseSchema])
def get_games(
    user_id: str,
    service: Annotated[IGamesService, Depends(get_games_service)],
    tags: Annotated[list[str] | None, Query()] = None,
    limit: Annotated[int, Query(ge=1, le=100)] = 10,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> list[GameResponseSchema]:
    return service.get_games(user_id, tags or [], limit, offset)


# Registered before GET /{game_id}, otherwise "tags" would be taken as a game id.
@router.get("/tags", response_model=list[str])
def get_game_tags(
    service: Annotated[IGamesService, Depends(get_games_service)],
) -> list[str]:
    return service.get_game_tags()


@router.get("/{game_id}", response_model=GameResponseSchema)
def get_game(
    game_id: str,
    user_id: str,
    service: Annotated[IGamesService, Depends(get_games_service)],
) -> GameResponseSchema:
    return service.get_game(game_id, user_id)


@router.post("", response_model=GameResponseSchema)
def save_game(
    dto: GameCreateSchema,
    user_id: str,
    service: Annotated[IGamesService, Depends(get_games_service)],
    as_draft: bool = True,
) -> GameResponseSchema:
    return service.save_game(user_id, dto, as_draft)


@router.put("/{game_id}", response_model=GameResponseSchema)
def edit_game(
    game_id: str,
    dto: GameCreateSchema,
    user_id: str,
    service: Annotated[IGamesService, Depends(get_games_service)],
    as_draft: bool = True,
) -> GameResponseSchema:
    return service.edit_game(game_id, user_id, dto, as_draft)


@router.post("/{game_id}/submit", response_model=bool)
def submit_to_reviewer(
    game_id: str,
    user_id: str,
    service: Annotated[IGamesService, Depends(get_games_service)],
) -> bool:
    return service.submit_to_reviewer(game_id, user_id)

@router.get("/{game_id}/map", response_model=MapSchema)
def get_map(
    game_id: str,
    user_id: str,
    service: Annotated[IGamesService, Depends(get_games_service)],
) -> MapSchema:
    return service.get_map(game_id, user_id)

@router.post("/{game_id}/map/edit", response_model=MapSchema)
def edit_map(
    game_id: str,
    user_id: str,
    data: MapSchema,
    service: Annotated[IGamesService, Depends(get_games_service)],
) -> MapSchema:
    return service.edit_map(game_id, user_id, data)

@router.get("/sensortypes", response_model=list[str])
def get_sensor_types(
    service: Annotated[IGamesService, Depends(get_games_service)],
) -> list[str]:
    return service.get_sensor_types()

@router.put("/{game_id}/sensor/add", response_model=SensorSchema)
def add_sensor(
    game_id: str,
    user_id: str,
    room_id: int,
    data: SensorSchema,
    service: Annotated[IGamesService, Depends(get_games_service)],
) -> SensorSchema:
    return service.add_sensor(game_id, user_id, room_id, data)
