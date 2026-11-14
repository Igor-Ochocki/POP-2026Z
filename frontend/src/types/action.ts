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

export function actionTypeDisplay(actionType: ActionType) {
  switch (actionType) {
    case 'movement':
      return 'ruch';
    case 'attack':
      return 'atak';
    case 'useItem':
      return 'wykorzystanie przedmiotu';
    case 'dialogue':
      return 'dialog';
    case 'custom':
      return 'niestandardowa';
    case 'miniGame':
      return 'minigra';
  }
}

export function effectKindDisplay(effectKind: EffectKind) {
  switch (effectKind) {
    case 'changeStat':
      return 'zmiana statystyki';
    case 'addItem':
      return 'dodanie przedmiotu';
    case 'removeItem':
      return 'utrata przedmiotu';
    case 'changeLocation':
      return 'zmiana położenia';
    case 'setFlag':
      return 'ustawienie flagi';
    case 'startMiniGame':
      return 'rozpoczęcie minigry';
  }
}

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
};
