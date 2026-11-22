from enum import Enum as PyEnum
from typing import TYPE_CHECKING

import uuid

from sqlalchemy import Boolean, Enum, Integer, JSON, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship, composite

from app.db.database import Base
from app.models.position import Position

if TYPE_CHECKING:
    from app.models.room import Room

class Passage(Base):
    __tablename__ = "passages"

    id: Mapped[int] = mapped_column(primary_key=True)

    #FIXME: room1 i room2 nie są zbyt opisowe
    room1_id: Mapped[str] = mapped_column(ForeignKey('rooms.id'), index=True)
    from_room: Mapped["Room"] = relationship(back_populates="exit_passages", foreign_keys=[room1_id])

    room2_id: Mapped[str] = mapped_column(ForeignKey('rooms.id'), index=True)
    to_room: Mapped["Room"] = relationship(back_populates="entry_passages", foreign_keys=[room2_id])

    position: Mapped[Position] = composite(Position)