from collections.abc import Callable
from enum import Enum
from typing import Annotated
 
from pydantic import AfterValidator, BaseModel, ConfigDict, Field
 
from app.models.enums import ActionType, EffectKind



def _one_of(enum_cls: type[Enum]) -> Callable[[str], str]:
    allowed = [member.value for member in enum_cls]
 
    def check(value: str) -> str:
        if value not in allowed:
            raise ValueError(f"must be one of: {', '.join(allowed)}")
        return value
 
    return check
 
 
ActionTypeStr = Annotated[str, AfterValidator(_one_of(ActionType))]
EffectKindStr = Annotated[str, AfterValidator(_one_of(EffectKind))]



class ActionSchema(BaseModel):
    action_id: str
    game_id: str
    name: str
    action_type: str
    outcome_type: str
    outcome_value: str

class ActionCreateSchema(BaseModel):

    model_config = ConfigDict(str_strip_whitespace=True)

    game_id: str = Field(min_length=1, max_length=36)
    name: str = Field(min_length=1, max_length=100)
    action_type: ActionTypeStr
    outcome_type: EffectKindStr
    outcome_value: str = Field(min_length=1, max_length=200)
