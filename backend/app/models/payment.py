import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base
from app.models.enums import PaymentStatus

if TYPE_CHECKING:
    from app.models.reservation import Reservation


class Payment(Base):
    """Płatność za rezerwację (PU2) - w iteracji 1 symulowana bramka płatnicza."""

    __tablename__ = "payments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    reservation_id: Mapped[str] = mapped_column(ForeignKey("reservations.id"), index=True)
    amount: Mapped[float] = mapped_column(Float)
    status: Mapped[PaymentStatus] = mapped_column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    paid_at: Mapped[datetime | None] = mapped_column(DateTime, default=None)
    reservation: Mapped["Reservation"] = relationship("Reservation", back_populates="payments")
