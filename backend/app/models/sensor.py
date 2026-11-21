from enum import Enum as PyEnum
from typing import TYPE_CHECKING

import uuid

from sqlalchemy import Boolean, Enum, Integer, JSON, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship, composite

from app.db.database import Base
from app.models.position import Position


class Sensor(Base):
    __tablename__ = "sensors"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    room_id: Mapped[str] = mapped_column(ForeignKey('rooms.id'), index=True)
    position: Mapped[Position] = composite()
    