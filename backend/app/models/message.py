from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base
from app.models.time_slot import new_id


class Message(Base):
    """Wiadomość w skrzynce użytkownika (potwierdzenie rezerwacji - PU2)."""

    __tablename__ = "messages"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    recipient_id: Mapped[str] = mapped_column(String(64), index=True)
    reservation_id: Mapped[str] = mapped_column(
        ForeignKey("reservations.id"), index=True
    )
    content: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
