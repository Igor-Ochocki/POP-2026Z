import type { AxiosInstance } from 'axios';
import type { TaskCreateDTO } from '@app-types/task';

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

export const createScenarioApi = (http: AxiosInstance) => ({
  addTask: async (gameId: string, task: TaskCreateDTO) => {
    const res = await http.post(
      '/scenario/task/' + gameId,
      toCreatePayload(task),
    );
    return res.data;
  },
});

export type ScenariosApi = ReturnType<typeof createScenarioApi>;
