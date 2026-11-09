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

export interface GameCreateDTO {
  title: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
  durationMinutes: number;
  requiresInvitation: boolean;
  tags: string[];
}

export interface GameResponseDTO extends GameCreateDTO {
  gameId: string;
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

export type GameDefinitionPanelTypes = 'definition' | 'parameters';

export type GameDefinitionDialogTypes =
  | 'parametersSaved'
  | 'incorrectData'
  | 'gameSaved'
  | 'gameSubmitted'
  | 'saveError'
  | 'loadError';

export interface GameDefinitionViewModel {
  activePanelType: GameDefinitionPanelTypes;
  activeGame: GameMetadataDTO | null;
  parametersForm: GameParametersForm;
  validationErrors: GameParametersErrors;
  isSubmitting: boolean;
  dialogType: GameDefinitionDialogTypes | null;
}

export interface IGameDefinitionActions {
  onCreateGame(): void;
  onOpenGame(gameId: string): void;
  onEditParameters(): void;
  onChangeParameter<K extends keyof GameParametersForm>(
    field: K,
    value: GameParametersForm[K],
  ): void;
  onSaveMetadata(): void;
  onParametersSavedMessageDialogConfirm(): void;
  onIncorrectDataMessageDialogConfirm(): void;
  onSaveDraft(): void;
  onSubmitForReview(): void;
  onSaveErrorMessageDialogConfirm(): void;
  onLoadErrorMessageDialogConfirm(): void;
}

export interface IGameDefinitionWindows {
  showGameDefinitionView(): void;
  showGameParametersView(): void;
  showParametersSavedMessageDialog(): void;
  showIncorrectDataMessageDialog(): void;
  showGameSavedMessageDialog(): void;
  showGameSubmittedMessageDialog(): void;
  showSaveErrorMessageDialog(): void;
  showLoadErrorMessageDialog(): void;
}

// Backend GameStatus -> label used in the scenarios.
const GAME_STATUS_LABELS: Record<string, string> = {
  Draft: 'W edycji',
  Submitted: 'Oczekuje na weryfikację',
  Rejected: 'Odrzucona',
  Approved: 'Zatwierdzona',
};

export const gameStatusLabel = (status: string): string =>
  GAME_STATUS_LABELS[status] ?? status;

export const GAME_CATEGORIES = [
  'Fantasy',
  'Science Fiction',
  'Historyczna',
  'Kryminalna',
  'Horror',
  'Przygodowa',
] as const;

export type GameCategory = (typeof GAME_CATEGORIES)[number];
