from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base

if TYPE_CHECKING:
    from app.models.inventory_item import InventoryItem
    from app.models.room import Room


class RoomItemClaim(Base):
    """Ile przedmiotów z magazynu gry zostało zarezerwowanych na wykorzystanie w danej komnacie."""

    __tablename__ = "room_item_claims"

    room_id: Mapped[int] = mapped_column(ForeignKey("rooms.id"), primary_key=True)
    item_id: Mapped[str] = mapped_column(ForeignKey("inventory_items.item_id"), primary_key=True)
    amount: Mapped[int] = mapped_column(Integer, default=1)

    room: Mapped["Room"] = relationship("Room", back_populates="items_claimed")
    item: Mapped["InventoryItem"] = relationship("InventoryItem", back_populates="claims")
