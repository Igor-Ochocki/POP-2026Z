export type TaskCreateDTO = {
  title: string;
  narrative: string;
  interactionType: string;
  requiredPlayerLevel?: number;
  timeLimitMinutes?: number | null;
  rewardType: string;
  rewardValue: string;
};

export type TaskDTO = {
  taskId: string;
  title: string;
  narrative: string;
  interactionType: string;
  interactionTargetId: string | null;
  requiredPlayerLevel: number;
  timeLimitMinutes: number | null;
  rewardType: string;
  rewardValue: string;
};
