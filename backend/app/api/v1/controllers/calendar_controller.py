from abc import ABC, abstractmethod
from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.calendar import CalendarEventSchema
from app.services.calendar_service import CalendarService, ICalendarService


class CalendarApi(ABC):
    @abstractmethod
    def get_events(self, month: date) -> list[CalendarEventSchema]: ...


router = APIRouter(prefix="/calendar", tags=["calendar"])


def get_calendar_service(db: Annotated[Session, Depends(get_db)]) -> ICalendarService:
    return CalendarService(db)


@router.get("/events", response_model=list[CalendarEventSchema])
def get_events(
    month: Annotated[date, Query(description="Dowolny dzień wybranego miesiąca, np. 2026-11-01")],
    service: Annotated[ICalendarService, Depends(get_calendar_service)],
) -> list[CalendarEventSchema]:
    return service.get_events(month)
