from abc import ABC, abstractmethod
from datetime import date, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.time_slot import TimeSlot
from app.schemas.calendar import CalendarEventSchema


class ICalendarService(ABC):
    @abstractmethod
    def get_events(self, month: date) -> list[CalendarEventSchema]:
        """Wszystkie terminy (wolne i zajęte) z miesiąca, w którym leży `month`."""


class CalendarService(ICalendarService):
    def __init__(self, db_session: Session) -> None:
        self.db_session = db_session

    def get_events(self, month: date) -> list[CalendarEventSchema]:
        month_start, next_month_start = self._month_range(month)
        query = (
            select(TimeSlot)
            .options(joinedload(TimeSlot.game))
            .where(TimeSlot.start_time >= month_start, TimeSlot.start_time < next_month_start)
            .order_by(TimeSlot.start_time)
        )
        return [self._to_event(slot) for slot in self.db_session.scalars(query)]

    @staticmethod
    def _month_range(month: date) -> tuple[datetime, datetime]:
        start = datetime(month.year, month.month, 1)
        if month.month == 12:
            return start, datetime(month.year + 1, 1, 1)
        return start, datetime(month.year, month.month + 1, 1)

    @staticmethod
    def _to_event(slot: TimeSlot) -> CalendarEventSchema:
        return CalendarEventSchema(id=slot.id, title=slot.game.title, datetime=slot.start_time)
