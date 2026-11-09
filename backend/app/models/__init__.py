"""ORM models (SQLAlchemy).

Import every model here and list it in __all__ - create_tables() only creates
tables for models imported in this file, e.g.:

    from app.models.game import Game

    __all__ = ["Game"]
"""
from app.models.actions import Action
from app.models.game import Game
from app.models.scenario import Scenario
from app.models.task import Task

__all__: list[str] = [
    "Action", "Game", "Scenario", "Task"
]
