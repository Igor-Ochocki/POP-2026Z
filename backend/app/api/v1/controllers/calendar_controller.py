"""Calendar domain REST API (PU1 + PU2) under /api/v1/reservations.

user_id is a placeholder for the authenticated session (JWT) - a
separate use case will introduce authentication; iteration 1 accepts
it as an optional query parameter.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.reservation import ReservationCreateSchema, ReservationSummarySchema
from app.schemas.time_slot import TimeSlotSchema
from app.services.calendar_service import CalendarService, ICalendarService
from app.services.message_service import IMessageService, MessageService
from app.services.payment_service import IPaymentService, PaymentService

router = APIRouter(prefix="/reservations", tags=["reservations"])


def get_payment_service(db: Annotated[Session, Depends(get_db)]) -> IPaymentService:
    return PaymentService(db)


def get_message_service(db: Annotated[Session, Depends(get_db)]) -> IMessageService:
    return MessageService(db)


def get_calendar_service(
    db: Annotated[Session, Depends(get_db)],
    payment_service: Annotated[IPaymentService, Depends(get_payment_service)],
    message_service: Annotated[IMessageService, Depends(get_message_service)],
) -> ICalendarService:
    return CalendarService(db, payment_service, message_service)


@router.get("/slots", response_model=list[TimeSlotSchema])
def query_available_slots(
    service: Annotated[ICalendarService, Depends(get_calendar_service)],
) -> list[TimeSlotSchema]:
    return service.query_available_slots()


@router.post("", response_model=ReservationSummarySchema, status_code=201)
def create_reservation(
    dto: ReservationCreateSchema,
    service: Annotated[ICalendarService, Depends(get_calendar_service)],
    user_id: Annotated[str, Query(description="Organizer id (placeholder for JWT)")] = "demo-organizer",
) -> ReservationSummarySchema:
    return service.create_reservation(user_id, dto)


@router.delete("/{reservation_id}", response_model=bool)
def cancel_reservation(
    reservation_id: str,
    service: Annotated[ICalendarService, Depends(get_calendar_service)],
    user_id: Annotated[str, Query(description="Organizer id (placeholder for JWT)")] = "demo-organizer",
) -> bool:
    return service.cancel_reservation(user_id, reservation_id)


@router.post("/{reservation_id}/payment", response_model=ReservationSummarySchema)
def mark_payment_completed(
    reservation_id: str,
    service: Annotated[ICalendarService, Depends(get_calendar_service)],
    user_id: Annotated[str, Query(description="Organizer id (placeholder for JWT)")] = "demo-organizer",
) -> ReservationSummarySchema:
    return service.mark_payment_completed(user_id, reservation_id)
