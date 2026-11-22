from abc import ABC, abstractmethod
from collections.abc import Mapping

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.database import Base
from app.core.exceptions import ConflictError, NotFoundError
from app.models.actions import Action
from app.models.game import Game, GameStatus
from app.models.item import InventoryItem
from app.models.map import Map
from app.models.passage import Passage
from app.models.qr_code import QRCode
from app.models.room import Room
from app.models.sensor import Sensor
from app.schemas.actions import ActionSchema
from app.schemas.game import GameCreateSchema, GameResponseSchema
from app.schemas.item import InventoryItemSchema
from app.schemas.map import MapContainerSchema, MapSchema
from app.schemas.passage import PassageSchema
from app.schemas.position import PositionSchema
from app.schemas.qr_code import QRCodeSchema
from app.schemas.room import RoomSchema
from app.schemas.sensor import SensorSchema


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

    @abstractmethod
    def get_map(self, game_id: str, user_id: str) -> MapSchema: ...

    @abstractmethod
    def edit_map(self, game_id: str, user_id: str, data: MapSchema) -> MapSchema: ...

    @abstractmethod
    def get_sensor_types(self) -> list[str]: ...

    @abstractmethod
    def add_sensor(self, game_id: str, user_id: str, room_id: int, data: SensorSchema) -> SensorSchema: ...


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

    @staticmethod
    def _ensure_unique_ids(ids: list[str | int], entity_name: str) -> None:
        if len(ids) != len(set(ids)):
            raise ConflictError(f"Duplicate {entity_name} ids in map data")

    def _ensure_ids_available(
        self,
        model: type[Base],
        ids: list[str | int],
        existing: Mapping[str | int, object],
        entity_name: str,
    ) -> None:
        for entity_id in ids:
            if entity_id not in existing and self.db_session.get(model, entity_id) is not None:
                raise ConflictError(f"{entity_name} id '{entity_id}' is already in use")

    @staticmethod
    def _sensor_to_schema(sensor: Sensor) -> SensorSchema:
        return SensorSchema(
            id=sensor.id,
            name=sensor.name,
            type=sensor.type,
            action=ActionSchema.model_validate(sensor.action, from_attributes=True),
            description=sensor.description,
            position=PositionSchema.model_validate(sensor.position),
        )

    @staticmethod
    def _map_to_schema(map_model: Map) -> MapSchema:
        return MapSchema(
            id=map_model.id,
            name=map_model.name,
            game_id=map_model.game_id,
            description=map_model.description,
            is_valid=map_model.is_valid,
            container=MapContainerSchema.model_validate(map_model.container),
            rooms=[
                RoomSchema(
                    id=room.id,
                    name=room.name,
                    width=room.width,
                    height=room.height,
                    position=PositionSchema.model_validate(room.position),
                    description=room.description,
                    hidden=room.hidden,
                    zone=room.zone,
                    items=[
                        InventoryItemSchema(
                            id=item.id,
                            name=item.name,
                            total=item.total,
                            available=item.available,
                        )
                        for item in room.items
                    ],
                    sensors=[GamesService._sensor_to_schema(sensor) for sensor in room.sensors],
                    qrCodes=[
                        QRCodeSchema(
                            id=qr_code.id,
                            position=PositionSchema.model_validate(qr_code.position),
                        )
                        for qr_code in room.qr_codes
                    ],
                )
                for room in map_model.rooms
            ],
            passages=[
                PassageSchema(
                    id=passage.id,
                    room1_id=passage.room1_id,
                    room2_id=passage.room2_id,
                    position=PositionSchema.model_validate(passage.position),
                )
                for passage in map_model.passages
            ],
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

    def get_map(self, game_id: str, user_id: str) -> MapSchema:
        game = self.db_session.get(Game, game_id)
        if game is None or game.author_id != user_id:
            raise NotFoundError(f"Game '{game_id}' not found")
        map_model = self.db_session.scalar(select(Map).where(Map.game_id == game_id))
        if map_model is None:
            raise NotFoundError(f"Map for game '{game_id}' not found")
        return self._map_to_schema(map_model)

    def edit_map(self, game_id: str, user_id: str, data: MapSchema) -> MapSchema:
        game = self.db_session.get(Game, game_id)
        if game is None or game.author_id != user_id:
            raise NotFoundError(f"Game '{game_id}' not found")
        if data.game_id != game_id:
            raise ConflictError("Map game_id does not match the requested game")

        map_model = self.db_session.scalar(select(Map).where(Map.game_id == game_id))
        if map_model is not None and map_model.id != data.id:
            raise ConflictError("Map id does not match the stored map")
        if map_model is None:
            map_with_id = self.db_session.get(Map, data.id)
            if map_with_id is not None and map_with_id.game_id != game_id:
                raise ConflictError(f"Map id '{data.id}' belongs to another game")
            map_model = map_with_id or Map(id=data.id, game_id=game_id)
            is_new_map = map_with_id is None
        else:
            is_new_map = False

        current_rooms = {room.id: room for room in map_model.rooms}
        current_passages = {passage.id: passage for passage in map_model.passages}
        current_items = {
            item.id: item for room in current_rooms.values() for item in room.items
        }
        current_sensors = {
            sensor.id: sensor for room in current_rooms.values() for sensor in room.sensors
        }
        current_qr_codes = {
            qr_code.id: qr_code for room in current_rooms.values() for qr_code in room.qr_codes
        }

        room_ids = [room.id for room in data.rooms]
        self._ensure_unique_ids(room_ids, "room")
        passage_ids = [passage.id for passage in data.passages]
        self._ensure_unique_ids(passage_ids, "passage")
        item_ids = [item.id for room in data.rooms for item in room.items]
        self._ensure_unique_ids(item_ids, "inventory item")
        sensor_ids = [sensor.id for room in data.rooms for sensor in room.sensors]
        self._ensure_unique_ids(sensor_ids, "sensor")
        qr_code_ids = [qr_code.id for room in data.rooms for qr_code in room.qrCodes]
        self._ensure_unique_ids(qr_code_ids, "QR code")

        self._ensure_ids_available(Room, room_ids, current_rooms, "Room")
        self._ensure_ids_available(Passage, passage_ids, current_passages, "Passage")
        self._ensure_ids_available(InventoryItem, item_ids, current_items, "Inventory item")
        self._ensure_ids_available(Sensor, sensor_ids, current_sensors, "Sensor")
        self._ensure_ids_available(QRCode, qr_code_ids, current_qr_codes, "QR code")

        room_id_set = set(room_ids)
        for passage in data.passages:
            if passage.room1_id not in room_id_set or passage.room2_id not in room_id_set:
                raise ConflictError(f"Passage '{passage.id}' must connect rooms in this map")

        action_records: dict[str, Action] = {}
        for sensor_data in (sensor for room in data.rooms for sensor in room.sensors):
            action_data = sensor_data.action
            action = self.db_session.get(Action, action_data.action_id)
            if action is None or action.game_id != game_id:
                raise NotFoundError(f"Action '{action_data.action_id}' not found for this game")
            if action_data.game_id != game_id:
                raise ConflictError(f"Action '{action_data.action_id}' belongs to another game")
            action_records[action.action_id] = action

        map_model.name = data.name
        map_model.description = data.description
        map_model.game_id = game_id
        map_model.is_valid = data.is_valid
        map_model.container = data.container.model_dump()

        updated_rooms: list[Room] = []
        for room_data in data.rooms:
            room = current_rooms.get(room_data.id) or Room(id=room_data.id)
            room.name = room_data.name
            room.width = room_data.width
            room.height = room_data.height
            room.position = room_data.position.model_dump()
            room.description = room_data.description
            room.hidden = room_data.hidden
            room.zone = room_data.zone

            room.items = []
            for item_data in room_data.items:
                item = current_items.get(item_data.id) or InventoryItem(id=item_data.id)
                item.name = item_data.name
                item.total = item_data.total
                item.available = item_data.available
                room.items.append(item)

            room.sensors = []
            for sensor_data in room_data.sensors:
                sensor = current_sensors.get(sensor_data.id) or Sensor(id=sensor_data.id)
                sensor.name = sensor_data.name
                sensor.type = sensor_data.type
                sensor.action_id = action_records[sensor_data.action.action_id].action_id
                sensor.description = sensor_data.description
                sensor.position = sensor_data.position.model_dump()
                room.sensors.append(sensor)

            room.qr_codes = []
            for qr_code_data in room_data.qrCodes:
                qr_code = current_qr_codes.get(qr_code_data.id) or QRCode(id=qr_code_data.id)
                qr_code.position = qr_code_data.position.model_dump()
                room.qr_codes.append(qr_code)

            updated_rooms.append(room)
        map_model.rooms = updated_rooms

        updated_passages: list[Passage] = []
        for passage_data in data.passages:
            passage = current_passages.get(passage_data.id) or Passage(id=passage_data.id)
            passage.room1_id = passage_data.room1_id
            passage.room2_id = passage_data.room2_id
            passage.position = passage_data.position.model_dump()
            updated_passages.append(passage)
        map_model.passages = updated_passages

        if is_new_map:
            self.db_session.add(map_model)
        self.db_session.commit()
        return self._map_to_schema(map_model)

    def get_sensor_types(self) -> list[str]:
        # I have honestly no idea what these types should even be
        return ["type 1", "type 2", "type 3"]

    def add_sensor(self, game_id: str, user_id: str, room_id: int, data: SensorSchema) -> SensorSchema:
        game = self.db_session.get(Game, game_id)
        if game is None or game.author_id != user_id:
            raise NotFoundError(f"Game '{game_id}' not found")

        room = self.db_session.get(Room, room_id)
        if room is None:
            raise NotFoundError(f"Room '{room_id}' not found")
        room_map = self.db_session.get(Map, room.map_id)
        if room_map is None or room_map.game_id != game_id:
            raise NotFoundError(f"Room '{room_id}' not found for game '{game_id}'")

        action_data = data.action
        action = self.db_session.get(Action, action_data.action_id)
        if action is None or action.game_id != game_id:
            raise NotFoundError(f"Action '{action_data.action_id}' not found for this game")
        if action_data.game_id != game_id:
            raise ConflictError(f"Action '{action_data.action_id}' belongs to another game")

        if self.db_session.get(Sensor, data.id) is not None:
            raise ConflictError(f"Sensor '{data.id}' already exists")

        sensor = Sensor(
            id=data.id,
            name=data.name,
            type=data.type,
            action_id=action.action_id,
            description=data.description,
            position=data.position.model_dump(),
            room_id=room_id,
        )
        self.db_session.add(sensor)
        self.db_session.commit()
        self.db_session.refresh(sensor)

        return self._sensor_to_schema(sensor)
