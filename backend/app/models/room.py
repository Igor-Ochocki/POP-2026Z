from enum import Enum as PyEnum
from typing import TYPE_CHECKING

import uuid

from sqlalchemy import Boolean, Enum, Integer, JSON, String, ForeignKey, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship, composite

from app.db.database import Base
from app.models.position import Position


class Room(Base):
    __tablename__ = "rooms"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4())) #TODO: Nie zgodne z umlem
    map_id: Mapped[str] = mapped_column(ForeignKey('maps.id'), index=True)
    name: Mapped[str] = mapped_column(String(64))
    description: Mapped[str] = mapped_column(String)
    hidden: Mapped[bool] = mapped_column(Boolean)
    zone: Mapped[str] = mapped_column(String)
    position: Mapped[Position] = composite()
    width: Mapped[float] = mapped_column(Float)
    height: Mapped[float] = mapped_column(Float)
    