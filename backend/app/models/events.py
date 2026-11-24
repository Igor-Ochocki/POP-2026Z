from typing import TYPE_CHECKING

from sqlalchemy import String, Integer, Enum, ForeignKey, JSON
from sqlalchemy.ext.mutable import MutableList
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.enums import EventStatus

from app.db.database import Base

if TYPE_CHECKING:
    from app.models.reservation import Reservation


class Event(Base):
    __tablename__ = "events"

    reserv_id : Mapped[str] = mapped_column(ForeignKey("reservations.id"), primary_key=True, index=True)
    users_registered: Mapped[int] = mapped_column(Integer)
    participants : Mapped[list[str]] = mapped_column(MutableList.as_mutable(JSON), default=list)
    event_status : Mapped[EventStatus] = mapped_column(Enum(EventStatus), default=EventStatus.OPEN)

    reservation : Mapped["Reservation"] = relationship("Reservation", back_populates="event")