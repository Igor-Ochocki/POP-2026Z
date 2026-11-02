from sqlalchemy import Boolean, Enum, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base
from app.models.enums import ReservationStatus
from app.models.time_slot import new_id


def _enum_column(enum_cls: type) -> Enum:
    """Store python enum member values as plain VARCHAR values."""
    return Enum(
        enum_cls,
        native_enum=False,
        length=32,
        values_callable=lambda e: [m.value for m in e],
    )


class Reservation(Base):
    """Rezerwacja slotu gry przez organizatora (PU2)."""

    __tablename__ = "reservations"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    slot_id: Mapped[str] = mapped_column(ForeignKey("time_slots.id"), index=True)
    game_id: Mapped[str] = mapped_column(String(32), index=True)
    organizer_id: Mapped[str] = mapped_column(String(64), index=True)
    participant_count: Mapped[int]
    total_cost: Mapped[float] = mapped_column(Float)
    status: Mapped[ReservationStatus] = mapped_column(
        _enum_column(ReservationStatus), default=ReservationStatus.Unpaid
    )
    is_paid: Mapped[bool] = mapped_column(Boolean, default=False)

    slot: Mapped["TimeSlot"] = relationship(back_populates="reservations")  # noqa: F821
    payments: Mapped[list["Payment"]] = relationship(back_populates="reservation")  # noqa: F821
