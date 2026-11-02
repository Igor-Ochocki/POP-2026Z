"""Simulated payment gateway for reservations (PU2).

The real integration with an external payment provider is out of
scope for iteration 1 - payments are registered in the database only.
"""

from abc import ABC, abstractmethod
from datetime import UTC, datetime

from sqlalchemy.orm import Session

from app.models.enums import PaymentStatus
from app.models.payment import Payment


class IPaymentService(ABC):
    @abstractmethod
    def process_payment(self, reservation_id: str, amount: float) -> bool:
        """Handle payment for a reservation and return whether it succeeded."""


class PaymentService(IPaymentService):
    def __init__(self, db_session: Session) -> None:
        self.db_session = db_session

    def process_payment(self, reservation_id: str, amount: float) -> bool:
        payment = Payment(
            reservation_id=reservation_id,
            amount=amount,
            status=PaymentStatus.Pending,
        )
        # Iteration 1: no external gateway - the payment succeeds immediately.
        payment.status = PaymentStatus.Completed
        payment.paid_at = datetime.now(UTC)
        self.db_session.add(payment)
        return True
