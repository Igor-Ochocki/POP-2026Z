import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Enum, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base
from app.models.enums import ReservationStatus

if TYPE_CHECKING:
    from app.models.room import Room
    from app.models.inventory_item import InventoryItem


class RoomItemClaim(Base):
    """Ile przedmiotów z mapy zostało zarezerwowanych na wykorzystanie w danym pokoju"""

    __tablename__ = "room_item_claims"

    room_id: Mapped[str] = mapped_column(ForeignKey("rooms.id"), primary_key=True)
    item_id: Mapped[str] = mapped_column(ForeignKey("inventory_items.item_id"), primary_key=True)
    amount: Mapped[int] = mapped_column(Integer)

    room: Mapped["Room"] = relationship("Room", back_populates="items_claimed")
    item: Mapped["InventoryItem"] = relationship("InventoryItem", back_populates="claims")


