"""ORM models. Import every model here so Base.metadata registers it
(create_tables relies on that when bootstrapping the database)."""

from app.models.enums import PaymentStatus, ReservationStatus
from app.models.message import Message
from app.models.payment import Payment
from app.models.reservation import Reservation
from app.models.time_slot import TimeSlot

__all__ = [
    "Message",
    "Payment",
    "PaymentStatus",
    "Reservation",
    "ReservationStatus",
    "TimeSlot",
]
