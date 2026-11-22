from pydantic import BaseModel

from app.schemas.passage import PassageSchema
from app.schemas.room import RoomSchema


class MapContainerSchema(BaseModel):
    width: int
    height: int


class MapSchema(BaseModel):
    id: int
    name: str
    game_id: str
    description: str
    is_valid: bool
    container: MapContainerSchema
    rooms: list[RoomSchema]
    passages: list[PassageSchema]