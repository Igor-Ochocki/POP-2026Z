from pydantic import BaseModel

from app.schemas.position import PositionSchema

class PassageSchema(BaseModel):
    id: int
    room1_id: int
    room2_id: int
    position: PositionSchema