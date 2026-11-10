from abc import ABC, abstractmethod

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError
from app.models.game import Game, GameStatus
from app.schemas.game import GameCreateSchema, GameResponseSchema


class IGamesService(ABC):
    @abstractmethod
    def save_game(self, user_id: str, dto: GameCreateSchema, as_draft: bool) -> GameResponseSchema: ...

    @abstractmethod
    def submit_to_reviewer(self, game_id: str, user_id: str) -> bool: ...

    @abstractmethod
    def get_game(self, game_id: str, user_id: str) -> GameResponseSchema: ...

    @abstractmethod
    def edit_game(self, game_id: str, user_id: str, dto: GameCreateSchema, as_draft: bool) -> GameResponseSchema: ...

    @abstractmethod
    def get_games(self, user_id: str, tags: list[str], limit: int, offset: int) -> list[GameResponseSchema]: ...

    @abstractmethod
    def get_game_tags(self) -> list[str]: ...


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

    def submit_to_reviewer(self, game_id: str, user_id: str) -> bool:
        game = self.db_session.get(Game, game_id)
        if game is None:
            raise NotFoundError(f"Game {game_id} not found")
        if game.author_id != user_id:
            raise NotFoundError(f"Game {game_id} not found")

        if game.status in (GameStatus.Submitted, GameStatus.Approved, GameStatus.Rejected):
            raise ConflictError(f"Game {game_id} is already in {game.status.value} status")

        game.status = GameStatus.Submitted
        self.db_session.commit()

        return True

    def get_game(self, game_id: str, user_id: str) -> GameResponseSchema:
        game = self.db_session.get(Game, game_id)
        if game is None:
            raise NotFoundError(f"Game {game_id} not found")
        if game.author_id != user_id:
            raise NotFoundError(f"Game {game_id} not found")
        return self._map_to_response(game)

    def edit_game(self, game_id: str, user_id: str, dto: GameCreateSchema, as_draft: bool) -> GameResponseSchema:
        game = self.db_session.get(Game, game_id)
        if game is None:
            raise NotFoundError(f"Game {game_id} not found")
        if game.author_id != user_id:
            raise NotFoundError(f"Game {game_id} not found")

        if game.status == GameStatus.Approved:
            raise ConflictError(f"Game {game_id} is already approved and cannot be modified")

        game.title = dto.title
        game.description = dto.description
        game.min_players = dto.min_players
        game.max_players = dto.max_players
        game.duration_minutes = dto.duration_minutes
        game.requires_invitation = dto.requires_invitation
        game.tags = dto.tags
        game.status = GameStatus.Draft if as_draft else GameStatus.Submitted

        self.db_session.commit()
        self.db_session.refresh(game)

        return self._map_to_response(game)

    def get_games(self, user_id: str, tags: list[str], limit: int, offset: int) -> list[GameResponseSchema]:
        query = select(Game).where(Game.author_id == user_id).order_by(Game.title, Game.id)
        games = list(self.db_session.scalars(query))
        if tags:
            # tags is a JSON column - games must have every requested tag.
            required = set(tags)
            games = [game for game in games if required.issubset(game.tags or [])]
        return [self._map_to_response(game) for game in games[offset : offset + limit]]

    def get_game_tags(self) -> list[str]:
        all_tags: set[str] = set()
        for tags in self.db_session.scalars(select(Game.tags)):
            all_tags.update(tags or [])
        return sorted(all_tags)
