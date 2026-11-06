import type { AxiosInstance } from 'axios';
import type { ScenarioDetailDTO, TaskDTO } from '@app-types/game';

interface TaskResponsePayload {
  task_id: string;
  title: string;
  narrative: string;
  interaction_type: string;
  interaction_target_id: string;
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

const fromTaskResponse = (task: TaskResponsePayload): TaskDTO => ({
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

const fromScenarioResponse = (
  scenario: ScenarioResponsePayload,
): ScenarioDetailDTO => ({
  scenarioId: scenario.scenario_id,
  gameId: scenario.game_id,
  tasks: scenario.tasks.map(fromTaskResponse),
  victoryConditions: scenario.victory_conditions,
});

export const createScenariosApi = (http: AxiosInstance) => ({
  loadScenario: async (gameId: string): Promise<ScenarioDetailDTO> => {
    const { data } = await http.get<ScenarioResponsePayload>(
      `/games/${gameId}/scenario`,
    );
    return fromScenarioResponse(data);
  },
});

export type ScenariosApi = ReturnType<typeof createScenariosApi>;
