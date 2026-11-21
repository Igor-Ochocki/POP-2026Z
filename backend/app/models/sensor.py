import uuid
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, JSON, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base

if TYPE_CHECKING:
    from app.models.actions import Action
    from app.models.room import Room


class Sensor(Base):
    __tablename__ = "sensors"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String)
    type: Mapped[str] = mapped_column(String)
    action_id: Mapped[str] = mapped_column(ForeignKey("action.action_id"), index=True)
    description: Mapped[str] = mapped_column(String)
    position: Mapped[dict[str, float]] = mapped_column(JSON)
    room_id: Mapped[int] = mapped_column(ForeignKey("rooms.id"), index=True)

    action: Mapped["Action"] = relationship("Action")
    room: Mapped["Room"] = relationship("Room", back_populates="sensors")
