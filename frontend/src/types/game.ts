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
  category: string;
  minPlayers: string;
  maxPlayers: string;
  durationMinutes: string;
  requiresInvitation: boolean;
}

export type GameParametersErrors = Partial<
  Record<keyof GameParametersForm, string>
>;

export type GameDefinitionPanel = 'definition' | 'parameters';

export interface GameDefinitionDialog {
  title: string;
  message: string;
  redirectTo: string | null;
  returnToDefinition?: boolean;
}

export interface GameDefinitionViewModel {
  activePanel: GameDefinitionPanel;
  activeGame: GameMetadataDTO | null;
  parametersForm: GameParametersForm;
  validationErrors: GameParametersErrors;
  isDirty: boolean;
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
  onSaveDraft(): void;
  onSubmitForReview(): void;
  onCancelGameCreation(): void;
  onOpenScenarioEditor(): void;
  onOpenMapEditor(): void;
  onOpenActionDefinition(): void;
  onCloseDialog(): void;
}

// TODO: replace with categories from backend once they are defined
export const GAME_CATEGORIES = [
  'Fantasy',
  'Science fiction',
  'Historyczna',
  'Kryminalna',
  'Horror',
  'Przygodowa',
];
