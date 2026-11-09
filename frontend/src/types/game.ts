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
  | 'saveError';

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
}

export interface IGameDefinitionWindows {
  showGameDefinitionView(): void;
  showGameParametersView(): void;
  showParametersSavedMessageDialog(): void;
  showIncorrectDataMessageDialog(): void;
  showGameSavedMessageDialog(): void;
  showGameSubmittedMessageDialog(): void;
  showSaveErrorMessageDialog(): void;
}

export const GAME_CATEGORIES = [
  'Fantasy',
  'Science Fiction',
  'Historyczna',
  'Kryminalna',
  'Horror',
  'Przygodowa',
] as const;

export type GameCategory = (typeof GAME_CATEGORIES)[number];
