from sqlalchemy import ForeignKey, Integer, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base
from app.models.room import Room


class QRCode(Base):
    __tablename__ = "qr_codes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    position: Mapped[dict[str, float]] = mapped_column(JSON)
    room_id: Mapped[int] = mapped_column(ForeignKey("rooms.id"), index=True)

    room: Mapped["Room"] = relationship("Room", back_populates="qr_codes")
