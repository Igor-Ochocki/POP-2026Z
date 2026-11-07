from typing import TYPE_CHECKING
from uuid import uuid4

from sqlalchemy.orm import relationship, Mapped, mapped_column  

from app.db.database import Base

if TYPE_CHECKING:
    from app.models.actions import Action

class Game(Base):

    __tablename__ = "game"

    id : Mapped[str] = mapped_column(primary_key=True, default = lambda: str(uuid4()))

    actions : Mapped[list["Action"]] = relationship("Action", back_populates="game", cascade="all, delete-orphan")