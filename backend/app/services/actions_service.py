from sqlalchemy import text
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.models.actions import Action
from app.models.game import Game
from app.models.enums import ActionType, EffectKind
from app.schemas.actions import ActionCreateSchema, ActionSchema
from app.core.exceptions import NotFoundError, ConflictError

class ActionsService:

    def __init__(self, db_session: Session) -> None:
        self.db_session = db_session

    def create_action(self, dto: ActionCreateSchema) -> ActionSchema:

        if self.db_session.get(Game, dto.game_id) is None:
            raise NotFoundError(f"Game '{dto.game_id}' not found")

        action = Action(**dto.model_dump())
        self.db_session.add(action)

        try:
            self.db_session.commit()

        except IntegrityError as exc:
            self.db_session.rollback()
            raise ConflictError("Action violates a database constraint") from exc

        return ActionSchema.model_validate(action, from_attributes=True)

    def get_action(self, action_id: str) -> ActionSchema:
        action = self.db_session.get(Action, action_id)
        if action is None:
            raise NotFoundError(f"Action '{action_id}' not found")

        return ActionSchema.model_validate(action, from_attributes=True)

    @staticmethod
    def get_action_types() -> list[str]:
        return [member.value for member in ActionType]

    @staticmethod
    def get_effect_kind() ->list[str]:
        return [member.value for member in EffectKind]
