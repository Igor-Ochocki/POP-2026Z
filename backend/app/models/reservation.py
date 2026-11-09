import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Enum, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base
from app.models.enums import ReservationStatus

if TYPE_CHECKING:
    from app.models.payment import Payment
    from app.models.time_slot import TimeSlot


class Reservation(Base):
    """Rezerwacja terminu gry przez organizatora (PU2)."""

    __tablename__ = "reservations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    slot_id: Mapped[str] = mapped_column(ForeignKey("time_slots.id"), index=True)
    game_id: Mapped[str] = mapped_column(ForeignKey("games.id"), index=True)
    organizer_id: Mapped[str] = mapped_column(String(36), index=True)  # Jak będą użytkownicy to zmiana na FK do User
    participant_count: Mapped[int] = mapped_column(Integer)
    total_cost: Mapped[float] = mapped_column(Float)
    status: Mapped[ReservationStatus] = mapped_column(Enum(ReservationStatus), default=ReservationStatus.UNPAID)
    is_paid: Mapped[bool] = mapped_column(Boolean, default=False)
    slot: Mapped["TimeSlot"] = relationship("TimeSlot")
    payments: Mapped[list["Payment"]] = relationship("Payment", back_populates="reservation")
