from pydantic import BaseModel

from app.schemas.item import InventoryItemSchema
from app.schemas.position import PositionSchema
from app.schemas.qr_code import QRCodeSchema
from app.schemas.sensor import SensorSchema

class RoomSchema(BaseModel):
    id: int
    name: str
    width: int
    height: int
    position: PositionSchema
    description: str
    hidden: bool
    zone: str
    items: list[InventoryItemSchema]
    sensors: list[SensorSchema]
    qrCodes: list[QRCodeSchema]