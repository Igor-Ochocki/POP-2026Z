from pydantic import BaseModel, Field, model_validator


class GameCreateSchema(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1, max_length=1000)
    min_players: int = Field(ge=1, le=100)
    max_players: int = Field(ge=1, le=100)
    duration_minutes: int = Field(ge=1, le=10080)
    requires_invitation: bool = False
    tags: list[str] = Field(default_factory=list, max_length=50)

    @model_validator(mode="after")
    def validate_players(self) -> "GameCreateSchema":
        if self.min_players > self.max_players:
            raise ValueError("min_players must be <= max_players")
        return self


class GameResponseSchema(BaseModel):
    game_id: str
    title: str
    description: str
    min_players: int
    max_players: int
    duration_minutes: int
    requires_invitation: bool
    tags: list[str]
    status: str
