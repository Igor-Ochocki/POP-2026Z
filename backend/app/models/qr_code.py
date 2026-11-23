import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Float, ForeignKey, String
from sqlalchemy.orm import Mapped, composite, mapped_column, relationship

from app.db.database import Base
from app.models.position import Position

if TYPE_CHECKING:
    from app.models.room import Room


class QrCode(Base):
    __tablename__ = "qr_codes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    room_id: Mapped[int] = mapped_column(ForeignKey("rooms.id"), index=True)
    position: Mapped[Position] = composite(
        mapped_column("position_x", Float, default=0.0),
        mapped_column("position_y", Float, default=0.0),
    )
    # Treść kodu (map-definition.md); PU59 ustawia tylko położenie.
    content: Mapped[str] = mapped_column(String(256), default="")

    room: Mapped["Room"] = relationship("Room", back_populates="qr_codes")
