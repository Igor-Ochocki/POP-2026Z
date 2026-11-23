import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Float, ForeignKey, String
from sqlalchemy.orm import Mapped, composite, mapped_column, relationship

from app.db.database import Base
from app.models.position import Position

if TYPE_CHECKING:
    from app.models.actions import Action
    from app.models.room import Room


class Sensor(Base):
    """Czujnik w komnacie. PU59 ustawia tylko położenie; pełna definicja (nazwa, typ, akcja) - PU50."""

    __tablename__ = "sensors"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    room_id: Mapped[int] = mapped_column(ForeignKey("rooms.id"), index=True)
    position: Mapped[Position] = composite(
        mapped_column("position_x", Float, default=0.0),
        mapped_column("position_y", Float, default=0.0),
    )
    name: Mapped[str | None] = mapped_column(String(100), nullable=True, default=None)
    type: Mapped[str | None] = mapped_column(String(64), nullable=True, default=None)
    description: Mapped[str | None] = mapped_column(String(1000), nullable=True, default=None)
    action_id: Mapped[str | None] = mapped_column(
        ForeignKey("action.action_id"), nullable=True, index=True, default=None
    )

    room: Mapped["Room"] = relationship("Room", back_populates="sensors")
    action: Mapped["Action | None"] = relationship("Action")
