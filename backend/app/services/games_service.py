from abc import ABC, abstractmethod

from sqlalchemy.orm import Session
from sqlalchemy import or_

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
    def get_authored_games(
        self,
        user_id: str,
        tags: list[str] = [],
        limit: int = 10,
        offset: int = 0
    ) -> list[Game]: ...

    @abstractmethod
    def get_game_tags(
        self,
    #    user_id: str,
    ) -> list[str]: ...

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


    def get_authored_games(
        self,
        user_id: str,
        tags: list[str] = [],
        limit: int = 10,
        offset: int = 0
    ) -> list[Game]:
        query = self.db_session.query(Game).filter(Game.author_id == user_id)

        games = query.all()
        
        if tags:
            tag_set = set(tags)
            games = [g for g in games if g.tags and tag_set.issubset(set(g.tags))]
        
        games = games[offset : offset + limit]
        return [self._map_to_response(g) for g in games]

    def get_game_tags(
        self,
    #    user_id: str,
    ) -> list[str]:
        
        results = (
            self.db_session.query(Game.tags)
  #          .filter(Game.author_id == user_id)
            .distinct()
            .all()
        )

        all_tags = []
        for tags_array in results:
            all_tags.extend(tags_array[0]) 

        return list(set(all_tags))


