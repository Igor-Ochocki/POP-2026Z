import uuid

from sqlalchemy import Boolean, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Map(Base):
    __tablename__ = "maps"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    game_id: Mapped[str] = mapped_column(ForeignKey("games.id"), index=True)
    name: Mapped[str] = mapped_column(String(200))

    rooms: Mapped[list["Room"]] = relationship("Room", back_populates="map", cascade="all, delete-orphan")
    passages: Mapped[list["Passage"]] = relationship("Passage", back_populates="map", cascade="all, delete-orphan")


class Room(Base):
    __tablename__ = "rooms"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    map_id: Mapped[str] = mapped_column(ForeignKey("maps.id"), index=True)
    name: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(String(1000), default="")
    hidden: Mapped[bool] = mapped_column(Boolean, default=False)
    zone: Mapped[str] = mapped_column(String(100))
    position_x: Mapped[float] = mapped_column(Float, default=0.0)
    position_y: Mapped[float] = mapped_column(Float, default=0.0)
    width: Mapped[float] = mapped_column(Float, default=1.0)
    height: Mapped[float] = mapped_column(Float, default=1.0)

    map: Mapped["Map"] = relationship("Map", back_populates="rooms")


class Passage(Base):
    __tablename__ = "passages"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    map_id: Mapped[str] = mapped_column(ForeignKey("maps.id"), index=True)
    room1_id: Mapped[str] = mapped_column(ForeignKey("rooms.id"))
    room2_id: Mapped[str] = mapped_column(ForeignKey("rooms.id"))

    map: Mapped["Map"] = relationship("Map", back_populates="passages")
