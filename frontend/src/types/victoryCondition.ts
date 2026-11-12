export type VictoryConditionTarget = 'faction' | 'character';

export type VictoryConditionType =
  'completeTasks' | 'reachScore' | 'eliminateFaction' | 'surviveTime';

export const victoryConditionTargetLabels: Record<
  VictoryConditionTarget,
  string
> = {
  faction: 'frakcja',
  character: 'postać',
};

export const victoryConditionTypeLabels: Record<VictoryConditionType, string> =
  {
    completeTasks: 'wykonanie zadań',
    reachScore: 'zdobycie punktów',
    eliminateFaction: 'pokonanie frakcji',
    surviveTime: 'przetrwanie czasu',
  };

export type VictoryConditionCreateDTO = {
  name: string;
  target: VictoryConditionTarget;
  conditionType: VictoryConditionType;
  value: string;
};

export type VictoryConditionDTO = VictoryConditionCreateDTO & {
  victoryConditionId: string;
};

type VictoryConditionForm = {
  name: string;
  target: VictoryConditionTarget | null;
  conditionType: VictoryConditionType | null;
  value: string;
};

export type IVictoryConditionActions = {
  onVictoryConditionSelect: () => void;

  onSubmitVictoryCondition: () => void;
  onCancelVictoryCondition: () => void;
  onCancelVictoryConditionConfirm: () => void;
  onCancelVictoryConditionCancel: () => void;
  onVictoryConditionSuccessMessageDialogConfirm: () => void;
  onIncorrectDataMessageDialogConfirm: () => void;
  onConflictMessageDialogConfirm: () => void;
  onSaveErrorMessageDialogConfirm: () => void;

  onChangeParameter: (
    field: keyof VictoryConditionForm,
    value: VictoryConditionForm[keyof VictoryConditionForm],
  ) => void;
};

export type VictoryConditionViewModel = VictoryConditionForm & {
  cancelVictoryConditionConfirmationDialogOpen: boolean;
  victoryConditionSuccessMessageDialogOpen: boolean;
  conflictMessageDialogOpen: boolean;
  incorrectDataMessageDialogOpen: boolean;
  saveErrorMessageDialogOpen: boolean;
};

export type IVictoryConditionWindows = {
  showVictoryConditionView: () => void;
  showCancelVictoryConditionConfirmationDialog: () => void;
  showConflictMessageDialog: () => void;
  showIncorrectDataMessageDialog: () => void;
  showVictoryConditionSuccessMessageDialog: () => void;
  showSaveErrorMessageDialog: () => void;
  hideDialogs: () => void;
};
