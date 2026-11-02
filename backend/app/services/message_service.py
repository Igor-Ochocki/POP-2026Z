"""Message inbox services (PU2).

The confirmation of a paid reservation is placed in the organizer's
inbox. Reading the inbox belongs to a separate use case and exposes no
API here - MessageService only stores new messages.
"""

from abc import ABC, abstractmethod
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.message import Message
from app.models.reservation import Reservation
from app.models.time_slot import TimeSlot


class IMessageService(ABC):
    @abstractmethod
    def send_reservation_confirmation(self, organizer_id: str, reservation_id: str) -> bool:
        """Put a reservation confirmation message into the organizer's inbox."""


class MessageService(IMessageService):
    def __init__(self, db_session: Session) -> None:
        self.db_session = db_session

    def send_reservation_confirmation(self, organizer_id: str, reservation_id: str) -> bool:
        reservation = self.db_session.get(Reservation, reservation_id)
        if reservation is None:
            return False

        slot = self.db_session.get(TimeSlot, reservation.slot_id)
        message = Message(
            recipient_id=organizer_id,
            reservation_id=reservation_id,
            content=(
                f"Rezerwacja gry '{slot.title}' na "
                f"{slot.start_time:%Y-%m-%d %H:%M} została potwierdzona. "
                f"Kwota: {reservation.total_cost:.2f} PLN."
            ),
            created_at=datetime.now(UTC),
        )
        self.db_session.add(message)
        return True
