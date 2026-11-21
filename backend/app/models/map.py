from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base

if TYPE_CHECKING:
    from app.models.game import Game
    from app.models.passage import Passage
    from app.models.room import Room


class Map(Base):
    __tablename__ = "maps"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100))
    game_id: Mapped[str] = mapped_column(ForeignKey("games.id"), index=True)
    description: Mapped[str] = mapped_column(String(1000))

    game: Mapped["Game"] = relationship("Game")
    rooms: Mapped[list["Room"]] = relationship(
        "Room", back_populates="map", cascade="all, delete-orphan"
    )
    passages: Mapped[list["Passage"]] = relationship(
        "Passage", back_populates="map", cascade="all, delete-orphan"
    )