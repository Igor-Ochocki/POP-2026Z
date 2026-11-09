type NewTaskForm = {
  title: string;
  narrative: string;
  rewardType: string;
  rewardValue: string;
  requiredPlayerLevel: number;
  interactionType: string;
  timeLimitMinutes: number | null;
};

export type INewTaskActions = {
  onNewTaskSelect: () => void;

  onSubmitNewTask: () => void;
  onCancelNewTask: () => void;
  onCancelNewTaskConfirm: () => void;
  onCancelNewTaskCancel: () => void;
  onNewTaskSuccessMessageDialogConfirm: () => void;
  onIncorrectDataMessageDialogConfirm: () => void;
  onConflictMessageDialogConfirm: () => void;
  onSaveErrorMessageDialogConfirm: () => void;

  onChangeParameter: (
    field: keyof NewTaskForm,
    value: NewTaskForm[keyof NewTaskForm],
  ) => void;
};

export type NewTaskViewModel = NewTaskForm & {
  cancelNewTaskConfirmationDialogOpen: boolean;
  newTaskSuccessMessageDialogOpen: boolean;
  conflictMessageDialogOpen: boolean;
  incorrectDataMessageDialogOpen: boolean;
  saveErrorMessageDialogOpen: boolean;
};

export type INewTaskWindows = {
  showNewTaskView: () => void;
  showCancelNewTaskConfirmationDialog: () => void;
  showConflictMessageDialog: () => void;
  showIncorrectDataMessageDialog: () => void;
  showNewTaskSuccessMessageDialog: () => void;
  showSaveErrorMessageDialog: () => void;
  hideDialogs: () => void;
};
