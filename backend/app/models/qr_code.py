from enum import Enum as PyEnum
from typing import TYPE_CHECKING

import uuid

from sqlalchemy import Boolean, Enum, Integer, JSON, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship, composite

from app.db.database import Base
from app.models.position import Position

if TYPE_CHECKING:
    from app.models.room import Room

class QrCode(Base):
    __tablename__ = "qr_codes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    room_id: Mapped[str] = mapped_column(ForeignKey('rooms.id'), index=True)
    position: Mapped[Position] = composite(Position)
    content: Mapped[str] = mapped_column(String(256)) #FIXME: Nie zgadza się z uml

    room: Mapped["Room"] = relationship("Room", back_populates="qr_codes")
