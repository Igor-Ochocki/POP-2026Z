import uuid
from typing import TYPE_CHECKING

from sqlalchemy import JSON, Boolean, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base

if TYPE_CHECKING:
    from app.models.game import Game
    from app.models.passage import Passage
    from app.models.room import Room


class Map(Base):
    """Mapa gry - jedna na grę. Wspólna dla PU60 (definicja mapy), PU59 (edycja komnaty) i PU35 (mapa gracza)."""

    __tablename__ = "maps"

    map_id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    game_id: Mapped[str] = mapped_column(ForeignKey("games.id"), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(200), default="")
    description: Mapped[str] = mapped_column(String(1000), default="")
    is_valid: Mapped[bool] = mapped_column(Boolean, default=False)
    # Rozmiar obszaru mapy {"width": int, "height": int} (PU60); None - jeszcze nie zdefiniowany.
    container: Mapped[dict[str, int] | None] = mapped_column(JSON, nullable=True, default=None)

    game: Mapped["Game"] = relationship("Game", back_populates="map")
    rooms: Mapped[list["Room"]] = relationship("Room", back_populates="map", cascade="all, delete-orphan")
    passages: Mapped[list["Passage"]] = relationship("Passage", back_populates="map", cascade="all, delete-orphan")
