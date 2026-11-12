import type { AxiosInstance } from 'axios';
import type { ScenarioDetailDTO } from '@app-types/scenarioEditor';
import type { TaskCreateDTO, TaskDTO } from '@app-types/task';
import type {
  VictoryConditionCreateDTO,
  VictoryConditionDTO,
  VictoryConditionTarget,
  VictoryConditionType,
} from '@app-types/victoryCondition';

interface TaskCreatePayload {
  title: string;
  narrative: string;
  interaction_type: string;
  required_player_level?: number;
  time_limit_minutes?: number | null;
  reward_type: string;
  reward_value: string;
}

const toCreatePayload = (dto: TaskCreateDTO): TaskCreatePayload => ({
  title: dto.title,
  narrative: dto.narrative,
  interaction_type: dto.interactionType,
  required_player_level: dto.requiredPlayerLevel,
  time_limit_minutes: dto.timeLimitMinutes,
  reward_type: dto.rewardType,
  reward_value: dto.rewardValue,
});

interface TaskResponsePayload {
  task_id: string;
  title: string;
  narrative: string;
  interaction_type: string;
  interaction_target_id: string | null;
  required_player_level: number;
  time_limit_minutes: number | null;
  reward_type: string;
  reward_value: string;
}

interface VictoryConditionCreatePayload {
  name: string;
  target: VictoryConditionTarget;
  condition_type: VictoryConditionType;
  value: string;
}

const toVictoryConditionCreatePayload = (
  dto: VictoryConditionCreateDTO,
): VictoryConditionCreatePayload => ({
  name: dto.name,
  target: dto.target,
  condition_type: dto.conditionType,
  value: dto.value,
});

interface VictoryConditionResponsePayload {
  victory_condition_id: string;
  name: string;
  target: VictoryConditionTarget;
  condition_type: VictoryConditionType;
  value: string;
}

interface ScenarioResponsePayload {
  scenario_id: string;
  game_id: string;
  tasks: TaskResponsePayload[];
  victory_conditions: VictoryConditionResponsePayload[];
}

const fromTaskPayload = (task: TaskResponsePayload): TaskDTO => ({
  taskId: task.task_id,
  title: task.title,
  narrative: task.narrative,
  interactionType: task.interaction_type,
  interactionTargetId: task.interaction_target_id,
  requiredPlayerLevel: task.required_player_level,
  timeLimitMinutes: task.time_limit_minutes,
  rewardType: task.reward_type,
  rewardValue: task.reward_value,
});

const fromVictoryConditionPayload = (
  condition: VictoryConditionResponsePayload,
): VictoryConditionDTO => ({
  victoryConditionId: condition.victory_condition_id,
  name: condition.name,
  target: condition.target,
  conditionType: condition.condition_type,
  value: condition.value,
});

const fromScenarioPayload = (
  scenario: ScenarioResponsePayload,
): ScenarioDetailDTO => ({
  scenarioId: scenario.scenario_id,
  gameId: scenario.game_id,
  tasks: scenario.tasks.map(fromTaskPayload),
  victoryConditions: scenario.victory_conditions.map(
    fromVictoryConditionPayload,
  ),
});

export interface IScenariosApi {
  loadScenario(gameId: string, userId: string): Promise<ScenarioDetailDTO>;
  addTask(
    gameId: string,
    userId: string,
    task: TaskCreateDTO,
  ): Promise<TaskDTO>;
  addVictoryCondition(
    gameId: string,
    userId: string,
    victoryCondition: VictoryConditionCreateDTO,
  ): Promise<VictoryConditionDTO>;
}

export const createScenariosApi = (http: AxiosInstance): IScenariosApi => ({
  loadScenario: async (gameId, userId) => {
    const { data } = await http.get<ScenarioResponsePayload>(
      `/games/${gameId}/scenario`,
      { params: { user_id: userId } },
    );
    return fromScenarioPayload(data);
  },

  addTask: async (gameId, userId, task) => {
    const { data } = await http.post<TaskResponsePayload>(
      `/games/${gameId}/scenario/tasks`,
      toCreatePayload(task),
      { params: { user_id: userId } },
    );
    return fromTaskPayload(data);
  },

  addVictoryCondition: async (gameId, userId, victoryCondition) => {
    const { data } = await http.post<VictoryConditionResponsePayload>(
      `/games/${gameId}/scenario/victory-conditions`,
      toVictoryConditionCreatePayload(victoryCondition),
      { params: { user_id: userId } },
    );
    return fromVictoryConditionPayload(data);
  },
});
