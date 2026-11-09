import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base
from app.models.game import Game


class TimeSlot(Base):
    """Termin rozgrywki danej gry widoczny w kalendarzu (PU1).

    Tytuł wydarzenia to tytuł gry, a czas trwania wynika z Game.duration_minutes.
    """

    __tablename__ = "time_slots"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    game_id: Mapped[str] = mapped_column(ForeignKey("games.id"), index=True)
    start_time: Mapped[datetime] = mapped_column(DateTime, index=True)
    location: Mapped[str] = mapped_column(String(200))
    base_price: Mapped[float] = mapped_column(Float)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True)
    game: Mapped[Game] = relationship(Game)
