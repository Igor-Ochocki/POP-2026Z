from pydantic import BaseModel, Field

class PositionSchema(BaseModel):
    x: float = Field()
    y: float = Field()

class PassageSchema(BaseModel):
    id: int
    room1_id: str = Field(min_length=36, max_length=36)
    room2_id: str = Field(min_length=36, max_length=36)
    position: PositionSchema = Field()

class SensorSchema(BaseModel):
    position: PositionSchema = Field()

class QrCodeSchema(BaseModel):
    position: PositionSchema = Field()

class InventoryItemSchema(BaseModel):
    item_id: str = Field(min_length=36, max_length=36)
    name: str = Field(max_length=32)

class RoomSchema(BaseModel):
    id: str = Field(min_length=36, max_length=36)
    name: str = Field(max_length=64)
    description: str = Field(max_length=4096)
    hidden: bool = Field()
    zone: str = Field(max_length=64)
    position: PositionSchema = Field()
    width: float = Field(gt=0)
    height: float = Field(gt=0)
    passages: list[PassageSchema] = Field()
    items: list[InventoryItemSchema] = Field()
    sensors: list[SensorSchema] = Field()
    qr_codes: list[QrCodeSchema] = Field()