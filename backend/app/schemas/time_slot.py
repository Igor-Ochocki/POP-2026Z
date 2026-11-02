from datetime import datetime

from pydantic import BaseModel, ConfigDict


class TimeSlotSchema(BaseModel):
    """Slot kalendarza (PU1) - mapowany 1:1 na CalendarEventDTO frontendu."""

    slot_id: str
    game_id: str
    title: str
    start_time: datetime
    location: str
    is_available: bool
    base_price: float

    model_config = ConfigDict(from_attributes=True)
