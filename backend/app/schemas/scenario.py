from pydantic import BaseModel


class TaskSchema(BaseModel):
    task_id: str
    title: str
    narrative: str
    interaction_type: str
    interaction_target_id: str
    required_player_level: int
    time_limit_minutes: int | None
    reward_type: str
    reward_value: str


class ScenarioDetailSchema(BaseModel):
    scenario_id: str
    game_id: str
    tasks: list[TaskSchema]
    # Placeholder do PU58 - tam dojdzie model warunku zwycięstwa.
    victory_conditions: list[str]
