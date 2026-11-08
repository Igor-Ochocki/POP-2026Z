export type ActionType =
  | 'MOVEMENT'
  | 'ATTACK'
  | 'USE_ITEM'
  | 'DIALOGUE'
  | 'CUSTOM'
  |'MINI_GAME';

export type EffectKind =
  | 'CHANGE_STAT'
  | 'ADD_ITEM'
  | 'REMOVE_ITEM'
  | 'CHANGE_LOCATION'
  | 'SET_FLAG'
  |'START_MINI_GAME';

export type ActionDefinitionPanelTypes = 'gameDefinition' | 'actionForm';

export type ActionDefinitionDialogTypes =
  | 'incompleteData'
  | 'actionSaved'
  | 'saveError';

export interface ActionForm {
  name: string;
  type: ActionType | '';
  effectKind: EffectKind | '';
  effectValue: string;
}

export interface ActionDto {
  id?: string;
  gameId: string;
  name: string;
  type: ActionType;
  effectKind: EffectKind;
  effectValue: string;
}

export interface ActionDefinitionViewModel {
  gameId: string;
  activePanelType: ActionDefinitionPanelTypes;
  isSubmitting: boolean;
  dialogType: ActionDefinitionDialogTypes | null;
  form: ActionForm;
}

export interface IActionDefinitionWindows {
  showGameDefinitionView(): void;
  showActionFormView(gameId: string): void; // było: ()
  showActionSavedMessageDialog(): void;
  showIncompleteActionDataMessageDialog(): void;
  showActionSaveErrorMessageDialog(): void;
  hideDialogs(): void; // nowa
}

export interface IActionDefinitionActions {
  onAddAction(gameId: string): void; // było: ()
  onChangeParameter(field: string, value: string | boolean): void;
  onSaveAction(): void;
  onCancelActionDefinition(): void;
  onActionSavedMessageDialogConfirm(): void;
  onIncompleteActionDataMessageDialogConfirm(): void;
  onActionSaveErrorMessageDialogConfirm(): void;
}
