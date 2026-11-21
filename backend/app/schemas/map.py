from pydantic import BaseModel

from app.schemas.passage import PassageSchema
from app.schemas.room import RoomSchema

class MapSchema(BaseModel):
    id: int
    name: str
    game_id: str
    description: str
    rooms: list[RoomSchema]
    passages: list[PassageSchema]