from abc import ABC, abstractmethod
from pydantic import ValidationError
from sqlalchemy import update
from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError, UnprocessableContentError, ForbiddenError
from app.models.game import Game
from app.schemas.maps import *
from app.models.room import Room

from app.models.inventory_item import InventoryItem
from app.models.passage import Passage
from app.models.sensor import Sensor
from app.models.qr_code import QrCode
from app.models.position import Position
from app.models.room_item_claim import RoomItemClaim
from fastapi.logger import logger


class IMapsService(ABC):
    @abstractmethod
    def get_room(self, game_id: str, room_id: int, user_id: str) -> RoomSchema: ...

    @abstractmethod
    def get_inventory_items(self, game_id: str, user_id: str) -> list[InventoryItemSchema]: ...

    @abstractmethod
    def update_room(self, game_id: str, room_id: int, user_id: str, dto: RoomSchema)-> RoomSchema: ...


def _chamber_not_found():
    raise NotFoundError("Chamber not found.")

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
            room2_id = p.room2_id,
            position = PositionSchema(
                x = p.position.x,
                y = p.position.y,
            ),
        )

    @staticmethod
    def _map2_passage(p: PassageSchema, map_id: str) -> Passage:
        return Passage(
            id = p.id,
            map_id = map_id,
            room1_id = p.room1_id,
            room2_id = p.room2_id,
            position = Position(
                x = p.position.x,
                y = p.position.y
            )
        )


    @staticmethod
    def _map_sensor(sensor: Sensor) -> SensorSchema:
        return SensorSchema(
            position = PositionSchema(
                x = sensor.position.x,
                y = sensor.position.y
            )
        )

    @staticmethod
    def _map2_sensor(s: SensorSchema, room_id: int) -> Sensor:
        return Sensor(
            position = s.position,
            room_id = room_id
        )


    @staticmethod
    def _map_qr_code(qr_code: QrCode) -> QrCodeSchema:
        return QrCodeSchema(
            position=PositionSchema(
                x = qr_code.position.x,
                y = qr_code.position.y
            ),
        )

    @staticmethod
    def _map2_qr_code(q: QrCodeSchema, room_id: int) -> QrCode:
        return QrCode(
            position = q.position,
            content = "https://www.youtube.com/watch?v=xvFZjo5PgG0",
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
            raise NotFoundError("Game not found, or user has no access")

                

    def _ensure_viewing_rights(self, user_id: str, game_id: str):
        game = self.db_session.get(Game, game_id)
        if game is None:
            raise NotFoundError("Game not found, or user has no access")        

    def get_room(self, game_id, room_id, user_id):
        self._ensure_viewing_rights(user_id, game_id)
        room = self.db_session.get(Room, room_id)
        if room is None:
            logger.debug(f"The room with id [{room_id}] doesn't exist")
            _chamber_not_found()
        elif room.map.game_id != game_id:
            logger.debug(f"The room doesn't belong to the specified game. room.map.game_id: [{room.map.game_id}], game_id: [{game_id}]")
            _chamber_not_found()

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
            room1_id = passage.room1_id
            room2_id = passage.room2_id

            room1 = self.db_session.get(Room, room1_id)
            room2 = self.db_session.get(Room, room2_id)

            if None in [room1, room2]:
                raise NotFoundError("One or more rooms not found for passage")

            if room1.map_id != room2.map_id:
                raise ForbiddenError("A passage needs to be between rooms on the same map") #TODO: Pick a better error

            if room.id not in [room1.id, room2.id]:
                raise ForbiddenError("The passage needs to include this room")

        room.exit_passages = []
        room.entry_passages = []

        for passage in passages:

            if self.db_session.get(Passage, passage.id) is not None:
                raise ConflictError("Using this id would overwrite an existing relationship between other rooms.")
            p = MapsService._map2_passage(passage, room.map_id)


            if p.room2_id == room.id:
                room.entry_passages.append(p)
            elif p.room1_id == room.id:
                room.exit_passages.append(p)






        

    def update_room(self, game_id, room_id, user_id, dto : RoomSchema):
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

        room.sensors = list(map(lambda s: MapsService._map2_sensor(s, room.id), dto.sensors))
        room.qr_codes = list(map(lambda q: MapsService._map2_qr_code(q, room.id), dto.qr_codes))

        self.db_session.commit()

        return self._map_room(room)






