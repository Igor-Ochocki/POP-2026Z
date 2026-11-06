from abc import ABC, abstractmethod

from sqlalchemy.orm import Session

from app.models.game import Game, GameStatus
from app.schemas.game import GameCreateSchema, GameResponseSchema

class GameNotFoundError(Exception):
    pass


class IGamesService(ABC):
    @abstractmethod
    def save_game(self, user_id: str, dto: GameCreateSchema, as_draft: bool) -> GameResponseSchema: ...

    @abstractmethod
    def submit_to_reviewer(self, user_id: str, game_id: str) -> bool: ...

    @abstractmethod
    def get(self, user_id: str, id: str) -> GameResponseSchema: ...

    @abstractmethod
    def update(self, user_id: str, id: str, dto: GameCreateSchema) -> GameResponseSchema: ...


class GamesService(IGamesService):
    def __init__(self, db_session: Session) -> None:
        self.db_session = db_session

    @staticmethod
    def _map_to_response(game: Game) -> GameResponseSchema:
        return GameResponseSchema(
            game_id=game.id,
            title=game.title,
            description=game.description,
            min_players=game.min_players,
            max_players=game.max_players,
            duration_minutes=game.duration_minutes,
            requires_invitation=game.requires_invitation,
            tags=game.tags,
            status=game.status.value,
        )

    def get(self, user_id: str, id: str) -> GameResponseSchema:
        game = self.db_session.get(Game, id)
        if game is None:
            raise GameNotFoundError(f"Game {id} not found")
        if game.author_id != user_id:
            raise GameNotFoundError(f"Game {id} not found")
        return self._map_to_response(game)

    def save_game(self, user_id: str, dto: GameCreateSchema, as_draft: bool) -> GameResponseSchema:
        game = Game(
            author_id=user_id,
            title=dto.title,
            description=dto.description,
            min_players=dto.min_players,
            max_players=dto.max_players,
            duration_minutes=dto.duration_minutes,
            requires_invitation=dto.requires_invitation,
            tags=dto.tags,
            status=GameStatus.Draft if as_draft else GameStatus.Submitted,
        )

        self.db_session.add(game)
        self.db_session.commit()
        self.db_session.refresh(game)

        return self._map_to_response(game)

    def submit_to_reviewer(self, user_id: str, game_id: str) -> bool:
        game = self.db_session.get(Game, game_id)
        if game is None:
            raise GameNotFoundError(f"Game {game_id} not found")
        if game.author_id != user_id:
            raise GameNotFoundError(f"Game {game_id} not found")

        if game.status in (GameStatus.Submitted, GameStatus.Approved, GameStatus.Rejected):
            raise ValueError(f"Game {game_id} is already in {game.status.value} status")

        game.status = GameStatus.Submitted
        self.db_session.commit()

        return True

    def update(self, user_id: str, id: str, dto: GameCreateSchema) -> GameResponseSchema:
        game = self.db_session.get(Game, id)
        if game is None:
            raise GameNotFoundError(f"Game {id} not found")
        if game.author_id != user_id:
            raise GameNotFoundError(f"Game {id} not found")

        if game.status == GameStatus.Approved:
            raise ValueError(f"Game {id} is already approved and cannot be modified")

        game.title = dto.title
        game.description = dto.description
        game.min_players = dto.min_players
        game.max_players = dto.max_players
        game.duration_minutes = dto.duration_minutes
        game.requires_invitation = dto.requires_invitation
        game.tags = dto.tags

        self.db_session.commit()
        self.db_session.refresh(game)

        return self._map_to_response(game)
