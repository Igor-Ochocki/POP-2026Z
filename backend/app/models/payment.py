from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base
from app.models.enums import PaymentStatus
from app.models.reservation import _enum_column
from app.models.time_slot import new_id


class Payment(Base):
    """Płatność rezerwacji (PU2) - symulowana brama płatnicza w iteracji 1."""

    __tablename__ = "payments"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    reservation_id: Mapped[str] = mapped_column(ForeignKey("reservations.id"), index=True)
    amount: Mapped[float] = mapped_column(Float)
    status: Mapped[PaymentStatus] = mapped_column(
        _enum_column(PaymentStatus), default=PaymentStatus.Pending
    )
    paid_at: Mapped[datetime | None] = mapped_column(DateTime, default=None)

    reservation: Mapped["Reservation"] = relationship(back_populates="payments")  # noqa: F821
