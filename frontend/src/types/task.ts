export type TaskDTO = {
  taskId: string;
  title: string;
  narrative: string;
  interactionType: string;
  interactionTargetId: string;
  requiredPlayerLevel: number;
  timeLimitMinutes: number;
  rewardType: string;
  rewardValue: string;
};
