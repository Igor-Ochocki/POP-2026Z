from pydantic import BaseModel

class PositionSchema(BaseModel):
    x: float
    y: float