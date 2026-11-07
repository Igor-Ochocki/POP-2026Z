import enum
from sqlalchemy import ForeignKey, Enum, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from uuid import uuid4
from typing import TYPE_CHECKING

from app.db.database import Base
from app.models.enums import ActionType, EffectKind

if TYPE_CHECKING:  
    from app.models.game import Game

def _enum_column(enum_cls: type[enum.Enum]) -> Enum:
    return Enum(
        enum_cls,
        native_enum=False,  
        length=50,  
        validate_strings=True,
        values_callable=lambda members: [m.value for m in members], # do endpointów zwracających listy z wartościami enuma do wyboru
    )


class Action(Base):
    __tablename__ = "action"

    action_id : Mapped[str] = mapped_column(primary_key = True, default = lambda: str(uuid4()))
    game_id: Mapped[str] = mapped_column(ForeignKey("game.id"), index=True)
    name: Mapped[str] = mapped_column(String(100))
    action_type: Mapped[ActionType] = mapped_column(_enum_column(ActionType))
    outcome_type: Mapped[EffectKind] = mapped_column(_enum_column(EffectKind))
    outcome_value: Mapped[str] = mapped_column(String(200))

    game : Mapped["Game"] = relationship("Game", back_populates="actions")