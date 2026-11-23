from pydantic import BaseModel

from app.schemas.actions import ActionSchema
from app.schemas.position import PositionSchema

class SensorSchema(BaseModel):
    id: str
    # Czujnik postawiony w PU59 ma tylko położenie - definicję (PU50) dostaje później.
    name: str | None = None
    type: str | None = None
    action: ActionSchema | None = None
    description: str | None = None
    position: PositionSchema
    