import type { AxiosInstance } from 'axios';

type TaskCreateDTO = {
  title: string;
  narrative: string;
  interactionType: string;
  requiredPlayerLevel?: number;
  timeLimitMinutes?: number | null;
  rewardType: string;
  rewardValue: string;
};

export const createScenarioApi = (http: AxiosInstance) => ({
  addTask: async (gameId: string, task: TaskCreateDTO) => {
    const res = await http.post('/scenario/task/' + gameId, task);
    if (res.status !== 200) {
      throw res.status;
    }
    return res.data;
  },
});

export type ScenariosApi = ReturnType<typeof createScenarioApi>;
