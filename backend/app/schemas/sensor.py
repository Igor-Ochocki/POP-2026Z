from pydantic import BaseModel

from app.schemas.actions import ActionSchema
from app.schemas.position import PositionSchema

class SensorSchema(BaseModel):
    id: str
    name: str
    type: str
    action: ActionSchema
    description: str
    position: PositionSchema
    