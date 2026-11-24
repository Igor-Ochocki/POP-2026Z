from pydantic import BaseModel

class InventoryItemSchema(BaseModel):
    id: str
    name: str
    total: int
    available: int