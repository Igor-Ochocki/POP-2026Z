from abc import ABC, abstractmethod
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.reservation import ReservationCreateSchema, ReservationSummarySchema
from app.services.message_service import MessageService
from app.services.payment_service import PaymentService
from app.services.reservations_service import IReservationsService, ReservationsService


class IReservationsApi(ABC):
    @abstractmethod
    def create_reservation(self, user_id: str, dto: ReservationCreateSchema) -> ReservationSummarySchema: ...

    @abstractmethod
    def cancel_reservation(self, user_id: str, reservation_id: str) -> bool: ...

    @abstractmethod
    def mark_payment_completed(self, user_id: str, reservation_id: str) -> ReservationSummarySchema: ...


router = APIRouter(prefix="/reservations", tags=["reservations"])


def get_reservations_service(db: Annotated[Session, Depends(get_db)]) -> IReservationsService:
    return ReservationsService(db, PaymentService(db), MessageService(db))


@router.post("", response_model=ReservationSummarySchema, status_code=201)
def create_reservation(
    dto: ReservationCreateSchema,
    user_id: str,
    service: Annotated[IReservationsService, Depends(get_reservations_service)],
) -> ReservationSummarySchema:
    return service.create_reservation(user_id, dto)


@router.delete("/{reservation_id}", response_model=bool)
def cancel_reservation(
    reservation_id: str,
    user_id: str,
    service: Annotated[IReservationsService, Depends(get_reservations_service)],
) -> bool:
    return service.cancel_reservation(user_id, reservation_id)


@router.post("/{reservation_id}/payment", response_model=ReservationSummarySchema)
def mark_payment_completed(
    reservation_id: str,
    user_id: str,
    service: Annotated[IReservationsService, Depends(get_reservations_service)],
) -> ReservationSummarySchema:
    return service.mark_payment_completed(user_id, reservation_id)
