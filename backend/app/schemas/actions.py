from pydantic import BaseModel, Field

class ActionSchema(BaseModel):
    action_id: str
    game_id: str
    name: str
    action_type: str
    outcome_type: str
    outcome_value: str

class ActionCreateSchema(BaseModel):
    game_id: str = Field(min_length=1, max_length=36)
    name: str = Field(min_length=1, max_length=100)
    action_type: str = Field(min_length=1, max_length=50)
    outcome_type: str = Field(min_length=1, max_length=50)
    outcome_value: str = Field(min_length=1, max_length=200)
