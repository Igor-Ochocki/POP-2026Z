from abc import ABC, abstractmethod

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.exceptions import ForbiddenError, NotFoundError
from app.models.character import Character
from app.models.map import Map, Passage, Room
from app.schemas.map import (
    PassageSchema,
    PlayerMapSchema,
    PlayerRoomSchema,
    PositionSchema,
    RoomAccess,
)


class IMapsService(ABC):
    @abstractmethod
    def get_player_map(self, game_id: str, user_id: str) -> PlayerMapSchema: ...


class MapsService(IMapsService):
    def __init__(self, db_session: Session) -> None:
        self.db_session = db_session

    def get_player_map(self, game_id: str, user_id: str) -> PlayerMapSchema:
        # Pobierz mapę gry
        game_map = self.db_session.scalar(
            select(Map).where(Map.game_id == game_id)
        )
        if game_map is None:
            raise NotFoundError(f"Map for game {game_id} not found")

        # Sprawdź, czy użytkownik ma postać w tej grze
        character = self.db_session.scalar(
            select(Character).where(
                Character.game_id == game_id,
                Character.user_id == user_id,
            )
        )
        if character is None:
            raise ForbiddenError(f"User {user_id} has no character in game {game_id}")

        allowed_zones = set(character.access_zones or [])

        # Filtruj komnaty wg uprawnień postaci
        visible_rooms: list[PlayerRoomSchema] = []
        visible_room_ids: set[str] = set()

        for room in game_map.rooms:
            if room.zone in allowed_zones:
                visible_rooms.append(PlayerRoomSchema(
                    room_id=room.id,
                    access=RoomAccess.ACCESSIBLE,
                    position=PositionSchema(x=room.position_x, y=room.position_y),
                    width=room.width,
                    height=room.height,
                    name=room.name,
                    description=room.description,
                ))
                visible_room_ids.add(room.id)
            elif not room.hidden:
                # Komnata widoczna jako zarys (brak uprawnień, ale nie ukryta)
                visible_rooms.append(PlayerRoomSchema(
                    room_id=room.id,
                    access=RoomAccess.OUTLINE,
                    position=PositionSchema(x=room.position_x, y=room.position_y),
                    width=room.width,
                    height=room.height,
                    name=None,
                    description=None,
                ))
                visible_room_ids.add(room.id)
            # else: hidden + brak uprawnień -> pomijamy

        # Przejścia tylko między widocznymi komnatami
        visible_passages: list[PassageSchema] = []
        for passage in game_map.passages:
            if passage.room1_id in visible_room_ids and passage.room2_id in visible_room_ids:
                visible_passages.append(PassageSchema(
                    passage_id=passage.id,
                    room1_id=passage.room1_id,
                    room2_id=passage.room2_id,
                ))

        return PlayerMapSchema(
            map_id=game_map.id,
            game_id=game_id,
            name=game_map.name,
            character_id=character.id,
            rooms=visible_rooms,
            passages=visible_passages,
        )
