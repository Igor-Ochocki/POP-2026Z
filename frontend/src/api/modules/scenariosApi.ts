import type { AxiosInstance } from 'axios';
import type { ScenarioDetailDTO } from '@app-types/scenarioEditor';
import type { TaskCreateDTO, TaskDTO } from '@app-types/task';

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

interface ScenarioResponsePayload {
  scenario_id: string;
  game_id: string;
  tasks: TaskResponsePayload[];
  victory_conditions: string[];
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

const fromScenarioPayload = (
  scenario: ScenarioResponsePayload,
): ScenarioDetailDTO => ({
  scenarioId: scenario.scenario_id,
  gameId: scenario.game_id,
  tasks: scenario.tasks.map(fromTaskPayload),
  victoryConditions: scenario.victory_conditions,
});

export interface IScenariosApi {
  loadScenario(gameId: string, userId: string): Promise<ScenarioDetailDTO>;
  addTask(
    gameId: string,
    userId: string,
    task: TaskCreateDTO,
  ): Promise<unknown>;
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
    const res = await http.post(
      `/games/${gameId}/scenario/tasks`,
      toCreatePayload(task),
      { params: { user_id: userId } },
    );
    return res.data;
  },
});
