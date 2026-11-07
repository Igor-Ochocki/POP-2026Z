export type INewTaskActions = {
  onSubmitNewTask: () => void;
  onCancelNewTask: () => void;
  onCancelNewTaskConfirm: () => void;
  onCancelNewTaskCancel: () => void;
  onNewTaskSuccessMessageDialogConfirm: () => void;
  onIncorrectDataMessageDialogConfirm: () => void;
  onConflictMessageDialogConfirm: () => void;

  onTitleChanged: (title: string) => void;
  onNarrativeChanged: (narrative: string) => void;
  onRewardTypeSelected: (rewardType: string) => void;
  onRewardValueChanged: (rewardValue: string) => void;
  onRequiredPlayerLevelChanged: (requiredPlayerLevel: number) => void;
  onInteractionTypeSelected: (interactionType: string) => void;
  onTimeLimitMinutesChanged: (timeLimitMinutes: number) => void;
};

export type INewTaskViewmodel = {
  title: string;
  narrative: string;
  rewardType: string;
  rewardValue: string;
  requiredPlayerLevel: number;
  interactionType: string;
  timeLimitMinutes: number | null;
};

export type INewTaskWindows = {
  showNewTaskView: () => void;
  showCancelNewTaskConfirmationDialog: () => void;
  showConflictMessageDialog: () => void;
  showIncorrectDataMessageDialog: () => void;
  showNewTaskSuccessMessageDialog: () => void;
};
