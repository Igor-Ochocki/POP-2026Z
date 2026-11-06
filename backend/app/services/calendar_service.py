"""Calendar domain service for the calendar view (PU1).

Errors raised by the service are translated to HTTP responses by
handlers registered in app.main (404 not found, 409 conflict).
"""

from abc import ABC, abstractmethod

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.time_slot import TimeSlot
from app.schemas.time_slot import TimeSlotSchema


class SlotNotFoundError(Exception):
    """Requested time slot does not exist."""


class SlotUnavailableError(Exception):
    """Requested time slot is already reserved."""


class ICalendarService(ABC):
    @abstractmethod
    def query_available_slots(self) -> list[TimeSlotSchema]:
        """All calendar slots (both free and taken) for the calendar view."""


class CalendarService(ICalendarService):
    def __init__(self, db_session: Session) -> None:
        self.db_session = db_session

    def query_available_slots(self) -> list[TimeSlotSchema]:
        query = select(TimeSlot).order_by(TimeSlot.start_time)
        return [self._slot_schema(slot) for slot in self.db_session.scalars(query)]

    @staticmethod
    def _slot_schema(slot: TimeSlot) -> TimeSlotSchema:
        return TimeSlotSchema(
            slot_id=slot.id,
            game_id=slot.game_id,
            title=slot.title,
            start_time=slot.start_time,
            location=slot.location,
            is_available=slot.is_available,
            base_price=slot.base_price,
        )
