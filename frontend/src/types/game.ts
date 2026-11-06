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

export interface TaskDTO {
  taskId: string;
  title: string;
  narrative: string;
  interactionType: string;
  interactionTargetId: string;
  requiredPlayerLevel: number;
  timeLimitMinutes: number | null;
  rewardType: string;
  rewardValue: string;
}

export interface ScenarioDetailDTO {
  scenarioId: string;
  gameId: string;
  tasks: TaskDTO[];
  victoryConditions: string[];
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
  | 'saveError'
  | 'submitError';

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
  onEditScenario(game: GameMetadataDTO): void;
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
  showScenarioEditorView(game: GameMetadataDTO): void;
  showParametersSavedMessageDialog(): void;
  showIncorrectDataMessageDialog(errors: GameParametersErrors): void;
  showGameSavedMessageDialog(): void;
  showGameSubmittedMessageDialog(): void;
  showSaveErrorMessageDialog(): void;
  showSubmitErrorMessageDialog(): void;
}

export interface ScenarioEditorViewModel {
  activeGame: GameMetadataDTO | null;
  scenario: ScenarioDetailDTO | null;
  isLoading: boolean;
  errorMessage: string | null;
}

export interface IScenarioEditorActions {
  onOpenScenarioEditor(gameId: string): void;
  onAddTask(): void;
  onAddVictoryCondition(): void;
  onCloseScenarioEditor(): void;
}

export interface IScenarioEditorWindows {
  showGameDefinitionView(activeGame: GameMetadataDTO | null): void;
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
