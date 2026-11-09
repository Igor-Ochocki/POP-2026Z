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
  onCancelActionDefinition(): void;
  onActionSavedMessageDialogConfirm(): void;
  onIncompleteActionDataMessageDialogConfirm(): void;
  onActionSaveErrorMessageDialogConfirm(): void;
}

export interface IActionDefinitionWindows {
  showGameDefinitionView(): void;
  showActionDefinitionView(gameId: string): void;
  showActionSavedMessageDialog(): void;
  showIncompleteActionDataMessageDialog(): void;
  showActionSaveErrorMessageDialog(): void;
  hideDialogs(): void;
}
