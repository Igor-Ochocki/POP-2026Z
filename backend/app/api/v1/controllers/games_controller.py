from abc import ABC, abstractmethod
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.game import GameCreateSchema, GameResponseSchema
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

