from enum import StrEnum
from pydantic import BaseModel


class RoomAccess(StrEnum):
    ACCESSIBLE = "accessible"
    OUTLINE = "outline"


class PositionSchema(BaseModel):
    x: float
    y: float


class PlayerRoomSchema(BaseModel):
    room_id: str
    access: RoomAccess
    position: PositionSchema
    width: float
    height: float
    name: str | None = None
    description: str | None = None


class PassageSchema(BaseModel):
    passage_id: str
    room1_id: str
    room2_id: str


class PlayerMapSchema(BaseModel):
    map_id: str
    game_id: str
    name: str
    character_id: str
    rooms: list[PlayerRoomSchema]
    passages: list[PassageSchema]
