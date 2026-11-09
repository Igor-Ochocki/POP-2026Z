import uuid
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base

if TYPE_CHECKING:
    from app.models.game import Game
    from app.models.task import Task


class Scenario(Base):
    __tablename__ = "scenarios"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    # Jeden scenariusz na grę (uproszczenie na razie - model dopuszcza 1..*).
    game_id: Mapped[str] = mapped_column(ForeignKey("games.id"), unique=True, index=True)

    game: Mapped["Game"] = relationship("Game", back_populates="scenario")
    tasks: Mapped[list["Task"]] = relationship(
        "Task", back_populates="scenario", cascade="all, delete-orphan", order_by="Task.position"
    )
