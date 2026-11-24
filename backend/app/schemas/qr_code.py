from pydantic import BaseModel

from app.schemas.position import PositionSchema

class QRCodeSchema(BaseModel):
    id: str
    position: PositionSchema