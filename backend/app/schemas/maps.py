from pydantic import BaseModel, Field

class PositionSchema(BaseModel):
    x: float = Field()
    y: float = Field()

class PassageSchema(BaseModel):
    id: int
    room1_id: str = Field()
    rooo2_id: str = Field()
    position: PositionSchema = Field()

class RoomSchema(BaseModel):
    position: PositionSchema = Field()

class SensorSchema(BaseModel):
    position: PositionSchema = Field()

class QrCodeSchema(BaseModel):
    position: PositionSchema = Field()

class InventoryItemSchema(BaseModel):
    item_id: str = Field()
    name: str

class RoomSchema(BaseModel):
    id: str = Field()
    name: str = Field(max_length=100)
    description: str = Field()
    hidden: bool = Field()
    zone: str = Field()
    position: PositionSchema = Field()
    width: float = Field(gt=0)
    height: float = Field(gt=0)
    passages: list[PassageSchema] = Field()
    items: list[InventoryItemSchema] = Field()
    sensors: list[SensorSchema] = Field()
    qr_codes: list[QrCodeSchema] = Field()