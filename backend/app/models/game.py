from enum import Enum as PyEnum
from typing import TYPE_CHECKING

import uuid

from sqlalchemy import Boolean, Enum, Integer, JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base

if TYPE_CHECKING:
    from app.models.actions import Action

class GameStatus(str, PyEnum):
    Draft = "Draft"
    Submitted = "Submitted"
    Rejected = "Rejected"
    Approved = "Approved"


class Game(Base):
    __tablename__ = "games"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    author_id: Mapped[str] = mapped_column(String(36), nullable=False) # Jak będą użytkownicy to zmiana na FK do User
    title: Mapped[str] = mapped_column(String)
    description: Mapped[str] = mapped_column(String)
    min_players: Mapped[int] = mapped_column(Integer)
    max_players: Mapped[int] = mapped_column(Integer)
    duration_minutes: Mapped[int] = mapped_column(Integer)
    requires_invitation: Mapped[bool] = mapped_column(Boolean, default=False)
    tags: Mapped[list[str]] = mapped_column(JSON, default=list)
    status: Mapped[GameStatus] = mapped_column(Enum(GameStatus), default=GameStatus.Draft)
    actions : Mapped[list["Action"]] = relationship("Action", back_populates="game", cascade="all, delete-orphan")
