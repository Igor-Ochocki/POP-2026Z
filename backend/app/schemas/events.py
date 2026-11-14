from pydantic import BaseModel

class EventSchema(BaseModel):
    reserv_id: str
    users_registered: int
    participants: list[str]
    slot_id: str
    game_id: str
    participant_count: int
    event_status: str
