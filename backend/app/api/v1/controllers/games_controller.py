from abc import ABC, abstractmethod
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.game import GameCreateSchema, GameResponseSchema
from app.services.games_service import GameNotFoundError, GamesService, IGamesService


class GamesApi(ABC):
    @abstractmethod
    def save_game(self, metadata: GameCreateSchema, as_draft: bool) -> GameResponseSchema: ...

    @abstractmethod
    def submit_to_reviewer(self, game_id: str) -> bool: ...


router = APIRouter(prefix="/games", tags=["games"])


def get_games_service(db: Annotated[Session, Depends(get_db)]) -> IGamesService:
    return GamesService(db)


@router.get("/{id}", response_model=GameResponseSchema)
def get_game(
    id: str,
    service: Annotated[IGamesService, Depends(get_games_service)],
) -> GameResponseSchema:
    try:
        return service.get(id)
    except GameNotFoundError:
        raise HTTPException(status_code=404, detail=f"Game {id} not found")


@router.post("", response_model=GameResponseSchema)
def save_game(
    dto: GameCreateSchema,
    service: Annotated[IGamesService, Depends(get_games_service)],
    as_draft: bool = True,
) -> GameResponseSchema:
    return service.save_game(dto, as_draft)


@router.put("/{id}", response_model=GameResponseSchema)
def update_game(
    id: str,
    dto: GameCreateSchema,
    service: Annotated[IGamesService, Depends(get_games_service)],
) -> GameResponseSchema:
    try:
        return service.update(id, dto)
    except GameNotFoundError:
        raise HTTPException(status_code=404, detail=f"Game {id} not found")
