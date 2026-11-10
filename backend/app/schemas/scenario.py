from pydantic import BaseModel, Field


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


class ScenarioDetailSchema(BaseModel):
    scenario_id: str
    game_id: str
    tasks: list[TaskSchema]
    # Placeholder do PU58 - tam dojdzie model warunku zwycięstwa.
    victory_conditions: list[str]
