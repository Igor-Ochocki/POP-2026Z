export type GameStatus = 'W edycji' | 'Oczekuje na weryfikację';

export interface GameMetadataDTO {
  gameId: string;
  title: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
  durationMinutes: number;
  requiresInvitation: boolean;
  tags: string[];
  status: string;
}

export interface GameParametersForm {
  title: string;
  description: string;
  category: GameCategory | '';
  minPlayers: string;
  maxPlayers: string;
  durationMinutes: string;
  requiresInvitation: boolean;
}

export type GameParametersErrors = Partial<
  Record<keyof GameParametersForm, string>
>;

export type GameDefinitionPanel = 'definition' | 'parameters';

export type GameDefinitionDialog =
  | 'parametersSaved'
  | 'incorrectData'
  | 'gameSaved'
  | 'gameSubmitted'
  | 'saveError';

export interface GameDefinitionViewModel {
  activePanel: GameDefinitionPanel;
  activeGame: GameMetadataDTO | null;
  parametersForm: GameParametersForm;
  validationErrors: GameParametersErrors;
  isSubmitting: boolean;
  dialog: GameDefinitionDialog | null;
}

export interface IGameDefinitionActions {
  onEditParameters(): void;
  onChangeParameter<K extends keyof GameParametersForm>(
    field: K,
    value: GameParametersForm[K],
  ): void;
  onSaveMetadata(): void;
  onParametersSavedMessageDialogConfirm(): void;
  onIncorrectDataMessageDialogConfirm(): void;
  onAddSensor(): void;
  onEditScenario(): void;
  onSaveDraft(): void;
  onGameSavedMessageDialogConfirm(): void;
  onSubmitForReview(): void;
  onGameSubmittedMessageDialogConfirm(): void;
  onSaveErrorMessageDialogConfirm(): void;
  onCancelGameCreation(): void;
}

export interface IGameDefinitionWindows {
  showCreatorPanelView(): void;
  showGameListView(): void;
  showGameDefinitionView(): void;
  showGameParametersView(): void;
  showSensorDefinitionView(): void;
  showScenarioEditorView(): void;
  showParametersSavedMessageDialog(): void;
  showIncorrectDataMessageDialog(errors: GameParametersErrors): void;
  showGameSavedMessageDialog(): void;
  showGameSubmittedMessageDialog(): void;
  showSaveErrorMessageDialog(): void;
}

export const GAME_CATEGORIES = [
  'Fantasy',
  'Science fiction',
  'Historyczna',
  'Kryminalna',
  'Horror',
  'Przygodowa',
] as const;

export type GameCategory = (typeof GAME_CATEGORIES)[number];
