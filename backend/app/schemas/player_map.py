from enum import StrEnum

from pydantic import BaseModel

from app.schemas.maps import PositionSchema


class RoomAccess(StrEnum):
    ACCESSIBLE = "accessible"
    OUTLINE = "outline"


class PlayerRoomSchema(BaseModel):
    room_id: int
    access: RoomAccess
    position: PositionSchema
    width: float
    height: float
    name: str | None = None
    description: str | None = None


class PassageSchema(BaseModel):
    passage_id: int
    room1_id: int
    room2_id: int


class PlayerMapSchema(BaseModel):
    map_id: str
    game_id: str
    name: str
    character_id: str
    rooms: list[PlayerRoomSchema]
    passages: list[PassageSchema]
