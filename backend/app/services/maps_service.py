from abc import ABC, abstractmethod

from sqlalchemy import update
from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError, UnprocessableContentError
from app.models.game import Game
from app.schemas.maps import *
from app.models.room import Room
from app.models.inventory_item import InventoryItem
from app.models.position import Position

class IMapsService(ABC):
    @abstractmethod
    def get_room(self, game_id: str, room_id: str, user_id: str) -> RoomSchema: ...

    @abstractmethod
    def get_inventory_items(self, game_id: str, user_id: str) -> list[InventoryItemSchema]: ...

    @abstractmethod
    def update_room(self, game_id: str, room_id: str, user_id: str, dto: RoomSchema)-> RoomSchema: ...




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
                lambda p: PassageSchema(
                    id = p.id,
                    room1_id = p.room1_id,
                    room2_id = p.room1_id,
                    position = PositionSchema(
                        x = p.position.x,
                        y = p.position.y,
                    ),
                ), 
                room.exit_passages + room.entry_passages,
            ),
            items = map(MapsService._map_inventory_item, room.map.game.inventory_items),
            sensors = room.sensors,
            qr_codes = room.qr_codes,
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
            raise NotFoundError("Nie znaleziono gry, lub użytkownik nie posiada uprawnień do jej edycji")

                

    def _ensure_viewing_rights(self, user_id: str, game_id: str):
        return
        

    def get_room(self, game_id, room_id, user_id):
        self._ensure_viewing_rights(user_id, game_id)
        room = self.db_session.get(Room, room_id)
        if room is None:
            raise NotFoundError(f"Nie znaleziono pokoju")
        return self._map_room(room)


    def get_inventory_items(self, game_id, user_id):
        self._ensure_edit_rights(user_id, game_id)

        game = self.db_session.get(Game, game_id)

        return map(MapsService._map_inventory_item, game.inventory_items)



    def _take_item(self, item_id: str, amount: int):
        session = self.db_session
        game = session.get(InventoryItem, item_id)

        pre_update = game.available
        session.execute(
            update(InventoryItem)
            .values(available = InventoryItem.available - amount)
            .where(InventoryItem.item_id == item_id, amount >= InventoryItem.available)
        )

        taken_amount = game.available - pre_update

        if taken_amount == 0:
            raise UnprocessableContentError("There are not enough items")


    def _update_items(self, game_id: str, new_amounts: dict[str, int]):
        g = self.db_session.get(Game, game_id)
        
        items = g.inventory_items

        current_ammounts = dict[str, int]()
        for item in items:
            current_ammounts[item.item_id] = item.available

        with self.db_session.begin():
            for item_id, new_amount in new_amounts.items():
                current_amount = current_ammounts.get(item_id)
                if current_amount is None:
                    raise NotFoundError(f"Item with id {item_id} not found")
                if new_amount < 0:
                    raise UnprocessableContentError(f"Amount cannot be negative")
                if new_amount > current_amount:
                    self._take_item(item_id, new_amount - current_amount)
                elif new_amount < current_amount:
                    self.db_session.execute(
                        update(InventoryItem)
                        .values(available = InventoryItem.available + (current_amount - new_amount))
                        .where(InventoryItem.item_id == item_id)
                    )

        self._take_item(item_id)

    def _change_id(self, previous_id, new_id):
        pass

    def _change_passages(self, room_id, passages):
        pass


        

    def update_room(self, game_id, room_id, user_id, dto : RoomSchema):
        RoomSchema.model_validate(dto)
        self._ensure_edit_rights(user_id, game_id)

        room = self.db_session.get(Room, room_id)


        requested_items = dto.items
        for requested_item in requested_items:
            self._update_items(game_id, requested_item.item_id, requested_item.amount)

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

        self.db_session.commit()

        return self._map_room(room)






