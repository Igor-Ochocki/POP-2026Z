import uuid
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base

if TYPE_CHECKING:
    from app.models.game import Game
    from app.models.room_item_claim import RoomItemClaim


class InventoryItem(Base):
    """Przedmiot z magazynu gry. Do komnat przypisywany przez RoomItemClaim."""

    __tablename__ = "inventory_items"

    item_id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    game_id: Mapped[str] = mapped_column(ForeignKey("games.id"), index=True)
    name: Mapped[str] = mapped_column(String(32))
    total: Mapped[int] = mapped_column(Integer)
    available: Mapped[int] = mapped_column(Integer)

    game: Mapped["Game"] = relationship("Game", back_populates="inventory_items")
    claims: Mapped[list["RoomItemClaim"]] = relationship(
        "RoomItemClaim", back_populates="item", cascade="all, delete-orphan"
    )
