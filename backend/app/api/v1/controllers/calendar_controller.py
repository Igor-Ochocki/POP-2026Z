"""Calendar REST API (PU1) under /api/v1/reservations.

The reservation use case (PU2) extends this controller - see
feature/2-backend-rezerwacja-czasu-dla-gry.
"""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.time_slot import TimeSlotSchema
from app.services.calendar_service import CalendarService, ICalendarService

router = APIRouter(prefix="/reservations", tags=["reservations"])


def get_calendar_service(db: Annotated[Session, Depends(get_db)]) -> ICalendarService:
    return CalendarService(db)


@router.get("/slots", response_model=list[TimeSlotSchema])
def query_available_slots(
    service: Annotated[ICalendarService, Depends(get_calendar_service)],
) -> list[TimeSlotSchema]:
    return service.query_available_slots()
