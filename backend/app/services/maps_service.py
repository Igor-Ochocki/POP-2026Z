from abc import ABC, abstractmethod
from pydantic import ValidationError
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError, UnprocessableContentError, ForbiddenError
from app.models.character import Character
from app.models.game import Game
from app.models.map import Map
from app.schemas.map import PassageSchema as PlayerPassageSchema
from app.schemas.map import PlayerMapSchema, PlayerRoomSchema, RoomAccess
from app.schemas.maps import *
from app.models.room import Room

from app.models.inventory_item import InventoryItem
from app.models.passage import Passage
from app.models.sensor import Sensor
from app.models.qr_code import QrCode
from app.models.position import Position
from app.models.room_item_claim import RoomItemClaim

class IMapsService(ABC):
    @abstractmethod
    def get_room(self, game_id: str, room_id: int, user_id: str) -> RoomSchema: ...

    @abstractmethod
    def get_inventory_items(self, game_id: str, user_id: str) -> list[InventoryItemSchema]: ...

    @abstractmethod
    def update_room(self, game_id: str, room_id: int, user_id: str, dto: RoomSchema)-> RoomSchema: ...

    @abstractmethod
    def get_player_map(self, game_id: str, user_id: str) -> PlayerMapSchema: ...




class MapsService(IMapsService):
    def __init__(self, db_session: Session) -> None:
        self.db_session = db_session

    @staticmethod
    def _map_room(room: Room) -> RoomSchema:
        return RoomSchema(
            id = room.id,
            name = room.name,
            description = room.description,
            hidden = room.hidden,
            zone = room.zone,
            position = PositionSchema(
                x = room.position.x,
                y = room.position.y
            ),
            width = room.width,
            height = room.height,
            passages = map(
                MapsService._map_passages,
                room.passages,
            ),
            items = map(MapsService._map_inventory_item, map(lambda l: l.item, room.items_claimed)),
            sensors = map(
                MapsService._map_sensor,
                room.sensors,
            ),
            qr_codes = map(
                MapsService._map_qr_code,
                room.qr_codes
            )
        )

    @staticmethod
    def _map_passages(p: Passage) -> PassageSchema:
        return PassageSchema(
            id = p.id,
            room1_id = p.room1_id,
            room2_id = p.room1_id,
            position = PositionSchema(
                x = p.position.x,
                y = p.position.y,
            ),
        ), 

    @staticmethod
    def _map2_passage(p: PassageSchema, map_id: str) -> Passage:
        p.model_validate()
        return Passage(
            id = p.id,
            map_id = map_id,
            room1_id = p.room1_id,
            room2_id = p.room2_id,
            position = p.position
            )


    @staticmethod
    def _map_sensor(sensor: Sensor) -> SensorSchema:
        return SensorSchema(
            position = sensor.position
        )

    @staticmethod
    def _map2_sensor(s: SensorSchema, room_id: int) -> Sensor:
        s.model_validate()
        return Sensor(
            position = s.position,
            room_id = room_id
        )


    @staticmethod
    def _map_qr_code(qr_code: QrCode) -> QrCodeSchema:
        return QrCodeSchema(
            position=qr_code.position,
        )

    @staticmethod
    def _map2_qr_code(q: QrCodeSchema, room_id: int) -> QrCode:
        q.model_validate()
        return QrCode(
            position = q.position,
            content = q.content,
            room_id = room_id
        )


    @staticmethod
    def _map_inventory_item(inventory_item: InventoryItem) -> InventoryItemSchema:

        return InventoryItemSchema(
            item_id = inventory_item.item_id,
            name = inventory_item.name
        )


    def _ensure_edit_rights(self, user_id: str, game_id: str):
        game = self.db_session.get(Game, game_id)
        if game is None or game.author_id != user_id:
            raise NotFoundError("Chamber not found, or user has no access")

                

    def _ensure_viewing_rights(self, user_id: str, game_id: str):
        return
        

    def get_room(self, game_id, room_id, user_id):
        self._ensure_viewing_rights(user_id, game_id)
        room = self.db_session.get(Room, room_id)
        if room is None:
            raise NotFoundError(f"Chamber not found")
        return self._map_room(room)


    def get_inventory_items(self, game_id, user_id):
        self._ensure_edit_rights(user_id, game_id)

        game = self.db_session.get(Game, game_id)

        return map(MapsService._map_inventory_item, game.inventory_items)
        

    def _update_items(self, room: Room, new_amounts: dict[str, int]):

        if room is None:
            raise NotFoundError("Room not found")

        room.items_claimed = [
            RoomItemClaim(room = room, item_id = item[0], amount=item[1]) for item in new_amounts.items()
        ]


        for item_claimed in room.items_claimed:
            if item_claimed.item is None or item_claimed.item.game_id != room.id:
                raise NotFoundError("No such item exists or it's not assigned to this game")
            available_amount = item_claimed.item.available
            all_claims = item_claimed.item.claims

            reserved_amount = sum(map(lambda l: l.amount, all_claims))
            if reserved_amount > available_amount:
                raise UnprocessableContentError("There are not enough items in game's inventory")



    def _change_id(self, previous_id, new_id):
        pass

    def _update_passages(self, room: Room, passages: list[PassageSchema]):
        # Check if both rooms belong to the same game
        # QUESTION: Can a passage be between maps? 

        for passage in passages:
            passage.model_validate()
            room1_id = passage.room1_id
            room2_id = passage.room2_id

            room1 = self.db_session.get(Room, room1_id)
            room2 = self.db_session.get(Room, room2_id)

            if None in [room1, room2]:
                raise NotFoundError("One or more rooms not found for passage")

            if room1.map_id != room2.map_id:
                raise ValidationError("A passage needs to be between rooms on the same map") #TODO: Pick a better error

            if room.id not in [room1.id, room2.id]:
                raise ValidationError("The passage needs to include this room")

        room.exit_passages = []
        room.entry_passages = []

        for passage in passages:
            p = MapsService._map2_passage(passage, room.map_id)

            if p.to_room.id == room.id:
                room.entry_passages.append(p)
            elif p.from_room.id == room.id:
                room.exit_passages.append(p)






        

    def update_room(self, game_id, room_id, user_id, dto : RoomSchema):
        RoomSchema.model_validate(dto)
        self._ensure_edit_rights(user_id, game_id)

        room = self.db_session.get(Room, room_id)

        if room is None:
            raise NotFoundError("Room not found")


        requested_items = dto.items


        self._update_items(room, {item_id: amount for (item_id, amount) in requested_items})
        self._update_passages(room, dto.passages)

        # FIXME: Zmiana id pokoju może powodować problemy z powiązaniami w bazie danych, dlatego na razie jest ignorowana
        # room.id = dto.id
        room.name = dto.name
        room.description = dto.description
        room.hidden = dto.hidden
        room.zone = dto.zone
        room.position = Position(
            x = dto.position.x,
            y = dto.position.y
        )
        room.width = dto.width
        room.height = dto.height

        room.sensors = map(lambda s: MapsService._map2_sensor(s, room.id), dto.sensors)
        room.qr_codes = map(lambda q: MapsService._map2_qr_code(q, room.id), dto.qr_codes)

        self.db_session.commit()

        return self._map_room(room)

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
        visible_passages: list[PlayerPassageSchema] = []
        for passage in game_map.passages:
            if passage.room1_id in visible_room_ids and passage.room2_id in visible_room_ids:
                visible_passages.append(PlayerPassageSchema(
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
