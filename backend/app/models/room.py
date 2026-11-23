from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, composite, mapped_column, relationship

from app.db.database import Base
from app.models.position import Position

if TYPE_CHECKING:
    from app.models.map import Map
    from app.models.passage import Passage
    from app.models.qr_code import QrCode
    from app.models.room_item_claim import RoomItemClaim
    from app.models.sensor import Sensor


class Room(Base):
    __tablename__ = "rooms"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    map_id: Mapped[str] = mapped_column(ForeignKey("maps.map_id"), index=True)
    name: Mapped[str] = mapped_column(String(100))
    description: Mapped[str] = mapped_column(String(4096), default="")
    hidden: Mapped[bool] = mapped_column(Boolean, default=False)
    zone: Mapped[str] = mapped_column(String(64), default="")
    position: Mapped[Position] = composite(
        mapped_column("position_x", Float, default=0.0),
        mapped_column("position_y", Float, default=0.0),
    )
    width: Mapped[float] = mapped_column(Float)
    height: Mapped[float] = mapped_column(Float)

    map: Mapped["Map"] = relationship("Map", back_populates="rooms")

    # room1_id -> exit_passages, room2_id -> entry_passages (przejście jest dwukierunkowe)
    exit_passages: Mapped[list["Passage"]] = relationship(
        back_populates="from_room", foreign_keys="Passage.room1_id", cascade="all, delete-orphan"
    )
    entry_passages: Mapped[list["Passage"]] = relationship(
        back_populates="to_room", foreign_keys="Passage.room2_id", cascade="all, delete-orphan"
    )

    qr_codes: Mapped[list["QrCode"]] = relationship("QrCode", back_populates="room", cascade="all, delete-orphan")
    sensors: Mapped[list["Sensor"]] = relationship("Sensor", back_populates="room", cascade="all, delete-orphan")
    items_claimed: Mapped[list["RoomItemClaim"]] = relationship(
        "RoomItemClaim", back_populates="room", cascade="all, delete-orphan"
    )

    @property
    def passages(self) -> list["Passage"]:
        """Wszystkie przejścia, które dotykają tej komnaty."""
        return self.exit_passages + self.entry_passages
