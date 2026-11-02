from enum import StrEnum


class ReservationStatus(StrEnum):
    Unpaid = "unpaid"
    Confirmed = "confirmed"
    Cancelled = "cancelled"


class PaymentStatus(StrEnum):
    Pending = "pending"
    Completed = "completed"
    Failed = "failed"
