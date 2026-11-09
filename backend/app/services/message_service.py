from abc import ABC, abstractmethod
from datetime import UTC, datetime

from sqlalchemy.orm import Session

from app.models.message import Message
from app.models.reservation import Reservation


class IMessageService(ABC):
    @abstractmethod
    def send_reservation_confirmation(self, organizer_id: str, reservation_id: str) -> bool:
        """Wstawia potwierdzenie rezerwacji do skrzynki organizatora."""


class MessageService(IMessageService):
    """Tylko zapis wiadomości - odczyt skrzynki to osobny przypadek użycia."""

    def __init__(self, db_session: Session) -> None:
        self.db_session = db_session

    def send_reservation_confirmation(self, organizer_id: str, reservation_id: str) -> bool:
        reservation = self.db_session.get(Reservation, reservation_id)
        if reservation is None:
            return False
        slot = reservation.slot
        message = Message(
            recipient_id=organizer_id,
            reservation_id=reservation_id,
            content=(
                f"Rezerwacja gry '{slot.game.title}' na {slot.start_time:%Y-%m-%d %H:%M} "
                f"została potwierdzona. Kwota: {reservation.total_cost:.2f} PLN."
            ),
            created_at=datetime.now(UTC),
        )
        self.db_session.add(message)
        return True
