from abc import ABC, abstractmethod

from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError
from app.models.game import Game
from app.models.scenario import Scenario
from app.models.task import Task
from app.schemas.scenario import ScenarioDetailSchema, TaskCreateSchema, TaskSchema


class IScenariosService(ABC):
    @abstractmethod
    def load_scenario(self, game_id: str, user_id: str) -> ScenarioDetailSchema: ...

    @abstractmethod
    def add_task(self, game_id: str, user_id: str, dto: TaskCreateSchema) -> TaskSchema: ...


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

    def _get_own_scenario(self, game_id: str, user_id: str) -> Scenario:
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
        return scenario

    def load_scenario(self, game_id: str, user_id: str) -> ScenarioDetailSchema:
        return self._map_to_response(self._get_own_scenario(game_id, user_id))

    def add_task(self, game_id: str, user_id: str, dto: TaskCreateSchema) -> TaskSchema:
        scenario = self._get_own_scenario(game_id, user_id)

        # Scenariusz alternatywny 2 PU57 - obiekt interakcji może mieć tylko jedno zadanie.
        target_id = dto.interaction_target_id
        if target_id and any(task.interaction_target_id == target_id for task in scenario.tasks):
            raise ConflictError(f"Interaction target {target_id} is already linked to another task")

        task = Task(scenario_id=scenario.id, position=len(scenario.tasks), **dto.model_dump())
        self.db_session.add(task)
        self.db_session.commit()
        self.db_session.refresh(task)
        return self._map_task(task)
