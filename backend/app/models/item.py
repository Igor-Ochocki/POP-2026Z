import uuid
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base

if TYPE_CHECKING:
    from app.models.room import Room


class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String)
    total: Mapped[int] = mapped_column(Integer)
    available: Mapped[int] = mapped_column(Integer)
    room_id: Mapped[int] = mapped_column(ForeignKey("rooms.id"), index=True)

    room: Mapped["Room"] = relationship("Room", back_populates="items")
