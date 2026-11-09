from abc import ABC, abstractmethod
from datetime import UTC, datetime

from sqlalchemy.orm import Session

from app.models.enums import PaymentStatus
from app.models.payment import Payment


class IPaymentService(ABC):
    @abstractmethod
    def process_payment(self, reservation_id: str, amount: float) -> bool:
        """Obsługa płatności za rezerwację; zwraca, czy się powiodła."""


class PaymentService(IPaymentService):
    """Iteracja 1: brak zewnętrznej bramki - płatność od razu kończy się sukcesem."""

    def __init__(self, db_session: Session) -> None:
        self.db_session = db_session

    def process_payment(self, reservation_id: str, amount: float) -> bool:
        payment = Payment(
            reservation_id=reservation_id,
            amount=amount,
            status=PaymentStatus.COMPLETED,
            paid_at=datetime.now(UTC),
        )
        self.db_session.add(payment)
        return True
