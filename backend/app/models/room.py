from enum import Enum as PyEnum
from typing import TYPE_CHECKING

import uuid

from sqlalchemy import Boolean, Enum, Integer, JSON, String, ForeignKey, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship, composite

from app.db.database import Base
from app.models.position import Position

if TYPE_CHECKING:
    from app.models.room_item_claim import RoomItemClaim
    from app.models.passage import Passage
    from app.models.qr_code import QrCode
    from app.models.sensor import Sensor
    from app.models.map import Map

class Room(Base):
    __tablename__ = "rooms"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4())) #TODO: Nie zgodne z umlem
    map_id: Mapped[str] = mapped_column(ForeignKey('maps.map_id'), index=True)
    name: Mapped[str] = mapped_column(String(64))
    description: Mapped[str] = mapped_column(String(4096))
    hidden: Mapped[bool] = mapped_column(Boolean)
    zone: Mapped[str] = mapped_column(String(64))
    position: Mapped[Position] = composite(Position)
    width: Mapped[float] = mapped_column(Float)
    height: Mapped[float] = mapped_column(Float)

    map: Mapped["Map"] = relationship("Map", back_populates="rooms")

    #TODO
    #passage : Mapped[list["Passage"]] = relationship("Passage", back_populates="room", cascade="all, delete-orphan")
    
    entry_passages: Mapped[list["Passage"]] = relationship(back_populates="to_room", foreign_keys="Passage.room2_id")
    exit_passages: Mapped[list["Passage"]] = relationship(back_populates="from_room", foreign_keys="Passage.room1_id")

    qr_codes : Mapped[list["QrCode"]] = relationship("QrCode", back_populates="room", cascade="all, delete-orphan")
    sensors : Mapped[list["Sensor"]] = relationship("Sensor", back_populates="room", cascade="all, delete-orphan")

    items_claimed : Mapped[list["RoomItemClaim"]] = relationship("RoomItemClaim", back_populates="room", cascade="all, delete-orphan")

    