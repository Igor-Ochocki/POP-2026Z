"""Calendar domain services - PU1 (calendar view) and PU2 (reservation flow).

Errors raised by services are translated to HTTP responses by handlers
registered in app.main (404 not found, 409 conflict).
"""

from abc import ABC, abstractmethod

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.enums import ReservationStatus
from app.models.reservation import Reservation
from app.models.time_slot import TimeSlot
from app.schemas.reservation import ReservationCreateSchema, ReservationSummarySchema
from app.schemas.time_slot import TimeSlotSchema
from app.services.message_service import IMessageService
from app.services.payment_service import IPaymentService


class SlotNotFoundError(Exception):
    """Requested time slot does not exist."""


class SlotUnavailableError(Exception):
    """Requested time slot is already reserved."""


class ReservationNotFoundError(Exception):
    """Requested reservation does not exist."""


class ReservationNotCancellableError(Exception):
    """Paid or confirmed reservations cannot be cancelled."""


class ReservationAlreadyPaidError(Exception):
    """Reservation already has a completed payment."""


class ICalendarService(ABC):
    @abstractmethod
    def query_available_slots(self) -> list[TimeSlotSchema]:
        """PU1 - all calendar slots (both free and taken)."""

    @abstractmethod
    def create_reservation(
        self, user_id: str, dto: ReservationCreateSchema
    ) -> ReservationSummarySchema:
        """PU2 - start a reservation: create an unpaid reservation on a free slot."""

    @abstractmethod
    def cancel_reservation(self, user_id: str, reservation_id: str) -> bool:
        """PU2 - the undo option: cancel an unpaid reservation and free the slot."""

    @abstractmethod
    def mark_payment_completed(
        self, user_id: str, reservation_id: str
    ) -> ReservationSummarySchema:
        """PU2 - handle the payment and send the confirmation to the inbox."""


class CalendarService(ICalendarService):
    def __init__(
        self,
        db_session: Session,
        payment_service: IPaymentService,
        message_service: IMessageService,
    ) -> None:
        self.db_session = db_session
        self.payment_service = payment_service
        self.message_service = message_service

    def query_available_slots(self) -> list[TimeSlotSchema]:
        query = select(TimeSlot).order_by(TimeSlot.start_time)
        return [self._slot_schema(slot) for slot in self.db_session.scalars(query)]

    def create_reservation(
        self, user_id: str, dto: ReservationCreateSchema
    ) -> ReservationSummarySchema:
        slot = self.db_session.get(TimeSlot, dto.slot_id)
        if slot is None:
            raise SlotNotFoundError(f"Slot '{dto.slot_id}' does not exist")
        if not slot.is_available:
            raise SlotUnavailableError(f"Slot '{dto.slot_id}' is already reserved")

        reservation = Reservation(
            slot_id=slot.id,
            game_id=dto.game_id,
            organizer_id=user_id,
            participant_count=dto.participant_count,
            # Iteration 1 pricing: base price per participant.
            total_cost=slot.base_price * dto.participant_count,
        )
        slot.is_available = False
        self.db_session.add(reservation)
        self.db_session.commit()
        return self._reservation_schema(reservation)

    def cancel_reservation(self, user_id: str, reservation_id: str) -> bool:
        reservation = self._get_reservation(reservation_id)
        if reservation.is_paid or reservation.status is not ReservationStatus.Unpaid:
            raise ReservationNotCancellableError(
                f"Reservation '{reservation_id}' can no longer be cancelled"
            )

        reservation.status = ReservationStatus.Cancelled
        slot = self.db_session.get(TimeSlot, reservation.slot_id)
        if slot is not None:
            slot.is_available = True
        self.db_session.commit()
        return True

    def mark_payment_completed(
        self, user_id: str, reservation_id: str
    ) -> ReservationSummarySchema:
        reservation = self._get_reservation(reservation_id)
        if reservation.is_paid:
            raise ReservationAlreadyPaidError(
                f"Reservation '{reservation_id}' is already paid"
            )
        if reservation.status is not ReservationStatus.Unpaid:
            raise ReservationNotCancellableError(
                f"Reservation '{reservation_id}' is not awaiting payment"
            )

        self.payment_service.process_payment(
            reservation_id, float(reservation.total_cost)
        )
        reservation.status = ReservationStatus.Confirmed
        reservation.is_paid = True
        self.message_service.send_reservation_confirmation(user_id, reservation_id)
        self.db_session.commit()
        return self._reservation_schema(reservation)

    def _get_reservation(self, reservation_id: str) -> Reservation:
        reservation = self.db_session.get(Reservation, reservation_id)
        if reservation is None:
            raise ReservationNotFoundError(
                f"Reservation '{reservation_id}' does not exist"
            )
        return reservation

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

    @staticmethod
    def _reservation_schema(reservation: Reservation) -> ReservationSummarySchema:
        return ReservationSummarySchema(
            reservation_id=reservation.id,
            slot_id=reservation.slot_id,
            game_id=reservation.game_id,
            organizer_id=reservation.organizer_id,
            participant_count=reservation.participant_count,
            total_cost=float(reservation.total_cost),
            status=reservation.status.value,
            is_paid=reservation.is_paid,
        )
