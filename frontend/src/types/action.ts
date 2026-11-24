// Values accepted by the backend (ActionType / EffectKind enums).
export type ActionType =
  'movement' | 'attack' | 'useItem' | 'dialogue' | 'custom' | 'miniGame';

export type EffectKind =
  | 'changeStat'
  | 'addItem'
  | 'removeItem'
  | 'changeLocation'
  | 'setFlag'
  | 'startMiniGame';

export const actionTypeLabels: Record<ActionType, string> = {
  movement: 'ruch',
  attack: 'atak',
  useItem: 'użycie przedmiotu',
  dialogue: 'dialog',
  custom: 'własna',
  miniGame: 'minigra',
};

export const effectKindLabels: Record<EffectKind, string> = {
  changeStat: 'zmiana statystyki',
  addItem: 'dodanie przedmiotu',
  removeItem: 'usunięcie przedmiotu',
  changeLocation: 'zmiana lokacji',
  setFlag: 'ustawienie flagi',
  startMiniGame: 'rozpoczęcie minigry',
};

export interface ActionCreateDTO {
  gameId: string;
  name: string;
  actionType: ActionType;
  outcomeType: EffectKind;
  outcomeValue: string;
}

export interface ActionDTO extends ActionCreateDTO {
  actionId: string;
}

export interface ActionForm {
  name: string;
  actionType: ActionType | '';
  outcomeType: EffectKind | '';
  outcomeValue: string;
}

export type ActionDefinitionDialogTypes =
  'incompleteData' | 'actionSaved' | 'saveError';

export interface ActionDefinitionViewModel {
  gameId: string;
  form: ActionForm;
  isSubmitting: boolean;
  dialogType: ActionDefinitionDialogTypes | null;
}

export interface IActionDefinitionActions {
  onAddAction(gameId: string): void;
  onChangeParameter<K extends keyof ActionForm>(
    field: K,
    value: ActionForm[K],
  ): void;
  onSaveAction(): void;
  onIncompleteActionDataMessageDialogConfirm(): void;
  onActionSaveErrorMessageDialogConfirm(): void;
}

export interface IActionDefinitionWindows {
  showActionDefinitionView(gameId: string): void;
  showActionSavedMessageDialog(): void;
  showIncompleteActionDataMessageDialog(): void;
  showActionSaveErrorMessageDialog(): void;
  hideDialogs(): void;
}

export type IDisplayActionsWindows = {
  showDisplayActionsView: () => void;
};

export type IDisplayActionsActions = {
  onDisplayActionsSelect: () => void;
};

export type DisplayActionsViewModel = {
  actions: ActionDTO[];
  gameId: string;
};
