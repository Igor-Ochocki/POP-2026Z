from pydantic import BaseModel

class PassageSchema(BaseModel):
    id: int
    room1Id: int
    room2Id: int