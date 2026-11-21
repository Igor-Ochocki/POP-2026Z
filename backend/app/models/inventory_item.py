from enum import Enum as PyEnum
from typing import TYPE_CHECKING

import uuid

from sqlalchemy import Boolean, Enum, Integer, JSON, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


if TYPE_CHECKING:
    from app.models.game import Game

class InventoryItem(Base):
    __tablename__ = "items"

    item_id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    game_id: Mapped[str] = mapped_column(ForeignKey('games.id'), index=True)
    name: Mapped[str] = mapped_column(String(32))
    total: Mapped[int] = mapped_column(Integer)
    available: Mapped[int] = mapped_column(Integer)

    game: Mapped["Game"] = relationship("Game", back_populates="inventory_items")