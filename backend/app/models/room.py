from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base

if TYPE_CHECKING:
    from app.models.item import InventoryItem
    from app.models.map import Map
    from app.models.qr_code import QRCode
    from app.models.sensor import Sensor


class Room(Base):
    __tablename__ = "rooms"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String)
    description: Mapped[str] = mapped_column(String)
    hidden: Mapped[bool] = mapped_column(Boolean)
    zone: Mapped[str] = mapped_column(String)
    map_id: Mapped[int] = mapped_column(ForeignKey("maps.id"), index=True)
    map: Mapped["Map"] = relationship("Map", back_populates="rooms")
    items: Mapped[list["InventoryItem"]] = relationship(
        "InventoryItem", back_populates="room", cascade="all, delete-orphan"
    )
    sensors: Mapped[list["Sensor"]] = relationship(
        "Sensor", back_populates="room", cascade="all, delete-orphan"
    )
    qr_codes: Mapped[list["QRCode"]] = relationship(
        "QRCode", back_populates="room", cascade="all, delete-orphan"
    )
