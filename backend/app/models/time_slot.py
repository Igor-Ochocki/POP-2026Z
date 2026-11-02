from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, Float, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


def new_id() -> str:
    """Generate a new identifier for API entities stored as strings."""
    return uuid4().hex


class TimeSlot(Base):
    """Slot czasowy gry widoczny w kalendarzu (PU1).

    Wspólny kontrakt z frontendem (CalendarEventDTO): jedno pole
    start_time, czas trwania wyliczany z durationMinutes gry (PU49).
    """

    __tablename__ = "time_slots"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    game_id: Mapped[str] = mapped_column(String(32), index=True)
    title: Mapped[str] = mapped_column(String(200))
    start_time: Mapped[datetime] = mapped_column(DateTime, index=True)
    location: Mapped[str] = mapped_column(String(200))
    base_price: Mapped[float] = mapped_column(Float)
    is_available: Mapped[bool] = mapped_column(default=True)
