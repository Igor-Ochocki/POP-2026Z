from abc import ABC, abstractmethod

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.models.game import Game
from app.models.scenario import Scenario
from app.models.task import Task
from app.schemas.scenario import ScenarioDetailSchema, TaskSchema


class IScenariosService(ABC):
    @abstractmethod
    def load_scenario(self, game_id: str, user_id: str) -> ScenarioDetailSchema: ...


class ScenariosService(IScenariosService):
    def __init__(self, db_session: Session) -> None:
        self.db_session = db_session

    @staticmethod
    def _map_task(task: Task) -> TaskSchema:
        return TaskSchema(
            task_id=task.id,
            title=task.title,
            narrative=task.narrative,
            interaction_type=task.interaction_type,
            interaction_target_id=task.interaction_target_id,
            required_player_level=task.required_player_level,
            time_limit_minutes=task.time_limit_minutes,
            reward_type=task.reward_type,
            reward_value=task.reward_value,
        )

    @classmethod
    def _map_to_response(cls, scenario: Scenario) -> ScenarioDetailSchema:
        return ScenarioDetailSchema(
            scenario_id=scenario.id,
            game_id=scenario.game_id,
            tasks=[cls._map_task(task) for task in scenario.tasks],
            victory_conditions=[],
        )

    def load_scenario(self, game_id: str, user_id: str) -> ScenarioDetailSchema:
        game = self.db_session.get(Game, game_id)
        if game is None or game.author_id != user_id:
            raise NotFoundError(f"Game {game_id} not found")

        scenario = game.scenario
        if scenario is None:
            # Gra bez scenariusza (np. zapisana przed wprowadzeniem scenariuszy) - tworzymy pusty.
            scenario = Scenario(game_id=game.id)
            self.db_session.add(scenario)
            self.db_session.commit()
            self.db_session.refresh(scenario)

        return self._map_to_response(scenario)
