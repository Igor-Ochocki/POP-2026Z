from collections.abc import Callable
from enum import Enum
from typing import Annotated

from pydantic import AfterValidator, BaseModel, Field

from app.models.enums import VictoryConditionTarget, VictoryConditionType


def _one_of(enum_cls: type[Enum]) -> Callable[[str], str]:
    allowed = [member.value for member in enum_cls]

    def check(value: str) -> str:
        if value not in allowed:
            raise ValueError(f"must be one of: {', '.join(allowed)}")
        return value

    return check


VictoryConditionTypeStr = Annotated[str, AfterValidator(_one_of(VictoryConditionType))]
VictoryConditionTargetStr = Annotated[str, AfterValidator(_one_of(VictoryConditionTarget))]


class TaskSchema(BaseModel):
    task_id: str
    title: str
    narrative: str
    interaction_type: str
    interaction_target_id: str | None
    required_player_level: int
    time_limit_minutes: int | None
    reward_type: str
    reward_value: str


class TaskCreateSchema(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    narrative: str = Field(min_length=1, max_length=2000)
    interaction_type: str = Field(min_length=1)
    interaction_target_id: str | None = None
    required_player_level: int = Field(default=1, ge=1)
    time_limit_minutes: int | None = Field(default=None, gt=0)
    reward_type: str = Field(min_length=1)
    reward_value: str = Field(min_length=1)


class VictoryConditionSchema(BaseModel):
    victory_condition_id: str
    name: str
    target: VictoryConditionTarget
    value: str
    condition_type: VictoryConditionType


class VictoryConditionCreateSchema(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    target: VictoryConditionTargetStr
    value: str = Field(min_length=1, max_length=100)
    condition_type: VictoryConditionTypeStr


class ScenarioDetailSchema(BaseModel):
    scenario_id: str
    game_id: str
    tasks: list[TaskSchema]
    victory_conditions: list[VictoryConditionSchema]
