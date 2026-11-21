from enum import Enum as PyEnum
from typing import TYPE_CHECKING

import uuid

from sqlalchemy import Boolean, Enum, Integer, JSON, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base

if TYPE_CHECKING:
    from app.models.game import Game
    from app.models.room import Room

class Map(Base):
    __tablename__ = "maps"

    map_id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    game_id: Mapped[str] = mapped_column(ForeignKey('games.id'), index=True)
    is_valid: Mapped[bool] = mapped_column(Boolean)

    game: Mapped["Game"] = relationship("Game", back_populates="maps")
    rooms: Mapped[list["Room"]] = relationship("Room", back_populates="map")