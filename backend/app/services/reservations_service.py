from abc import ABC, abstractmethod

from sqlalchemy import update
from sqlalchemy.orm import Session

from app.core.exceptions import AppError, ConflictError, ForbiddenError, NotFoundError
from app.models.enums import ReservationStatus
from app.models.reservation import Reservation
from app.models.time_slot import TimeSlot
from app.schemas.reservation import ReservationCreateSchema, ReservationSummarySchema
from app.services.message_service import IMessageService
from app.services.payment_service import IPaymentService


class IReservationsService(ABC):
    @abstractmethod
    def create_reservation(self, user_id: str, dto: ReservationCreateSchema) -> ReservationSummarySchema:
        """Tworzy nieopłaconą rezerwację wolnego terminu i blokuje termin."""

    @abstractmethod
    def cancel_reservation(self, user_id: str, reservation_id: str) -> bool:
        """Cofnięcie nieopłaconej rezerwacji - zwalnia termin."""

    @abstractmethod
    def mark_payment_completed(self, user_id: str, reservation_id: str) -> ReservationSummarySchema:
        """Opłacenie rezerwacji i wysłanie potwierdzenia do skrzynki organizatora."""


class ReservationsService(IReservationsService):
    def __init__(self, db_session: Session, payment_service: IPaymentService, message_service: IMessageService) -> None:
        self.db_session = db_session
        self.payment_service = payment_service
        self.message_service = message_service

    def create_reservation(self, user_id: str, dto: ReservationCreateSchema) -> ReservationSummarySchema:
        slot = self.db_session.get(TimeSlot, dto.slot_id)
        if slot is None:
            raise NotFoundError(f"Termin '{dto.slot_id}' nie istnieje")
        game = slot.game
        if not game.min_players <= dto.participant_count <= game.max_players:
            raise AppError(f"Liczba uczestników musi być w zakresie {game.min_players}-{game.max_players}")

        self._lock_slot(slot.id)
        reservation = Reservation(
            slot_id=slot.id,
            game_id=slot.game_id,
            organizer_id=user_id,
            participant_count=dto.participant_count,
            total_cost=slot.base_price * dto.participant_count,
        )
        self.db_session.add(reservation)
        self.db_session.commit()
        return self._to_summary(reservation)

    def cancel_reservation(self, user_id: str, reservation_id: str) -> bool:
        reservation = self._get_own_reservation(user_id, reservation_id)
        if reservation.status is not ReservationStatus.UNPAID:
            raise ConflictError(f"Rezerwacji '{reservation_id}' nie można już anulować")
        reservation.status = ReservationStatus.CANCELLED
        reservation.slot.is_available = True
        self.db_session.commit()
        return True

    def mark_payment_completed(self, user_id: str, reservation_id: str) -> ReservationSummarySchema:
        reservation = self._get_own_reservation(user_id, reservation_id)
        if reservation.is_paid:
            raise ConflictError(f"Rezerwacja '{reservation_id}' jest już opłacona")
        if reservation.status is not ReservationStatus.UNPAID:
            raise ConflictError(f"Rezerwacja '{reservation_id}' nie czeka na płatność")
        self.payment_service.process_payment(reservation_id, reservation.total_cost)
        reservation.status = ReservationStatus.CONFIRMED
        reservation.is_paid = True
        self.message_service.send_reservation_confirmation(user_id, reservation_id)
        self.db_session.commit()
        return self._to_summary(reservation)

    def _lock_slot(self, slot_id: str) -> None:
        """Atomowo zajmuje termin (UPDATE ... WHERE is_available). Przy dwóch
        równoczesnych żądaniach tylko jedno zmieni wiersz, drugie dostaje 409."""
        result = self.db_session.execute(
            update(TimeSlot)
            .where(TimeSlot.id == slot_id, TimeSlot.is_available.is_(True))
            .values(is_available=False)
            .execution_options(synchronize_session="fetch")
        )
        if result.rowcount != 1:
            self.db_session.rollback()
            raise ConflictError(f"Termin '{slot_id}' jest już zarezerwowany")

    def _get_own_reservation(self, user_id: str, reservation_id: str) -> Reservation:
        reservation = self.db_session.get(Reservation, reservation_id)
        if reservation is None:
            raise NotFoundError(f"Rezerwacja '{reservation_id}' nie istnieje")
        if reservation.organizer_id != user_id:
            raise ForbiddenError(f"Rezerwacja '{reservation_id}' należy do innego organizatora")
        return reservation

    @staticmethod
    def _to_summary(reservation: Reservation) -> ReservationSummarySchema:
        return ReservationSummarySchema(
            reservation_id=reservation.id,
            slot_id=reservation.slot_id,
            game_id=reservation.game_id,
            organizer_id=reservation.organizer_id,
            participant_count=reservation.participant_count,
            total_cost=reservation.total_cost,
            status=reservation.status,
            is_paid=reservation.is_paid,
        )
