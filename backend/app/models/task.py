import uuid
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base

if TYPE_CHECKING:
    from app.models.scenario import Scenario


class Task(Base):
    """Zadanie scenariusza. Pola zgodne z diagramem PU57; walidacja i zapis dochodzą w PU57."""

    __tablename__ = "tasks"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    scenario_id: Mapped[str] = mapped_column(ForeignKey("scenarios.id"), index=True)
    position: Mapped[int] = mapped_column(Integer, default=0)
    title: Mapped[str] = mapped_column(String)
    narrative: Mapped[str] = mapped_column(String)
    interaction_type: Mapped[str] = mapped_column(String)
    # Cel interakcji (np. komnata z PU60) - opcjonalny, dopóki front PU57 go nie wybiera.
    interaction_target_id: Mapped[str | None] = mapped_column(String, nullable=True)
    required_player_level: Mapped[int] = mapped_column(Integer, default=1)
    time_limit_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    reward_type: Mapped[str] = mapped_column(String)
    reward_value: Mapped[str] = mapped_column(String)

    scenario: Mapped["Scenario"] = relationship("Scenario", back_populates="tasks")
