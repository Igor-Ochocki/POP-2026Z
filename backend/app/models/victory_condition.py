import uuid

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class VictoryCondition(Base):
    __tablename__ = "victory_conditions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    scenario_id: Mapped[str] = mapped_column(ForeignKey("scenarios.id"), index=True)
    name: Mapped[str] = mapped_column(String(100))
    target: Mapped[str] = mapped_column(String)
    value: Mapped[str] = mapped_column(String(100))
    condition_type: Mapped[str] = mapped_column(String)
