from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base

if TYPE_CHECKING:
    from app.models.map import Map


class Passage(Base):
    __tablename__ = "passages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    room1_id: Mapped[int] = mapped_column(ForeignKey("rooms.id"), index=True)
    room2_id: Mapped[int] = mapped_column(ForeignKey("rooms.id"), index=True)
    map_id: Mapped[int] = mapped_column(ForeignKey("maps.id"), index=True)

    map: Mapped["Map"] = relationship("Map", back_populates="passages")
