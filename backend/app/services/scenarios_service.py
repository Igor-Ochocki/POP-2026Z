from abc import ABC, abstractmethod

from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError
from app.models.enums import VictoryConditionTarget, VictoryConditionType
from app.models.game import Game
from app.models.scenario import Scenario
from app.models.task import Task
from app.models.victory_condition import VictoryCondition
from app.schemas.scenario import (
    ScenarioDetailSchema,
    TaskCreateSchema,
    TaskSchema,
    VictoryConditionCreateSchema,
    VictoryConditionSchema,
)


class IScenariosService(ABC):
    @abstractmethod
    def load_scenario(self, game_id: str, user_id: str) -> ScenarioDetailSchema: ...

    @abstractmethod
    def add_task(self, game_id: str, user_id: str, dto: TaskCreateSchema) -> TaskSchema: ...

    @abstractmethod
    def get_victory_condition_list(self, game_id: str, user_id: str) -> list[VictoryConditionSchema]: ...

    @abstractmethod
    def get_victory_condition(self, game_id: str, victory_condition_id: str, user_id: str) -> VictoryConditionSchema: ...

    @abstractmethod
    def create_victory_condition(self, game_id: str, user_id: str, dto: VictoryConditionCreateSchema) -> VictoryConditionSchema: ...

    @abstractmethod
    def edit_victory_condition(self, game_id: str, victory_condition_id: str, user_id: str, dto: VictoryConditionCreateSchema) -> VictoryConditionSchema: ...


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

    @staticmethod
    def _map_victory_condition(condition: VictoryCondition) -> VictoryConditionSchema:
        return VictoryConditionSchema(
            victory_condition_id=condition.id,
            name=condition.name,
            target=VictoryConditionTarget(condition.target),
            value=condition.value,
            condition_type=VictoryConditionType(condition.condition_type),
        )

    def _map_to_response(self, scenario: Scenario) -> ScenarioDetailSchema:
        conditions = (
            self.db_session.query(VictoryCondition)
            .filter(VictoryCondition.scenario_id == scenario.id)
            .all()
        )
        return ScenarioDetailSchema(
            scenario_id=scenario.id,
            game_id=scenario.game_id,
            tasks=[self._map_task(task) for task in scenario.tasks],
            victory_conditions=[self._map_victory_condition(c) for c in conditions],
        )

    def _get_game_for_user(self, game_id: str, user_id: str) -> Game:
        game = self.db_session.get(Game, game_id)
        if game is None or game.author_id != user_id:
            raise NotFoundError(f"Game {game_id} not found")
        return game

    def _get_own_scenario(self, game_id: str, user_id: str) -> Scenario:
        self._get_game_for_user(game_id, user_id)

        scenario = self.db_session.query(Scenario).filter(Scenario.game_id == game_id).first()
        if scenario is None:
            # Gra bez scenariusza (np. zapisana przed wprowadzeniem scenariuszy) - tworzymy pusty.
            scenario = Scenario(game_id=game_id)
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

    def get_victory_condition_list(self, game_id: str, user_id: str) -> list[VictoryConditionSchema]:
        scenario = self._get_own_scenario(game_id, user_id)
        conditions = (
            self.db_session.query(VictoryCondition)
            .filter(VictoryCondition.scenario_id == scenario.id)
            .all()
        )
        return [self._map_victory_condition(c) for c in conditions]

    def get_victory_condition(self, game_id: str, victory_condition_id: str, user_id: str) -> VictoryConditionSchema:
        scenario = self._get_own_scenario(game_id, user_id)
        condition = self.db_session.get(VictoryCondition, victory_condition_id)
        if condition is None or condition.scenario_id != scenario.id:
            raise NotFoundError(f"Victory condition {victory_condition_id} not found")
        return self._map_victory_condition(condition)

    def create_victory_condition(
        self, game_id: str, user_id: str, dto: VictoryConditionCreateSchema
    ) -> VictoryConditionSchema:
        scenario = self._get_own_scenario(game_id, user_id)
        existing = (
            self.db_session.query(VictoryCondition)
            .filter(VictoryCondition.scenario_id == scenario.id, VictoryCondition.condition_type == dto.condition_type)
            .first()
        )
        if existing:
            raise ConflictError(f"Victory condition of type {dto.condition_type} already exists")
        condition = VictoryCondition(
            scenario_id=scenario.id,
            name=dto.name,
            target=dto.target,
            value=dto.value,
            condition_type=dto.condition_type,
        )
        self.db_session.add(condition)
        self.db_session.commit()
        self.db_session.refresh(condition)
        return self._map_victory_condition(condition)

    def edit_victory_condition(
        self, game_id: str, victory_condition_id: str, user_id: str, dto: VictoryConditionCreateSchema
    ) -> VictoryConditionSchema:
        scenario = self._get_own_scenario(game_id, user_id)
        condition = self.db_session.get(VictoryCondition, victory_condition_id)
        if condition is None or condition.scenario_id != scenario.id:
            raise NotFoundError(f"Victory condition {victory_condition_id} not found")
        if dto.condition_type != condition.condition_type:
            existing = (
                self.db_session.query(VictoryCondition)
                .filter(
                    VictoryCondition.scenario_id == scenario.id,
                    VictoryCondition.condition_type == dto.condition_type,
                    VictoryCondition.id != victory_condition_id,
                )
                .first()
            )
            if existing:
                raise ConflictError(f"Victory condition of type {dto.condition_type} already exists")
        condition.name = dto.name
        condition.target = dto.target
        condition.value = dto.value
        condition.condition_type = dto.condition_type
        self.db_session.commit()
        self.db_session.refresh(condition)
        return self._map_victory_condition(condition)
