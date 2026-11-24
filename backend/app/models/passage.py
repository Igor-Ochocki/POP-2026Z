from typing import TYPE_CHECKING

from sqlalchemy import Float, ForeignKey
from sqlalchemy.orm import Mapped, composite, mapped_column, relationship

from app.db.database import Base
from app.models.position import Position

if TYPE_CHECKING:
    from app.models.map import Map
    from app.models.room import Room


class Passage(Base):
    """Przejście łączące dwie komnaty tej samej mapy w punkcie position."""

    __tablename__ = "passages"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    map_id: Mapped[str] = mapped_column(ForeignKey("maps.map_id"), index=True)
    room1_id: Mapped[int] = mapped_column(ForeignKey("rooms.id"), index=True)
    room2_id: Mapped[int] = mapped_column(ForeignKey("rooms.id"), index=True)
    position: Mapped[Position] = composite(
        mapped_column("position_x", Float, default=0.0),
        mapped_column("position_y", Float, default=0.0),
    )

    map: Mapped["Map"] = relationship("Map", back_populates="passages")
    from_room: Mapped["Room"] = relationship(back_populates="exit_passages", foreign_keys=[room1_id])
    to_room: Mapped["Room"] = relationship(back_populates="entry_passages", foreign_keys=[room2_id])
